import React, {Component} from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Import Firebase
import firebase from 'firebase';

export default class CustomActions extends Component {

    // Choose image from device library
	pickImage = async () => {
		const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        try {
            if (status === 'granted') {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));
    
                if (!result.cancelled) {
                    const imageUrl = await this.uploadImageFetch(result.uri);
                    this.props.onSend({image: imageUrl});
                }
            }
        } catch (error) { console.log(error.message) }
	}

    // Access device's camera
    takePhoto = async () => {
		const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
        try {
            if (status === 'granted') {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));
    
                if (!result.cancelled) {
                    const imageUrl = await this.uploadImageFetch(result.uri);
                    this.props.onSend({image: imageUrl});
                }
            }
        } catch (error) { console.log(error.message) }
	}

    // Access device's location
    getLocation = async () => {
		const {status} = await Permissions.askAsync(Permissions.LOCATION);
		try {
            if (status === 'granted') {
                const result = await Location.getCurrentPositionAsync({})
                .catch(error => console.log(error));
    
                const longitude = JSON.stringify(result.coords.longitude);
                const latitude = JSON.stringify(result.coords.latitude)
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        },
                    })
                }
            }
        } catch (error) { console.log(error.message) }
	}

    // Set of comunication features (select image from librry, access device's camera, access device's location) wrapped in an ActionSheet
    onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log('user wants to pick an image');
                        return this.pickImage();
                    case 1:
                        console.log('user wants to take a photo');
                        return this.takePhoto();
                    case 2: 
                        console.log('user wants to get their location');
                        return this.getLocation();
                }
            }
        )
    }

    //Upload picture to firebse cloud storage
    uploadImageFetch = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(xhr.response);
            };
            xhr.onerror = function(e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });
        const imageNameBefore = uri.split("/");
        const imageName = imageNameBefore[imageNameBefore.length - 1];

        const ref = firebase.storage().ref().child(`images/${imageName}`);
        const snapshot = await ref.put(blob);
        blob.close();

        return await snapshot.ref.getDownloadURL();
    }

    render() {
        return(
            <TouchableOpacity 
                accessible={true}
                accessibilityLabel="More features"
                accessibilityHint="Send location, take photo, send images."
                style={[styles.container]} 
                onPress={this.onActionPress}
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        )
    }
}
