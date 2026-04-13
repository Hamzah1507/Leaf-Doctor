import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import LanguageSettingsScreen from '../screens/settings/LanguageSettingsScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

const BackButton = ({ navigation }) => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#2E7D32" />
    </TouchableOpacity>
);

const ProfileNavigator = () => {
    const { t } = useTranslation();

    return (
        <Stack.Navigator>
            {/* ✅ UserProfile: NO header — ProfileScreen has its own back button in the green banner */}
            <Stack.Screen
                name="UserProfile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />

            {/* Sub-screens: navigator header with custom back button */}
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={({ navigation }) => ({
                    title: t('editProfile'),
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleStyle: { color: '#1a1a1a', fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                })}
            />
            <Stack.Screen
                name="LanguageSettings"
                component={LanguageSettingsScreen}
                options={({ navigation }) => ({
                    title: t('language'),
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleStyle: { color: '#1a1a1a', fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                })}
            />
            <Stack.Screen
                name="HelpCenter"
                component={HelpCenterScreen}
                options={({ navigation }) => ({
                    title: t('helpCenter'),
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleStyle: { color: '#1a1a1a', fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                })}
            />
            <Stack.Screen
                name="Feedback"
                component={FeedbackScreen}
                options={({ navigation }) => ({
                    title: t('feedback'),
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleStyle: { color: '#1a1a1a', fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                })}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={({ navigation }) => ({
                    title: t('aboutLeafDoctor'),
                    headerLeft: () => <BackButton navigation={navigation} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerTitleStyle: { color: '#1a1a1a', fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                })}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    backButton: {
        backgroundColor: 'rgba(46,125,50,0.08)',
        borderRadius: 18,
        padding: 6,
        marginLeft: 2,
    },
});

export default ProfileNavigator;