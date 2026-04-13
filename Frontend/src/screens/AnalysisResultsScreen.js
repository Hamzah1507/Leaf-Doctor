import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, StyleSheet, ScrollView,
    TouchableOpacity, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
const PLANTNET_API_KEY = '2b10lfc7x87QTr8MJ8uiltw9We';
const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;


// ── Fallback care tips per plant family / keywords ──────────────
const getFallbackTips = (plantName, scientificName) => {
    const name = (plantName + ' ' + scientificName).toLowerCase();

    if (name.includes('rose') || name.includes('rosa')) return [
        { icon: '💧', title: 'Watering', tip: 'Water deeply twice a week at the base. Avoid wetting foliage to prevent black spot.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Requires at least 6 hours of direct sunlight daily for best blooming.' },
        { icon: '✂️', title: 'Pruning', tip: 'Prune dead or diseased canes in early spring. Deadhead spent blooms regularly.' },
        { icon: '🌿', title: 'Fertilizing', tip: 'Feed with rose-specific fertilizer every 4–6 weeks during growing season.' },
        { icon: '🐛', title: 'Pest Control', tip: 'Watch for aphids and spider mites. Treat with neem oil spray as needed.' },
    ];

    if (name.includes('tomato') || name.includes('solanum lycopersicum')) return [
        { icon: '💧', title: 'Watering', tip: 'Water consistently at soil level. Irregular watering causes blossom end rot.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Needs 8+ hours of full sun. Place in the sunniest spot available.' },
        { icon: '🍃', title: 'Disease Watch', tip: 'Check for early blight and leaf spot. Remove yellowing lower leaves promptly.' },
        { icon: '🌿', title: 'Fertilizing', tip: 'Use phosphorus-rich fertilizer at planting; switch to potassium-rich when fruiting.' },
        { icon: '🔗', title: 'Support', tip: 'Stake or cage plants early to support heavy fruit load and improve airflow.' },
    ];

    if (name.includes('mango') || name.includes('mangifera')) return [
        { icon: '💧', title: 'Watering', tip: 'Young trees need regular watering. Mature trees are drought tolerant — water only in dry spells.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Thrives in full sun. Ensure no shade from surrounding trees for best fruit yield.' },
        { icon: '🍃', title: 'Fungal Watch', tip: 'Powdery mildew is common during flowering. Spray copper fungicide preventively.' },
        { icon: '✂️', title: 'Pruning', tip: 'Prune after harvest to maintain shape and remove dead wood. Improves next season yield.' },
        { icon: '🌿', title: 'Fertilizing', tip: 'Apply NPK 8-3-9 fertilizer twice a year — before flowering and after harvest.' },
    ];

    if (name.includes('basil') || name.includes('ocimum')) return [
        { icon: '💧', title: 'Watering', tip: 'Keep soil consistently moist but never waterlogged. Water at the base only.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Needs 6–8 hours of sunlight. Grows best in warm conditions above 18°C.' },
        { icon: '✂️', title: 'Harvesting', tip: 'Pinch off flower buds as they appear to keep leaves productive and flavorful.' },
        { icon: '🐛', title: 'Pest Control', tip: 'Watch for aphids and Japanese beetles. Spray diluted neem oil if needed.' },
        { icon: '🌡️', title: 'Temperature', tip: 'Very sensitive to cold. Keep indoors or cover if temperature drops below 10°C.' },
    ];

    if (name.includes('frangipani') || name.includes('plumeria')) return [
        { icon: '💧', title: 'Watering', tip: 'Water moderately in growing season. Allow soil to dry between waterings. Reduce significantly in winter.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Loves full sun — minimum 6 hours daily. More sun means more blooms.' },
        { icon: '🌿', title: 'Fertilizing', tip: 'Use a high-phosphorus fertilizer (like 10-30-10) during spring and summer to promote flowering.' },
        { icon: '🍃', title: 'Leaf Drop', tip: 'Normal to drop leaves in winter dormancy. Do not overwater during this period.' },
        { icon: '🐛', title: 'Pest Control', tip: 'Check for frangipani caterpillars. Remove by hand or use Bacillus thuringiensis spray.' },
    ];

    // Generic fallback
    return [
        { icon: '💧', title: 'Watering', tip: 'Water when the top inch of soil feels dry. Avoid both overwatering and drought stress.' },
        { icon: '☀️', title: 'Sunlight', tip: 'Place in appropriate light for the species. Most plants prefer bright, indirect to direct sunlight.' },
        { icon: '🌿', title: 'Fertilizing', tip: 'Feed with balanced NPK fertilizer during the growing season every 4–6 weeks.' },
        { icon: '🐛', title: 'Pest Control', tip: 'Inspect regularly for aphids, mites and scale. Treat early with neem oil or insecticidal soap.' },
        { icon: '✂️', title: 'Pruning', tip: 'Remove dead, diseased or damaged leaves and stems promptly to encourage healthy growth.' },
    ];
};

