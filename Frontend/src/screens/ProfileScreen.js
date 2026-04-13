import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Switch,
    ScrollView, Alert, Platform, StatusBar, Image, Modal, FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, logoutUser } from '../redux/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getSavedInsights } from '../api/insightsAPI';

const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [avatarUri, setAvatarUri] = useState(user?.avatarUri || null);
    const [insightsModalVisible, setInsightsModalVisible] = useState(false);
    const [savedInsights, setSavedInsights] = useState([]);

    const userName = user?.username || user?.full_name || user?.name || 'Guest User';
    const userEmail = user?.email || 'guest@leafdoctor.com';
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleEditAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your photos.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            try {
                if (user?.uid) await updateDoc(doc(db, 'users', user.uid), { avatarUri: uri });
            } catch (e) { console.log('Avatar update error:', e); }
        }
    };

    // ✅ Load and show saved insights modal
    const handleSavedInsights = async () => {
        try {
            if (!user?.uid) return;
            const data = await getSavedInsights(user.uid);
            setSavedInsights(data || []);
            setInsightsModalVisible(true);
        } catch (e) {
            setSavedInsights([]);
            setInsightsModalVisible(true);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    await dispatch(logoutUser());
                    dispatch(logout());
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.cardBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <View style={styles.dec1} /><View style={styles.dec2} /><View style={styles.dec3} />
                        {navigation?.canGoBack() && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
                                <Ionicons name="arrow-back" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.bannerTitle}>Profile</Text>
                    </LinearGradient>

                    <TouchableOpacity style={styles.avatarRing} onPress={handleEditAvatar} activeOpacity={0.9}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                        ) : (
                            <LinearGradient colors={['#43A047', '#1B5E20']} style={styles.avatarFallback}>
                                <Text style={styles.avatarInitials}>{userInitials}</Text>
                            </LinearGradient>
                        )}
                        <View style={styles.cameraChip}>
                            <Ionicons name="camera" size={13} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userEmail}>{userEmail}</Text>

                    {/* ✅ Edit Profile button like image 4 */}
                    <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="shield-checkmark" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.statVal}>Active</Text>
                            <Text style={styles.statLbl}>Status</Text>
                        </View>
                        <View style={styles.statLine} />
                        <View style={styles.statCol}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFFDE7' }]}>
                                <Ionicons name="star" size={18} color="#F9A825" />
                            </View>
                            <Text style={styles.statVal}>Free</Text>
                            <Text style={styles.statLbl}>Plan</Text>
                        </View>
                        <View style={styles.statLine} />
                        <View style={styles.statCol}>
                            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="notifications" size={18} color="#1976D2" />
                            </View>
                            <Text style={styles.statVal}>On</Text>
                            <Text style={styles.statLbl}>Alerts</Text>
                        </View>
                    </View>
                </View>

                {/* ✅ myData Section — like image 4 */}
                <Text style={styles.sectionLabel}>myData</Text>
                <View style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuRow} onPress={handleSavedInsights} activeOpacity={0.7}>
                        <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="bookmark-outline" size={18} color="#2E7D32" />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={styles.menuTitle}>Saved Insights</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#C8E6C9" />
                    </TouchableOpacity>
                </View>

                {/* ✅ Settings Section — like image 4 */}
                <Text style={styles.sectionLabel}>Settings</Text>
                <View style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('LanguageSettings')} activeOpacity={0.7}>
                        <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="globe-outline" size={18} color="#1976D2" />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={styles.menuTitle}>Language</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#C8E6C9" />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
                        <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                            <Ionicons name="lock-closed-outline" size={18} color="#7B1FA2" />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={styles.menuTitle}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#C8E6C9" />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.8}>
                    <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
                        <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
                    </View>
                    <Text style={styles.logoutText}>Log Out</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FFCDD2" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <Text style={styles.version}>LeafDoctor v1.0.0 🌿</Text>
                <View style={{ height: 110 }} />
            </ScrollView>

            {/* ✅ Saved Insights Modal */}
            <Modal visible={insightsModalVisible} transparent animationType="slide" onRequestClose={() => setInsightsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Saved Insights</Text>
                            <TouchableOpacity onPress={() => setInsightsModalVisible(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {savedInsights.length === 0 ? (
                            <View style={styles.modalEmpty}>
                                <Text style={styles.modalEmptyEmoji}>📋</Text>
                                <Text style={styles.modalEmptyText}>No saved insights yet</Text>
                                <Text style={styles.modalEmptySubText}>Save insights from Home screen!</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={savedInsights}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{ padding: 16 }}
                                renderItem={({ item }) => (
                                    <View style={styles.savedInsightCard}>
                                        <View style={styles.savedInsightTop}>
                                            <Ionicons name="location" size={12} color="#2E7D32" />
                                            <Text style={styles.savedInsightLocation}>{item.location}</Text>
                                            <Text style={styles.savedInsightDate}>
                                                {item.savedAt?.toDate?.()?.toLocaleDateString() || ''}
                                            </Text>
                                        </View>
                                        <Text style={styles.savedInsightText}>{item.recommendation}</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F8F1' },
    scroll: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 20 },
    profileCard: { backgroundColor: '#fff', borderRadius: 28, alignItems: 'center', marginBottom: 24, overflow: 'hidden', elevation: 6, shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.13, shadowRadius: 16, borderWidth: 1, borderColor: '#E0F0E0' },
    cardBanner: { width: '100%', height: 130, marginBottom: -50, overflow: 'hidden' },
    dec1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -50 },
    dec2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -30 },
    dec3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', top: 10, left: '45%' },
    backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 52 : 36, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    bannerTitle: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, alignSelf: 'center', fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 5, borderColor: '#fff', marginBottom: 14, elevation: 8, shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 10 },
    avatarImg: { width: 90, height: 90, borderRadius: 45 },
    avatarFallback: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
    avatarInitials: { fontSize: 34, fontWeight: '900', color: '#fff' },
    cameraChip: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#fff' },
    userName: { fontSize: 22, fontWeight: '900', color: '#1B5E20', marginBottom: 4, letterSpacing: -0.3 },
    userEmail: { fontSize: 13, color: '#9CAF9C', marginBottom: 12 },

    // ✅ Edit Profile button
    editProfileBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
    editProfileBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#EEF7EE', backgroundColor: '#FAFDF9', paddingVertical: 16 },
    statCol: { flex: 1, alignItems: 'center' },
    statIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    statVal: { fontSize: 12, fontWeight: '800', color: '#1A2E1A', marginBottom: 2 },
    statLbl: { fontSize: 10, color: '#9CAF9C' },
    statLine: { width: 1, backgroundColor: '#E8F5E9', marginVertical: 8 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
    menuCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#EEF7EE' },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
    menuIcon: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 13 },
    menuTexts: { flex: 1 },
    menuTitle: { fontSize: 14, fontWeight: '700', color: '#1A2E1A' },
    menuSub: { fontSize: 11, color: '#9CAF9C' },
    menuDivider: { height: 1, backgroundColor: '#F0F7F0', marginLeft: 69 },
    logoutRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 13, paddingHorizontal: 16, marginBottom: 22, borderWidth: 1, borderColor: '#FFEBEE', elevation: 2 },
    logoutText: { fontSize: 14, fontWeight: '700', color: '#D32F2F', marginLeft: 13 },
    version: { textAlign: 'center', color: '#C8DCC8', fontSize: 11 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', minHeight: 300 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2E7D32', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    modalEmpty: { alignItems: 'center', paddingVertical: 50 },
    modalEmptyEmoji: { fontSize: 48, marginBottom: 12 },
    modalEmptyText: { fontSize: 18, fontWeight: 'bold', color: '#888' },
    modalEmptySubText: { fontSize: 13, color: '#aaa', marginTop: 4 },
    savedInsightCard: { backgroundColor: '#f1f8e9', borderRadius: 12, padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2E7D32' },
    savedInsightTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
    savedInsightLocation: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', flex: 1 },
    savedInsightDate: { fontSize: 11, color: '#999' },
    savedInsightText: { fontSize: 13, color: '#555', lineHeight: 18 },
});

export default ProfileScreen;