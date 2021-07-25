import React, {Component} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

// Imported GiftedChat library
import {GiftedChat, Bubble} from 'react-native-gifted-chat'

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            name: this.props.route.params.name,
            bgColor: this.props.route.params.bgColor
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