// ── Parse Groq response into structured tips ────────────────────
const parseTreatmentToTips = (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 20);
    const icons = ['🌿', '💧', '☀️', '🐛', '✂️', '🍃', '🌡️', '🌿'];
    return lines.slice(0, 5).map((line, i) => {
        const clean = line.replace(/^\d+[\.\)]\s*/, '').replace(/\*\*/g, '').trim();
        const colonIdx = clean.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            return {
                icon: icons[i] || '🌿',
                title: clean.substring(0, colonIdx).trim(),
                tip: clean.substring(colonIdx + 1).trim(),
            };
        }
        return { icon: icons[i] || '🌿', title: `Tip ${i + 1}`, tip: clean };
    });
};

const AnalysisResultsScreen = ({ route, navigation }) => {
    const { imageUri } = route.params || {};
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [tips, setTips] = useState([]);
    const [loadingTreatment, setLoadingTreatment] = useState(false);

    useEffect(() => {
        if (imageUri) analyzeImage();
    }, [imageUri]);

    const analyzeImage = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            const cleanUri = Platform.OS === 'android' && !imageUri.startsWith('file://')
                ? `file://${imageUri}` : imageUri;

            formData.append('images', { uri: cleanUri, type: 'image/jpeg', name: 'plant.jpg' });
            formData.append('organs', 'leaf');

            const response = await fetch(
                `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=en&include-related-images=false`,
                { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const topResult = data.results[0];
                const plantName = topResult.species?.commonNames?.[0] || topResult.species?.scientificName || 'Unknown Plant';
                const scientificName = topResult.species?.scientificName || '';
                const confidence = Math.round((topResult.score || 0) * 100);
                const family = topResult.species?.family?.scientificName || '';

                const analysisResult = { plantName, scientificName, confidence, family, isHealthy: confidence > 60 };
                setResult(analysisResult);
                getTreatment(plantName, scientificName);
                await saveToFirestore(analysisResult);
            } else {
                Alert.alert('🌿 Not a Plant', 'No plant detected. Please take a clear photo of a leaf or plant.',
                    [{ text: 'Try Again', onPress: () => navigation.goBack() }]);
                setResult({ plantName: 'Not a Plant Image', scientificName: 'Please scan a leaf or plant', confidence: 0, family: '', isHealthy: false, notAPlant: true });
                setTips([]); // No tips for non-plant images
            }
        } catch (error) {
            console.log('Analysis error:', error);
            Alert.alert('❌ Analysis Failed', 'Could not analyze image. Please try again.',
                [{ text: 'Try Again', onPress: () => navigation.goBack() }]);
        } finally {
            setLoading(false);
        }
    };

    const getTreatment = async (plantName, scientificName) => {
        setLoadingTreatment(true);
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [{
                        role: 'user',
                        content: `Give exactly 4 care tips for the plant "${plantName}" (${scientificName}). 
Format each tip EXACTLY like this:
1. Watering: [one specific sentence about watering this plant]
2. Sunlight: [one specific sentence about sunlight needs]
3. Disease Watch: [one specific sentence about common diseases]
4. Fertilizing: [one specific sentence about fertilizing]
Be specific to this plant. No extra text, no markdown, just the 4 numbered lines.`
                    }],
                    max_tokens: 300,
                }),
            });

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text && text.trim().length > 50) {
                const parsed = parseTreatmentToTips(text).slice(0, 4);
                if (parsed.length >= 3) {
                    setTips(parsed);
                } else {
                    setTips(getFallbackTips(plantName, scientificName).slice(0, 4));
                }
            } else {
                setTips(getFallbackTips(plantName, scientificName).slice(0, 4));
            }
        } catch (e) {
            console.log('Groq error:', e);
            setTips(getFallbackTips(plantName, scientificName).slice(0, 4));
        } finally {
            setLoadingTreatment(false);
        }
    };

    const saveToFirestore = async (analysisResult) => {
        try {
            if (!user?.uid) return;

            // Always compress + resize to guarantee under Firestore 1MB limit
            let compressedUri = imageUri;
            let quality = 0.5;
            let width = 400;

            // Keep compressing until small enough
            while (true) {
                const result = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width } }],
                    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
                );

                const fileInfo = await FileSystem.getInfoAsync(result.uri, { size: true });
                if ((fileInfo.size || 0) <= 700000) {
                    compressedUri = result.uri;
                    break;
                }

                // Still too big — reduce more
                quality = Math.max(0.1, quality - 0.1);
                width = Math.max(200, width - 50);
            }

            const base64Image = await FileSystem.readAsStringAsync(compressedUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await addDoc(collection(db, 'history'), {
                userId: user.uid,
                plantName: analysisResult.plantName,
                scientificName: analysisResult.scientificName,
                confidence: analysisResult.confidence,
                family: analysisResult.family,
                isHealthy: analysisResult.isHealthy,
                imageUri: `data:image/jpeg;base64,${base64Image}`,
                timestamp: new Date().toISOString(),
            });

            console.log('✅ Saved to Firestore with compressed image!');
        } catch (e) {
            console.log('Firestore save error:', e);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Analyzing your plant...</Text>
                <Text style={styles.loadingSubText}>Using AI to identify disease</Text>
            </View>
        );
    }

    const isHealthy = result?.isHealthy;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color="#2E7D32" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analysis Results</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Image */}
            {imageUri && (
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                    {!result.notAPlant && (
                        <View style={[styles.imageOverlayBadge, { backgroundColor: isHealthy ? '#2E7D32' : '#e53935' }]}>
                            <Ionicons name={isHealthy ? 'checkmark-circle' : 'alert-circle'} size={14} color="#fff" />
                            <Text style={styles.imageOverlayText}>{isHealthy ? 'Healthy' : 'Needs Attention'}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Result Card */}
            {result && (
                <View style={styles.resultCard}>
                    <View style={styles.resultTopRow}>
                        {!result.notAPlant && (
                            <View style={[styles.statusDot, { backgroundColor: isHealthy ? '#2E7D32' : '#e53935' }]} />
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.plantName}>{result.plantName}</Text>
                            {result.scientificName ? (
                                <Text style={styles.scientificName}>{result.scientificName}</Text>
                            ) : null}
                        </View>
                        {!result.notAPlant && (
                            <View style={[styles.confidenceBadge, { backgroundColor: isHealthy ? '#E8F5E9' : '#FFEBEE' }]}>
                                <Text style={[styles.confidenceText, { color: isHealthy ? '#2E7D32' : '#e53935' }]}>
                                    {result.confidence}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {result.family ? (
                        <View style={styles.familyRow}>
                            <Ionicons name="leaf-outline" size={13} color="#888" />
                            <Text style={styles.familyText}>{result.family}</Text>
                        </View>
                    ) : null}

                    {!result.notAPlant && <View style={styles.divider} />}

                    {/* Care Tips — only show for real plants */}
                    {!result.notAPlant && (
                        <>
                            <View style={styles.tipsHeader}>
                                <Ionicons name="medkit-outline" size={18} color="#2E7D32" />
                                <Text style={styles.sectionTitle}>Treatment & Care</Text>
                            </View>

                            {loadingTreatment ? (
                                <View style={styles.tipsLoading}>
                                    <ActivityIndicator size="small" color="#2E7D32" />
                                    <Text style={styles.tipsLoadingText}>Getting care tips...</Text>
                                </View>
                            ) : (
                                <View style={styles.tipsGrid}>
                                    {tips.map((tip, index) => (
                                        <View key={index} style={styles.tipCard}>
                                            <Text style={styles.tipIcon}>{tip.icon}</Text>
                                            <Text style={styles.tipTitle}>{tip.title}</Text>
                                            <Text style={styles.tipText}>{tip.tip}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.scanAgainBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="scan-outline" size={18} color="#2E7D32" />
                    <Text style={styles.scanAgainText}>Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeBtn} onPress={() => {
                    // Pop AnalysisResults off stack, then go to Home tab
                    navigation.goBack();
                    navigation.navigate('Home');
                }}>
                    <Ionicons name="home-outline" size={18} color="#fff" />
                    <Text style={styles.homeText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FBF9' },
    content: { paddingBottom: 120 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF9' },
    loadingText: { marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
    loadingSubText: { marginTop: 6, fontSize: 14, color: '#888' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 12,
        backgroundColor: '#F1F8E9',
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#1B5E20' },

    // Image
    imageWrapper: { position: 'relative' },
    image: { width: '100%', height: 240 },
    imageOverlayBadge: {
        position: 'absolute', bottom: 14, right: 14,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
    },
    imageOverlayText: { color: '#fff', fontWeight: '700', fontSize: 12, marginLeft: 5 },

    // Result Card
    resultCard: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#EEF7EE',
    },
    resultTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, marginRight: 10 },
    plantName: { fontSize: 20, fontWeight: '800', color: '#1A2E1A', letterSpacing: -0.3 },
    scientificName: { fontSize: 13, color: '#9CAF9C', fontStyle: 'italic', marginTop: 3 },
    confidenceBadge: {
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 12, marginLeft: 8,
    },
    confidenceText: { fontWeight: '800', fontSize: 13 },
    familyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    familyText: { fontSize: 12, color: '#9CAF9C', marginLeft: 5 },

    divider: { height: 1, backgroundColor: '#E8F5E9', marginVertical: 14 },

    tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1B5E20', marginLeft: 7 },

    tipsLoading: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, justifyContent: 'center' },
    tipsLoadingText: { marginLeft: 10, color: '#9CAF9C', fontSize: 13 },

    // Tips grid — 2 columns
    tipsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    tipCard: {
        width: '48.5%',
        backgroundColor: '#F1F8E9',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    tipIcon: { fontSize: 22, marginBottom: 6 },
    tipTitle: { fontSize: 12, fontWeight: '800', color: '#2E7D32', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
    tipText: { fontSize: 12, color: '#4A6741', lineHeight: 18 },

    // Buttons
    buttonRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 4,
    },
    scanAgainBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2E7D32',
        borderRadius: 14,
        paddingVertical: 14,
        marginRight: 8,
    },
    scanAgainText: { color: '#2E7D32', fontWeight: '700', fontSize: 15, marginLeft: 6 },
    homeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        borderRadius: 14,
        paddingVertical: 14,
        marginLeft: 8,
    },
    homeText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 6 },
});

export default AnalysisResultsScreen;
