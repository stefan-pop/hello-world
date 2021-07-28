import React, {Component} from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';

// Imported GiftedChat library
import {GiftedChat, Bubble} from 'react-native-gifted-chat'

// Import Firebase
import firebase from 'firebase';
import firestore from 'firebase';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAyxqm6wX3aATheBCHFEqVGZPgd-SNxnEc",
    authDomain: "chat-app-98f49.firebaseapp.com",
    projectId: "chat-app-98f49",
    storageBucket: "chat-app-98f49.appspot.com",
    messagingSenderId: "587311165676",
    appId: "1:587311165676:web:855ab4f0994487ce2575c9"
  };

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            uid: '',
            loggedInText: 'Loading...',
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

    componentDidMount() {
        // Set either the name of a user if it's present or "Chat", in the navigation bar
        this.props.navigation.setOptions({title: !this.state.name ? 'Chat' : this.state.name });

        // Anonym authentication
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
			if (!user) {
				await firebase.auth().signInAnonymously();
			};
			// update user state with curently active user data
			this.setState({
				uid: user.uid,
				loggedInText: 'Welcome',
			});
			// create a reference to the active user's documents
			this.referenceUserData = firebase.firestore().collection('messages').where("user._id", "==", this.state.uid);
			// listener for updates in collection belonging to the active user
			this.unsubscribeUser = this.referenceUserData.orderBy("createdAt", "desc").onSnapshot(this.onCollectionUpdate);
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
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: data.user,
			});
		});
		this.setState({
			messages,
		});
	}

    // add a document to Firestore
	addMessage(message) {   
		this.referenceMessages.add({
            _id: message._id,
			text: message.text,
			createdAt: message.createdAt,
			user: message.user,
		});
	}


    // function that takes one parameter reprezenting the message a user sends. Whatever the user sends will keep getting appended to the state "messages".
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
        
        // Call the addMessage function with the message in the bubble as parameter
        this.addMessage(messages[0])
    }

    // customize the bubble's background color of the sender (right)
    renderBubble(props) {
        return (
            <Bubble 
                {...props}
                wrapperStyle={{
                    right: {backgroundColor: '#000'},
                    left: {backgroundColor: '#7df5f3'}
                }}
            />
        )
    }

    render() {
        // get the variables by destructuring the state object
        const {bgColor, messages, uid, name} = this.state;

        return (
            // The backgroundColor is added dinamically therefore I am using an array inside the style object
            <View style={[styles.container, {backgroundColor: bgColor}]}>
                <GiftedChat 
                    renderBubble={this.renderBubble.bind(this)}
                    messages={messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: uid,
                        name: name,
                        avatar: 'https://placeimg.com/140/140/any'
                    }}
                />
                {/* avoid keyboard hidding the message input on some android devices */}
                { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
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