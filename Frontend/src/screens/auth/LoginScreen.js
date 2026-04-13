import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('missingFields'), t('missingFieldsMessage') || 'Please fill to all fields.');
            return;
        }

        const resultAction = await dispatch(loginUser({ email, password }));

        if (loginUser.fulfilled.match(resultAction)) {
            navigation.replace('Main');
        } else {
            Alert.alert(
                t('error'),
                resultAction.payload || 'Login failed'
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <LinearGradient
                colors={['#e0f7fa', '#e8f5e9', '#ffffff']}
                style={styles.background}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    <View style={styles.logoContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="leaf" size={32} color="#2E7D32" />
                            <Text style={styles.logoText}>LeafDoctor</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{t('welcomeBack')}</Text>
                    <Text style={styles.subtitle}>{t('signInSubtitle')}</Text>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="mail-outline" size={20} color="#00bf63" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={t('emailPlaceholder')}
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="lock-closed-outline" size={20} color="#00bf63" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={t('passwordPlaceholder')}
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>{t('signIn')}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>{t('or')}</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Footer Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('noAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.linkText}>{t('signup')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 25, // Rounded card
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginLeft: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#003300',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#00bf63', // Green subtitle
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9', // Very light green bg for input
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        width: '100%',
    },
    inputIcon: {
        padding: 15,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingRight: 10,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 15,
    },
    button: {
        backgroundColor: '#00904a', // Slightly darker green for button
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#00bf63",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 20,
        opacity: 0.5,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    orText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    linkText: {
        color: '#00904a',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LoginScreen;
