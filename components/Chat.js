import React, {Component} from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, LogBox, Button } from 'react-native';
import PropTypes from 'prop-types';

// Imported GiftedChat library
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat'

// Import Firebase
import firebase from 'firebase';

// Import AsyncSotrage (local storage for React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import NetInfo (to see if a user is on or offline)
import NetInfo from '@react-native-community/netinfo';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAyxqm6wX3aATheBCHFEqVGZPgd-SNxnEc",
    authDomain: "chat-app-98f49.firebaseapp.com",
    projectId: "chat-app-98f49",
    storageBucket: "chat-app-98f49.appspot.com",
    messagingSenderId: "587311165676",
    appId: "1:587311165676:web:855ab4f0994487ce2575c9"
  };

// ignore a warning that aparently can't be fixed
LogBox.ignoreLogs(['Setting a timer']);

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            uid: '',
            connection: false,
            name: this.props.route.params.name,
            bgColor: this.props.route.params.bgColor
        }

        // Initialize the app
        if (!firebase.apps.length){
			firebase.initializeApp(firebaseConfig);
		}

        // Reference the "messages" collection of the db
        this.referenceMessages = firebase.firestore().collection('messages');
    }

    // Define the listeners for authentication and firebase updates
    unsubscribeUser = function(){};
    authUnsubscribe = function(){};

    // Save messages in AsyncStorage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message)
        }
    }

    // Function that updates the "messages" and the "uid" state with data saved in AsyncStorage
    async getMessages() {
        let messages = '';
        let uid = '';
        try {
            // get the messages from AsyncStorage
            messages = await AsyncStorage.getItem('messages') || [];
            // get the uid from Async storage and update the state so the GiftedChat will render the messages in different bubbles
            uid = await AsyncStorage.getItem('uid')
            this.setState({
                uid,
                messages: JSON.parse(messages),
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    // Delete messages from AsyncStorage and from the state
    // async deleteMessages() {
    //     try {
    //         await AsyncStorage.removeItem('messages');
    //         this.setState({
    //             messages: []
    //         })
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }


    componentDidMount() {
        // Set either the name of a user if it's present or "Chat", in the navigation bar
        this.props.navigation.setOptions({title: !this.state.name ? 'Chat' : this.state.name });

        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                this.setState({ connection: true });
                // Anonym authentication
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
			        if (!user) {
                        try {
                            await firebase.auth().signInAnonymously();
                        } catch (error) {
                            console.log(error)
                        }
			        };

                    // update user state with curently active user id and connection
                    this.setState({
                        uid: user.uid,
                    });
                    
                    // store the uid in AsyncStorage
                    await AsyncStorage.setItem('uid', user.uid);
                    
                    // listener for updates in the collection "messages"
                    this.unsubscribeUser = this.referenceMessages.orderBy("createdAt", "desc").onSnapshot(this.onCollectionUpdate);
                });
            } else {
                // if no internet connection updated the state accordingly and get the data from AsyncStorage
                this.setState({ connection: false });
                this.getMessages();
            }
        });
    }

    componentWillUnmount() {
        // Stop the listeners
        this.authUnsubscribe();
        this.unsubscribeUser();
    }

    // get data from database each time the database gets updated
	onCollectionUpdate = (querySnapshot) => {
		const messages = [];
		// go through each document
		querySnapshot.forEach((doc) => {
			// get the QueryDocumentSnapshot's data
			let data = doc.data();
			messages.push({
                _id: data._id,
                text: data.text || '',
                createdAt: data.createdAt.toDate(),
                user: data.user,
                image: data.image || null,
                location: data.location || null,
			});
		});
		this.setState({
			messages,
		}, () => this.saveMessages()); // Update the AsyncStorage with the latest changes in firebase
	}

    // add a document to Firestore
	addMessage(message) {   
		this.referenceMessages.add({
            _id: message._id,
			text: message.text || '',
			createdAt: message.createdAt,
			user: message.user,
            image: message.image || null,
            location: message.location || null,
		});
	}


    // function that takes one parameter reprezenting the message a user sends. Whatever the user sends will keep getting appended to the state "messages".
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
             // Call the addMessage function with the message in the bubble as parameter
            this.addMessage(messages[0])
            // Save each sent message in AsyncStorage
            this.saveMessages();
        });
    }

    // customize the bubble's background color of the sender (right)
    renderBubble(props) {
        return (
            <Bubble 
                {...props}
                wrapperStyle={{
                    right: {backgroundColor: '#c4c4bb'},
                    left: {backgroundColor: '#edf5d3'}
                }}
            />
        )
    }

    // Don't display the message input if no internet connection
    renderInputToolbar = props => {
        if (this.state.connection === false) {
            // if no connection return nothing
        } else {
            return <InputToolbar {...props} />
        }
    }

    render() {
        // get the variables by destructuring the state object
        const {bgColor, messages, uid, name} = this.state;

        return (
            // The backgroundColor is added dinamically therefore I am using an array inside the style object
            <View style={[styles.container, {backgroundColor: bgColor}]}>
                <GiftedChat 
                    showUserAvatar={true}
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar}
                    messages={messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: uid,
                        name: name,
                        avatar: ''
                    }}
                />
                {/* avoid keyboard hidding the message input on some android devices */}
                { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }

                {/* Uncomment this button and the function it is calling to clear the AsyncStorage of the device */}
                {/* <Button title="delete" onPress={() => this.deleteMessages()} /> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

Chat.propTypes = {
    name: PropTypes.string,
    bgColor: PropTypes.string
}