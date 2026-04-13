import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

const LanguageSettingsScreen = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Language</Text>

            <TouchableOpacity style={styles.option} onPress={() => changeLanguage('en')}>
                <Text style={styles.optionText}>English {i18n.language === 'en' && '✓'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => changeLanguage('hi')}>
                <Text style={styles.optionText}>हिंदी (Hindi) {i18n.language === 'hi' && '✓'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => changeLanguage('gu')}>
                <Text style={styles.optionText}>ગુજરાતી (Gujarati) {i18n.language === 'gu' && '✓'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    option: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 16,
    },
});

export default LanguageSettingsScreen;
