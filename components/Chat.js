import React, {Component} from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.route.params.name,
            bgColor: this.props.route.params.bgColor
        }
    }

    componentDidMount() {
        this.props.navigation.setOptions({title: !this.state.name ? 'Chat' : this.state.name })
    }

    render() {
        const {bgColor} = this.state;

        return (
            <View style={[styles.container, {backgroundColor: bgColor}]}>
                <Text>Chat Component</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});