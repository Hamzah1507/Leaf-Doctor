import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';
import SeasonalInsightsSection from '../components/SeasonalInsightsSection';

const HomeScreen = ({ navigation }) => {
    const { i18n } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState({ total: 0, healthy: 0, diseases: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [user?.uid])
    );

    React.useEffect(() => {
        fetchWeather();
    }, []);

    const fetchStats = async () => {
        try {
            if (!user?.uid) return;
            setLoadingStats(true);
            const q = query(collection(db, 'history'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            let total = 0, healthy = 0, diseases = 0;
            snapshot.forEach(doc => {
                total++;
                if (doc.data().isHealthy) healthy++;
                else diseases++;
            });
            setStats({ total, healthy, diseases });
        } catch (e) {
            console.log('Stats error:', e);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchWeather = async () => {
        try {
            let latitude = 23.0225, longitude = 72.5714, city = 'Ahmedabad';
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3000);
                const ipRes = await fetch('https://ip-api.com/json', { signal: controller.signal });
                clearTimeout(timeout);
                const ipData = await ipRes.json();
                if (ipData?.lat) { latitude = ipData.lat; longitude = ipData.lon; city = ipData.city || 'Your Location'; }
            } catch (e) { }
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );
            const data = await res.json();
            const current = data.current;
            const code = current.weather_code;
            setWeather({
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                windSpeed: Math.round(current.wind_speed_10m),
                condition: getWeatherCondition(code),
                icon: getWeatherIcon(code),
                city,
                plantTip: getPlantTip(current.temperature_2m, current.relative_humidity_2m, code),
            });
        } catch (e) { console.log('Weather error:', e); }
        finally { setLoadingWeather(false); }
    };

    const getWeatherCondition = (code) => {
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 49) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 82) return 'Showers';
        return 'Thunderstorm';
    };

    const getWeatherIcon = (code) => {
        const hour = new Date().getHours();
        const isNight = hour >= 19 || hour < 6;
        if (code === 0) return isNight ? 'moon' : 'sunny';
        if (code <= 3) return isNight ? 'cloudy-night' : 'partly-sunny';
        if (code <= 49) return 'cloudy';
        if (code <= 67) return 'rainy';
        if (code <= 77) return 'snow';
        if (code <= 82) return 'rainy';
        return 'thunderstorm';
    };

    const getPlantTip = (temp, humidity, code) => {
        if (code >= 51 && code <= 67) return '🌧️ Great day for plants! Rain provides natural watering.';
        if (temp > 35) return '🌡️ Hot day! Water your plants early morning or evening.';
        if (temp < 15) return '❄️ Cold weather! Move sensitive plants indoors.';
        if (humidity < 30) return '💧 Low humidity! Mist your plants to keep them hydrated.';
        if (humidity > 80) return '🍄 High humidity! Watch for fungal diseases on leaves.';
        return '🌿 Perfect weather for plant care today!';
    };

    // ✅ Single navigation helper — jumpTo for all tab screens
    const goTo = (screen, params) => {
        navigation.jumpTo(screen, params);
    };

    const userName = user?.username || user?.name || 'Farmer';
    const hour = new Date().getHours();
    const greeting = hour >= 5 && hour < 12 ? 'Good Morning'
        : hour >= 12 && hour < 17 ? 'Good Afternoon'
            : hour >= 17 && hour < 21 ? 'Good Evening'
                : 'Good Night';

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#e8f5e9" translucent={false} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={24} color="#2E7D32" />
                        <Text style={styles.logoText}>LeafDoctor</Text>
                    </View>
                    {/* ✅ jumpTo — correct for tab screens */}
                    <TouchableOpacity
                        style={styles.historyBtn}
                        onPress={() => goTo('History')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.historyIconCircle}>
                            <Ionicons name="time" size={14} color="#2E7D32" />
                        </View>
                        <Text style={styles.historyBtnText}>History</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.container}>
                <LinearGradient colors={['#e8f5e9', '#f1f8f0', '#ffffff']} style={styles.gradientBackground} />
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Greeting */}
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>{greeting}, {userName}! 👋</Text>
                        <Text style={styles.greetingSubtext}>How are your plants doing today?</Text>
                    </View>

                    {/* Weather Card */}
                    <View style={styles.weatherCard}>
                        {loadingWeather ? (
                            <View style={styles.weatherLoading}>
                                <ActivityIndicator size="small" color="#2E7D32" />
                                <Text style={styles.weatherLoadingText}>Getting weather...</Text>
                            </View>
                        ) : weather ? (
                            <>
                                <LinearGradient colors={['#1b5e20', '#2E7D32', '#43a047']} style={styles.weatherGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <View style={styles.weatherTop}>
                                        <View>
                                            <Text style={styles.weatherCity}>📍 {weather.city}</Text>
                                            <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                                            <Text style={styles.weatherCondition}>{weather.condition}</Text>
                                        </View>
                                        <Ionicons name={weather.icon} size={60} color="#fff" />
                                    </View>
                                    <View style={styles.weatherDetails}>
                                        <View style={styles.weatherDetailItem}>
                                            <Ionicons name="water-outline" size={16} color="#a5d6a7" />
                                            <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                                            <Text style={styles.weatherDetailLabel}>Humidity</Text>
                                        </View>
                                        <View style={styles.weatherDivider} />
                                        <View style={styles.weatherDetailItem}>
                                            <Ionicons name="speedometer-outline" size={16} color="#a5d6a7" />
                                            <Text style={styles.weatherDetailText}>{weather.windSpeed} km/h</Text>
                                            <Text style={styles.weatherDetailLabel}>Wind</Text>
                                        </View>
                                        <View style={styles.weatherDivider} />
                                        <View style={styles.weatherDetailItem}>
                                            <Ionicons name="leaf-outline" size={16} color="#a5d6a7" />
                                            <Text style={styles.weatherDetailText}>Plant Care</Text>
                                            <Text style={styles.weatherDetailLabel}>Tip Below</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                                <View style={styles.plantTipContainer}>
                                    <Text style={styles.plantTipText}>{weather.plantTip}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.weatherLoading}>
                                <Ionicons name="cloud-offline-outline" size={24} color="#ccc" />
                                <Text style={styles.weatherLoadingText}>Weather unavailable</Text>
                            </View>
                        )}
                    </View>

                    {/* 🎯 SEASONAL INSIGHTS SECTION - ADD HERE */}
                    {weather && (
                        <SeasonalInsightsSection
                            navigation={navigation}
                            user={user}
                            weatherData={{
                                temperature: weather.temp,
                                humidity: weather.humidity,
                                condition: weather.condition,
                                windSpeed: weather.windSpeed,
                                city: weather.city
                            }}
                        />
                    )}

                    {/* Stats */}
                    <Text style={styles.sectionTitle}>📊 Your Plant Stats</Text>
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="scan-outline" size={28} color="#2E7D32" />
                            <Text style={styles.statNumber}>{loadingStats ? '-' : stats.total}</Text>
                            <Text style={styles.statLabel}>Total Scans</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="checkmark-circle-outline" size={28} color="#1976D2" />
                            <Text style={[styles.statNumber, { color: '#1976D2' }]}>{loadingStats ? '-' : stats.healthy}</Text>
                            <Text style={styles.statLabel}>Healthy</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#fce4ec' }]}>
                            <Ionicons name="alert-circle-outline" size={28} color="#c62828" />
                            <Text style={[styles.statNumber, { color: '#c62828' }]}>{loadingStats ? '-' : stats.diseases}</Text>
                            <Text style={styles.statLabel}>Diseases</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>🔧 Quick Actions</Text>
                    <View style={styles.quickActionsContainer}>
                        {/* ✅ All tab screens use jumpTo */}
                        <TouchableOpacity style={styles.quickActionCard} onPress={() => goTo('DiseaseLibrary')} activeOpacity={0.85}>
                            <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.quickActionGradient}>
                                <Text style={styles.quickActionEmoji}>🦠</Text>
                                <Text style={styles.quickActionTitle}>Disease Library</Text>
                                <Text style={styles.quickActionSubtitle}>Browse 12+ plant diseases</Text>
                                <View style={styles.quickActionArrow}><Ionicons name="arrow-forward-circle" size={22} color="#2E7D32" /></View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} onPress={() => goTo('Scan')} activeOpacity={0.85}>
                            <LinearGradient colors={['#e3f2fd', '#bbdefb']} style={styles.quickActionGradient}>
                                <Text style={styles.quickActionEmoji}>📸</Text>
                                <Text style={styles.quickActionTitle}>Scan Plant</Text>
                                <Text style={styles.quickActionSubtitle}>Instant AI diagnosis</Text>
                                <View style={styles.quickActionArrow}><Ionicons name="arrow-forward-circle" size={22} color="#1976D2" /></View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} onPress={() => goTo('History')} activeOpacity={0.85}>
                            <LinearGradient colors={['#fff8e1', '#ffecb3']} style={styles.quickActionGradient}>
                                <Text style={styles.quickActionEmoji}>🕐</Text>
                                <Text style={styles.quickActionTitle}>Scan History</Text>
                                <Text style={styles.quickActionSubtitle}>View past results</Text>
                                <View style={styles.quickActionArrow}><Ionicons name="arrow-forward-circle" size={22} color="#f57f17" /></View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard} onPress={() => goTo('Tools')} activeOpacity={0.85}>
                            <LinearGradient colors={['#fce4ec', '#f8bbd0']} style={styles.quickActionGradient}>
                                <Text style={styles.quickActionEmoji}>🧪</Text>
                                <Text style={styles.quickActionTitle}>Smart Dosing</Text>
                                <Text style={styles.quickActionSubtitle}>Fertilizer calculator</Text>
                                <View style={styles.quickActionArrow}><Ionicons name="arrow-forward-circle" size={22} color="#c62828" /></View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>AI-POWERED DIAGNOSIS</Text>
                        </View>
                        <Text style={styles.heroTitle}>
                            <Text style={styles.darkText}>Heal </Text>
                            <Text style={styles.greenText}>your{'\n'}</Text>
                            <Text style={styles.darkText}>plants{'\n'}</Text>
                            <Text style={styles.darkText}>instantly.</Text>
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Take a picture of your plant, upload it, and get instant disease identification and treatment advice.
                        </Text>
                    </View>

                    {/* Upload Card */}
                    <TouchableOpacity style={styles.uploadCard} onPress={() => goTo('Scan')}>
                        <View style={styles.dashedBorder}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="cloud-upload-outline" size={32} color="#2E7D32" />
                            </View>
                            <Text style={styles.uploadText}>Upload Plant Photo</Text>
                            <TouchableOpacity style={styles.galleryPill} onPress={() => goTo('Scan', { openPicker: true })}>
                                <Ionicons name="images-outline" size={16} color="#fff" />
                                <Text style={styles.galleryPillText}>PICK FROM GALLERY</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#e8f5e9', zIndex: 100 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#e8f5e9',
        borderBottomWidth: 1, borderBottomColor: 'rgba(200,230,201,0.4)',
    },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20', marginLeft: 8 },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1.5, borderColor: '#C8E6C9', paddingVertical: 6,
        paddingLeft: 6, paddingRight: 12, borderRadius: 24,
        shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    },
    historyIconCircle: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center', marginRight: 7,
    },
    historyBtnText: { fontSize: 13, fontWeight: '700', color: '#1B5E20' },
    container: { flex: 1, backgroundColor: '#fff' },
    gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
    greetingContainer: { marginBottom: 20 },
    greetingText: { fontSize: 22, fontWeight: 'bold', color: '#1b5e20' },
    greetingSubtext: { fontSize: 14, color: '#666', marginTop: 4 },
    weatherCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    weatherGradient: { padding: 20 },
    weatherLoading: { backgroundColor: '#f5f5f5', padding: 30, alignItems: 'center', borderRadius: 20 },
    weatherLoadingText: { marginTop: 8, color: '#999', fontSize: 14 },
    weatherTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    weatherCity: { fontSize: 14, color: '#a5d6a7', marginBottom: 4 },
    weatherTemp: { fontSize: 52, fontWeight: 'bold', color: '#fff' },
    weatherCondition: { fontSize: 16, color: '#c8e6c9' },
    weatherDetails: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
    weatherDetailItem: { alignItems: 'center' },
    weatherDetailText: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    weatherDetailLabel: { fontSize: 11, color: '#a5d6a7', marginTop: 2 },
    weatherDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    plantTipContainer: { backgroundColor: '#f1f8e9', padding: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    plantTipText: { fontSize: 13, color: '#2e7d32', textAlign: 'center', fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20', marginBottom: 15 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: { flex: 1, borderRadius: 16, padding: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, marginHorizontal: 4 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginTop: 8 },
    statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
    quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30, justifyContent: 'space-between' },
    quickActionCard: { width: '48.5%', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 12 },
    quickActionGradient: { padding: 16, minHeight: 110 },
    quickActionEmoji: { fontSize: 28, marginBottom: 8 },
    quickActionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    quickActionSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    quickActionArrow: { position: 'absolute', bottom: 12, right: 12 },
    heroSection: { alignItems: 'center', marginBottom: 30 },
    aiBadge: { backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 20 },
    aiBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 1 },
    heroTitle: { fontSize: 42, fontWeight: '800', textAlign: 'center', lineHeight: 55, color: '#1b5e20', marginBottom: 20 },
    darkText: { color: '#003300' },
    greenText: { color: '#00bf63' },
    heroSubtitle: { fontSize: 16, color: '#555', textAlign: 'center', maxWidth: '80%', lineHeight: 24 },
    uploadCard: { backgroundColor: '#fff', borderRadius: 20, height: 200, marginBottom: 30, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    dashedBorder: { flex: 1, borderWidth: 2, borderColor: '#a5d6a7', borderStyle: 'dashed', borderRadius: 20, margin: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f8e9' },
    iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 2 },
    uploadText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    galleryPill: { backgroundColor: '#00bf63', flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
    galleryPillText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
});

export default HomeScreen;
