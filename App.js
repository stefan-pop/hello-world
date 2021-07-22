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

// create the navigator - (stored the method into a shorter variable for simplicity)
const Stack = createStackNavigator();

export default class HelloWorld extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<NavigationContainer>

				{/* Wrapped everything in Navigation Container and implemented the Stack Navigator */}
				<Stack.Navigator initialRouteName='Start'>
					<Stack.Screen name='Start' component={Start} />
					<Stack.Screen name='Chat' component={Chat} />
				</Stack.Navigator>

			</NavigationContainer>
		)
	}
}
