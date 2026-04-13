import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    Image, Alert, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const HistoryScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        // No orderBy — avoids index requirement, sort client-side
        const q = query(
            collection(db, 'history'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const ta = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
                    const tb = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
                    return tb - ta; // newest first
                });
            setHistory(items);
            setLoading(false);
        }, (error) => {
            console.log('History error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const handleDelete = (item) => {
        Alert.alert(
            '🗑️ Delete Scan',
            `Remove "${item.plantName || 'this scan'}" from history?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'history', item.id));
                        } catch (e) {
                            Alert.alert('Error', 'Could not delete. Try again.');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.85}
        >
            {item.imageBase64 ? (
                <Image
                    source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
                    style={styles.cardImage}
                />
            ) : item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
            ) : (
                <View style={[styles.cardImage, styles.noImage]}>
                    <Ionicons name="leaf-outline" size={28} color="#A5D6A7" />
                </View>
            )}

            <View style={styles.cardInfo}>
                <Text style={styles.plantName} numberOfLines={1}>
                    {item.plantName || 'Unknown Plant'}
                </Text>
                <Text style={styles.scientificName} numberOfLines={1}>
                    {item.scientificName || ''}
                </Text>
                <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={12} color="#9CAF9C" />
                    <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
                </View>
                <View style={[
                    styles.badge,
                    item.notAPlant ? styles.badgeGray :
                    item.isHealthy ? styles.badgeGreen : styles.badgeRed
                ]}>
                    <Text style={[
                        styles.badgeText,
                        item.notAPlant ? { color: '#888' } :
                        item.isHealthy ? { color: '#2E7D32' } : { color: '#C62828' }
                    ]}>
                        {item.notAPlant ? 'Not a Plant' :
                         item.isHealthy ? '✓ Identified' : '⚠ Disease Detected'}
                    </Text>
                </View>
            </View>

            {item.confidence && !item.notAPlant && (
                <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{Math.round(item.confidence)}%</Text>
                </View>
            )}

            <View style={styles.deleteHint}>
                <Ionicons name="trash-outline" size={14} color="#FFCDD2" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.jumpTo('Home')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={20} color="#1B5E20" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Scan History</Text>
                        <View style={{ width: 36 }} />
                    </View>
                    <Text style={styles.headerSub}>Long press any item to delete 🗑️</Text>
                </View>
            </SafeAreaView>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : history.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="leaf-outline" size={64} color="#C8E6C9" />
                    <Text style={styles.emptyTitle}>No Scans Yet</Text>
                    <Text style={styles.emptyText}>Scan a plant to see your history here</Text>
                    <TouchableOpacity
                        style={styles.scanBtn}
                        onPress={() => navigation.jumpTo('Scan')}
                    >
                        <Ionicons name="camera-outline" size={18} color="#fff" />
                        <Text style={styles.scanBtnText}>Scan Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F8F1' },
    safeArea: { backgroundColor: '#E8F5E9' },
    header: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#C8E6C9',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#1B5E20' },
    headerSub: { fontSize: 12, color: '#9CAF9C', marginTop: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 12, color: '#9CAF9C', fontSize: 14 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1B5E20', marginTop: 16 },
    emptyText: { fontSize: 14, color: '#9CAF9C', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    scanBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#2E7D32', paddingVertical: 12,
        paddingHorizontal: 24, borderRadius: 14,
    },
    scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 8 },
    list: { padding: 16, paddingBottom: 120 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#EEF7EE',
    },
    cardImage: { width: 90, height: 90 },
    noImage: { backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
    plantName: { fontSize: 15, fontWeight: '800', color: '#1A2E1A', marginBottom: 2 },
    scientificName: { fontSize: 11, color: '#9CAF9C', fontStyle: 'italic', marginBottom: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dateText: { fontSize: 11, color: '#9CAF9C', marginLeft: 4 },
    badge: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
    badgeGreen: { backgroundColor: '#E8F5E9' },
    badgeRed: { backgroundColor: '#FFEBEE' },
    badgeGray: { backgroundColor: '#F5F5F5' },
    badgeText: { fontSize: 10, fontWeight: '700' },
    confidenceBadge: {
        position: 'absolute', top: 8, right: 36,
        backgroundColor: '#1B5E20',
        paddingVertical: 2, paddingHorizontal: 7,
        borderRadius: 10,
    },
    confidenceText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    deleteHint: { position: 'absolute', top: 8, right: 10 },
});

export default HistoryScreen;