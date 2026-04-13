import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ScanPlantScreen from '../screens/ScanPlantScreen';
import AnalysisResultsScreen from '../screens/AnalysisResultsScreen';

const Stack = createNativeStackNavigator();

const BackButton = ({ navigation }) => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#2E7D32" />
    </TouchableOpacity>
);

const PlantNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerLeft: () =>
                    navigation.canGoBack() ? <BackButton navigation={navigation} /> : null,
                headerStyle: { backgroundColor: 'transparent' },
                headerShadowVisible: false,
            })}
        >
            {/* ScanPlant is the root — no back button needed */}
            <Stack.Screen
                name="ScanPlant"
                component={ScanPlantScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AnalysisResults"
                component={AnalysisResultsScreen}
                options={{headerShown:false}}
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

export default PlantNavigator;