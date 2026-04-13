import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth);

    const [name, setName] = useState(user?.username || user?.full_name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleUpdate = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter your full name');
            return;
        }

        const passwordChanged = password.length > 0;

        if (passwordChanged && !currentPassword) {
            Alert.alert('Required', 'Please enter your current password to set a new one');
            return;
        }

        const profileData = {
            username: name,
            email: user?.email, // keep existing email unchanged
            currentPassword: currentPassword || undefined,
            ...(passwordChanged ? { password } : {}),
        };

        const result = await dispatch(updateProfile(profileData));
        if (updateProfile.fulfilled.match(result)) {
            Alert.alert('✅ Success', 'Profile updated successfully!');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.payload || 'Failed to update profile');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Ionicons name="person-circle" size={80} color="#2E7D32" />
                    <Text style={styles.headerSubtitle}>Update your account details below</Text>
                </View>

                <View style={styles.form}>

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            returnKeyType="next"
                        />
                    </View>

                    {/* Current Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            Current Password{' '}
                            <Text style={styles.required}>(required to set new password)</Text>
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.inputFlex}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                secureTextEntry={!showCurrentPassword}
                                returnKeyType="next"
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <Ionicons
                                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            New Password{' '}
                            <Text style={styles.optional}>(Optional)</Text>
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.inputFlex}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Leave blank to keep same"
                                secureTextEntry={!showNewPassword}
                                returnKeyType="done"
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Ionicons
                                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { flexGrow: 1 },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerSubtitle: { marginTop: 10, color: '#666', fontSize: 14 },
    form: { padding: 20 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    required: { fontSize: 11, color: '#e53935', fontWeight: 'normal' },
    optional: { fontSize: 11, color: '#888', fontWeight: 'normal' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    inputFlex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    eyeBtn: { paddingLeft: 8, paddingVertical: 12 },
    button: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;