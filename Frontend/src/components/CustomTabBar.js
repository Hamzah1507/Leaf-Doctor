import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    let iconName;
                    if (route.name === 'Home') {
                        iconName = isFocused ? 'leaf' : 'leaf-outline';
                    } else if (route.name === 'Scan') {
                        iconName = isFocused ? 'scan' : 'scan-outline';
                    } else if (route.name === 'Community') { // ✅ Added
                        iconName = isFocused ? 'people' : 'people-outline';
                    } else if (route.name === 'Tools') {
                        iconName = isFocused ? 'calculator' : 'calculator-outline';
                    } else if (route.name === 'Chat') {
                        iconName = isFocused ? 'chatbubble' : 'chatbubble-outline';
                    } else if (route.name === 'Profile') {
                        iconName = isFocused ? 'person' : 'person-outline';
                    } else {
                        // History, DiseaseLibrary — hidden, skip
                        return null;
                    }

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate({ name: route.name, merge: true });
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabButton}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                                <Ionicons name={iconName} size={24} color={isFocused ? '#fff' : '#2E7D32'} />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    tabButton: {
        paddingHorizontal: 5,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 25,
        width: 50,
        height: 50,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    iconContainerFocused: {
        backgroundColor: '#2E7D32',
    },
});

export default CustomTabBar;