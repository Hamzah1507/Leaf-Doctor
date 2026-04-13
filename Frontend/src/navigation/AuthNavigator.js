import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator();

const BackButton = ({ navigation }) => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#2E7D32" />
    </TouchableOpacity>
);

const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Login is root of auth — no back button */}
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* SignUp — show back button to return to Login */}
            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerBackVisible: false,
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerShadowVisible: false,
                })}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 6,
        marginLeft: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 3,
    },
});

export default AuthNavigator;