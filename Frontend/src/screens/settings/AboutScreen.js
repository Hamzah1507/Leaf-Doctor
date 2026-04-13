import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name="leaf" size={64} color="#2E7D32" />
                </View>
                <Text style={styles.appName}>LeafDoctor</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>

            <Text style={styles.description}>
                LeafDoctor is your personal plant care assistant.
                Using advanced AI, we help you diagnose plant diseases,
                calculate optimal fertilizer doses, and provide expert gardening advice.
            </Text>



            <Text style={styles.copyright}>
                © 2026 LeafDoctor. All rights reserved.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 30,
        paddingTop: 50,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 5,
    },
    version: {
        fontSize: 16,
        color: '#888',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 40,
    },
    linksContainer: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
    },
    copyright: {
        fontSize: 12,
        color: '#aaa',
    },
});

export default AboutScreen;
