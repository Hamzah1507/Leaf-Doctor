import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const FeedbackScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert(t('error'), t('pleaseEnterYourMessage'));
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: user?.uid,
                username: user?.username || user?.email?.split('@')[0],
                email: user?.email,
                message: message.trim(),
                rating: rating,
                createdAt: new Date().toISOString(),
            });
            Alert.alert(t('success'), t('thankYouForYourFeedback'));
            navigation.goBack();
        } catch (error) {
            console.error('Feedback Error:', error);
            Alert.alert(t('error'), t('failedToSubmitFeedback'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.iconHeader}>
                    <Ionicons name="chatbubbles-outline" size={60} color="#2E7D32" />
                    <Text style={styles.headerTitle}>{t('sendFeedback')}</Text>
                    <Text style={styles.headerSubtitle}>{t('shareThoughtsImproveApp')}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Rating</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={32}
                                    color="#f4a62a"
                                    style={{ marginHorizontal: 4 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>{t('yourMessage')}</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={6}
                        placeholder={t('writeYourFeedbackHere')}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.buttonRow}>
                                <Ionicons name="send" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>{t('submitFeedback')}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 120,
    },
    iconHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 30,
    },
    form: {
        width: '100%',
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        height: 150,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#81C784',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FeedbackScreen;