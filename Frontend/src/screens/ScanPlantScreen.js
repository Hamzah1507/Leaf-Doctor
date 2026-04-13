import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const ScanPlantScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraReady, setIsCameraReady] = useState(false);
    const cameraRef = useRef(null);

    // Reset camera ready state when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setIsCameraReady(false);
            // Small delay before marking ready to allow camera to stabilize
            const timer = setTimeout(() => setIsCameraReady(true), 500);
            return () => clearTimeout(timer);
        }, [])
    );

    const takePicture = async () => {
        if (!cameraRef.current || !isCameraReady) {
            Alert.alert('Camera Not Ready', 'Please wait a moment and try again.');
            return;
        }
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                skipProcessing: false, // false is more stable on most devices
            });
            navigation.navigate('AnalysisResults', { imageUri: photo.uri });
        } catch (error) {
            console.error('Failed to take picture:', error);
            Alert.alert('Camera Error', 'Could not capture image. Please try again.');
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to pick photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            navigation.navigate('AnalysisResults', { imageUri: result.assets[0].uri });
        }
    };

    useEffect(() => {
        if (route.params?.openPicker) {
            pickImage();
        }
    }, [route.params?.openPicker]);

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.message}>Requesting Camera Permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                ref={cameraRef}
                onCameraReady={() => setIsCameraReady(true)}
            />

            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                    <Ionicons name="images" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.captureButton, !isCameraReady && { opacity: 0.4 }]}
                    onPress={takePicture}
                    disabled={!isCameraReady}
                >
                    <View style={styles.captureInner} />
                </TouchableOpacity>

                <View style={{ width: 60 }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    message: { textAlign: 'center', paddingBottom: 10, color: '#fff' },
    camera: { flex: 1 },
    controlsContainer: {
        position: 'absolute',
        bottom: 150,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 30,
        zIndex: 10,
    },
    captureButton: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 6, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },
    captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
    galleryButton: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    permissionButton: {
        backgroundColor: '#2E7D32', padding: 15,
        borderRadius: 10, alignSelf: 'center', marginTop: 20,
    },
    permissionButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ScanPlantScreen;