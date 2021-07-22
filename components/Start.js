import React, {Component} from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default class Start extends Component {
    render() {
        return (
            <View>
                <Text>Start Component</Text>
                <Button 
                    title='Go to Chat'
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({});
