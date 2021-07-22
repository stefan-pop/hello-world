import React, {Component} from 'react';
import {View} from 'react-native';

// Importing the Start and Chat components
import Start from './components/Start';
import Chat from './components/Chat';

// import react native gesture handler
import 'react-native-gesture-handler';

// import react NavigationContainer and the type of navigator (Stack)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export default class HelloWorld extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View></View>
		)
	}
}
