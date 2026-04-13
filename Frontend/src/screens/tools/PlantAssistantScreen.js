import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
console.log('API KEY:', apiKey);

const PlantAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I'm your AI Plant Assistant powered by Groq. Ask me anything about plant diseases, gardening, or crop care!", sender: 'bot' },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async() => {
        if (inputText.trim().length === 0 || loading) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const question = inputText;
        setInputText('');
        setLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{
                            role: 'system',
                            content: 'You are an expert plant doctor and gardening assistant. Answer questions about plants, diseases, and gardening in 2-3 clear sentences. Be helpful and concise.'
                        },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 200,
                    temperature: 0.7,
                })
            });

            const data = await response.json();
            const botText = data?.choices?.[0]?.message?.content ||
                'Sorry, I could not get a response. Please try again.';
            const botMsg = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errMsg = { id: (Date.now() + 1).toString(), text: 'Connection error. Please check your internet and try again.', sender: 'bot' };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
            {item.sender === 'bot' && (
                <View style={styles.botAvatar}>
                    <Ionicons name="happy-outline" size={20} color="#2e7d32" />
                </View>
            )}
            <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
                    {item.text}
                </Text>
            </View>
            {item.sender === 'user' && (
                <View style={styles.userAvatar}>
                    <Ionicons name="person-outline" size={20} color="#555" />
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}>
            <LinearGradient colors={['#e0f7fa', '#e8f5e9', '#ffffff']} style={styles.gradientBackground} />

            <View style={styles.header}>
                {navigation?.canGoBack() && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
                        <Ionicons name="arrow-back" size={20} color="#003300" />
                    </TouchableOpacity>
                )}
                <View style={styles.headerCenter}>
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
                    </View>
                    <Text style={styles.headerTitle}>Ask the Expert</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color="#2e7d32" />
                    <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask about plant diseases..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={loading}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: '100%' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 8,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginRight: 46,
    },
    aiBadge: {
        backgroundColor: '#fff',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#b2dfdb',
        marginBottom: 6,
    },
    aiBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#00695c', letterSpacing: 1 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#003300' },
    list: { flex: 1, paddingHorizontal: 15 },
    listContent: { paddingBottom: 20 },
    messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#d6f0d9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f1f1', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    messageBubble: { maxWidth: '75%', padding: 15, borderRadius: 18, elevation: 1 },
    botBubble: { backgroundColor: '#fff', borderTopLeftRadius: 4 },
    userBubble: { backgroundColor: '#00bf63', borderBottomRightRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 22 },
    botMessageText: { color: '#333' },
    userMessageText: { color: '#fff' },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 5 },
    typingText: { marginLeft: 8, color: '#2e7d32', fontSize: 13 },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        marginBottom: 80,
    },
    input: { flex: 1, backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, maxHeight: 100, marginRight: 10, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 16, color: '#333' },
    sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#66bb6a', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    sendButtonDisabled: { backgroundColor: '#aaa' },
});

export default PlantAssistantScreen;