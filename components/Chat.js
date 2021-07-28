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
            name: this.props.route.params.name,
            bgColor: this.props.route.params.bgColor
        }

        // Initialize the app
        if (!firebase.apps.length){
			firebase.initializeApp(firebaseConfig);
		}

    }

    componentDidMount() {
        // Set either the name of a user if it's present or "Chat", in the navigation bar
        this.props.navigation.setOptions({title: !this.state.name ? 'Chat' : this.state.name })

        this.setState({
            messages: [
                // System message
                {
                    _id: 2,
                    text: 'This is a system message',
                    createdAt: new Date(),
                    system: true,
                },

                // Normal message
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                }
            ]
        })
    }

    // function that takes one parameter reprezenting the message a user sends. Whatever the user sends will keep getting appended to the state "messages".
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    // customize the bubble's background color of the sender (right)
    renderBubble(props) {
        return (
            <Bubble 
                {...props}
                wrapperStyle={{
                    right: {backgroundColor: '#000'}
                }}
            />
        )
    }

    render() {
        // get the variables by destructuring the state object
        const {bgColor, messages} = this.state;

        return (
            // The backgroundColor is added dinamically therefore I am using an array inside the style object
            <View style={[styles.container, {backgroundColor: bgColor}]}>
                <GiftedChat 
                    renderBubble={this.renderBubble.bind(this)}
                    messages={messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
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