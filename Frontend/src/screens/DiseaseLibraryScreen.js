import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, ScrollView, StatusBar, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Data ────────────────────────────────────────────────────────
const DISEASES = [
    {
        id: '1', name: 'Powdery Mildew', category: 'Fungal',
        affectedPlants: 'Tomato, Rose, Cucumber',
        symptoms: 'White powdery spots on leaves and stems. Leaves may curl, yellow, and drop early.',
        causes: 'Caused by fungal spores spread by wind. Thrives in warm, dry conditions with high humidity nights.',
        treatment: 'Apply neem oil or potassium bicarbonate spray. Remove affected leaves. Improve air circulation around plants.',
        severity: 'Medium', emoji: '🍄',
    },
    {
        id: '2', name: 'Leaf Blight', category: 'Fungal',
        affectedPlants: 'Rice, Wheat, Corn',
        symptoms: 'Brown or tan spots with yellow halos on leaves. Spots enlarge and merge causing leaf death.',
        causes: 'Fungal infection spread by water splashes and wind. Worsens in wet and humid conditions.',
        treatment: 'Use copper-based fungicide. Avoid overhead watering. Remove and destroy infected plant debris.',
        severity: 'High', emoji: '🍂',
    },
    {
        id: '3', name: 'Root Rot', category: 'Fungal',
        affectedPlants: 'Most houseplants, Tomato, Pepper',
        symptoms: 'Wilting despite moist soil. Brown, mushy roots. Yellowing lower leaves.',
        causes: 'Overwatering and poor drainage. Phytophthora and Pythium fungi thrive in waterlogged soil.',
        treatment: 'Reduce watering immediately. Repot with fresh well-draining soil. Trim rotted roots before repotting.',
        severity: 'High', emoji: '🌱',
    },
    {
        id: '4', name: 'Bacterial Leaf Spot', category: 'Bacterial',
        affectedPlants: 'Pepper, Tomato, Lettuce',
        symptoms: 'Water-soaked spots that turn brown/black with yellow borders. Spots may fall out leaving holes.',
        causes: 'Xanthomonas bacteria spread through water, infected tools, and insects.',
        treatment: 'Apply copper-based bactericide. Avoid wetting leaves. Use disease-free seeds and clean tools.',
        severity: 'Medium', emoji: '🦠',
    },
    {
        id: '5', name: 'Crown Gall', category: 'Bacterial',
        affectedPlants: 'Rose, Apple, Grape',
        symptoms: 'Rough, warty growths at soil line or roots. Stunted plant growth and reduced yield.',
        causes: 'Agrobacterium tumefaciens bacteria enters through wounds in roots or stems.',
        treatment: 'No cure once infected. Remove and destroy affected plants. Sterilize soil before replanting.',
        severity: 'High', emoji: '🔬',
    },
    {
        id: '6', name: 'Mosaic Virus', category: 'Viral',
        affectedPlants: 'Cucumber, Tomato, Bean',
        symptoms: 'Mottled yellow-green mosaic pattern on leaves. Distorted, curled leaves and stunted growth.',
        causes: 'Spread by aphids and other sap-sucking insects. Also transmitted through infected seeds.',
        treatment: 'No cure. Remove infected plants immediately. Control aphid population with insecticidal soap.',
        severity: 'High', emoji: '🧬',
    },
    {
        id: '7', name: 'Leaf Curl Virus', category: 'Viral',
        affectedPlants: 'Tomato, Cotton, Chili',
        symptoms: 'Upward or downward curling of leaves. Thickened veins, yellowing and stunted growth.',
        causes: 'Transmitted by whiteflies. Virus spreads rapidly in warm weather with high whitefly populations.',
        treatment: 'Control whiteflies with yellow sticky traps and neem oil. Remove infected plants promptly.',
        severity: 'High', emoji: '🌿',
    },
    {
        id: '8', name: 'Aphid Infestation', category: 'Pest',
        affectedPlants: 'Rose, Cabbage, Citrus',
        symptoms: 'Clusters of small insects on new growth. Sticky honeydew on leaves. Curled, distorted foliage.',
        causes: 'Soft-bodied insects that multiply rapidly. Attracted to lush, nitrogen-rich plant growth.',
        treatment: 'Spray with neem oil or insecticidal soap. Introduce ladybugs as natural predators. Use strong water spray.',
        severity: 'Low', emoji: '🐛',
    },
    {
        id: '9', name: 'Spider Mites', category: 'Pest',
        affectedPlants: 'Strawberry, Tomato, Houseplants',
        symptoms: 'Fine webbing on leaves. Tiny yellow or white speckles. Leaves turn bronze and drop.',
        causes: 'Hot and dry conditions favor mite reproduction. Spread by wind and contact with infested plants.',
        treatment: 'Increase humidity. Apply miticide or neem oil. Wipe leaves with damp cloth to remove mites.',
        severity: 'Medium', emoji: '🕷️',
    },
    {
        id: '10', name: 'Whitefly', category: 'Pest',
        affectedPlants: 'Tomato, Sweet Potato, Ornamentals',
        symptoms: 'Clouds of tiny white insects when plant is disturbed. Yellowing leaves and sticky residue.',
        causes: 'Warm, humid conditions. Spreads rapidly in greenhouses and indoor gardens.',
        treatment: 'Use yellow sticky traps. Apply neem oil spray. Introduce natural predators like parasitic wasps.',
        severity: 'Medium', emoji: '🦟',
    },
    {
        id: '11', name: 'Downy Mildew', category: 'Fungal',
        affectedPlants: 'Grape, Spinach, Basil',
        symptoms: 'Yellow patches on upper leaf surface with gray-purple fuzzy growth underneath.',
        causes: 'Caused by water molds in cool, wet conditions. Spores spread through wind and water.',
        treatment: 'Apply copper fungicide. Improve air circulation. Water at base of plant, not on leaves.',
        severity: 'Medium', emoji: '💧',
    },
    {
        id: '12', name: 'Fusarium Wilt', category: 'Fungal',
        affectedPlants: 'Tomato, Banana, Carnation',
        symptoms: 'Yellowing of lower leaves, wilting on one side of plant. Brown discoloration inside stem.',
        causes: 'Fusarium fungi persist in soil for years. Spreads through infected soil, water and tools.',
        treatment: 'No cure. Use resistant varieties. Solarize soil. Remove infected plants and avoid replanting susceptible crops.',
        severity: 'High', emoji: '⚠️',
    },
];

const CATEGORIES = ['All', 'Fungal', 'Bacterial', 'Viral', 'Pest'];

const SEV_STYLE = {
    Low:    { bg: '#E8F5E9', text: '#2E7D32', dot: '#43A047' },
    Medium: { bg: '#FFF8E1', text: '#E65100', dot: '#FB8C00' },
    High:   { bg: '#FFEBEE', text: '#B71C1C', dot: '#E53935' },
};

// Card accent stripe + badge — nature-coherent but distinct
const CAT_COLOR = {
    Fungal:    '#5D4037',
    Bacterial: '#1565C0',
    Viral:     '#6A1B9A',
    Pest:      '#E65100',
};

// Filter pill active bg — all grounded in nature palette
const PILL_BG = {
    All:        '#2E7D32',
    Fungal:     '#5D4037',
    Bacterial:  '#1565C0',
    Viral:      '#6A1B9A',
    Pest:       '#E65100',
};

const CAT_ICON = {
    All: '🌿', Fungal: '🍄', Bacterial: '🦠', Viral: '🧬', Pest: '🐛',
};

// ─── Card Component ──────────────────────────────────────────────
const DiseaseCard = ({ item, isExpanded, onPress }) => {
    const sev    = SEV_STYLE[item.severity];
    const accent = CAT_COLOR[item.category] || '#2E7D32';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
            <View style={[styles.cardStripe, { backgroundColor: accent }]} />

            <View style={styles.cardBody}>
                {/* Top row */}
                <View style={styles.cardTop}>
                    <View style={[styles.emojiBubble, { backgroundColor: accent + '18' }]}>
                        <Text style={styles.emojiText}>{item.emoji}</Text>
                    </View>

                    <View style={styles.cardMeta}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.plantsRow}>
                            <Ionicons name="leaf-outline" size={10} color="#81A784" />
                            <Text style={styles.plantsText} numberOfLines={1}>{item.affectedPlants}</Text>
                        </View>
                    </View>

                    <View style={styles.badges}>
                        <View style={[styles.catBadge, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
                            <Text style={[styles.catBadgeText, { color: accent }]}>{item.category}</Text>
                        </View>
                        <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                            <View style={[styles.sevDot, { backgroundColor: sev.dot }]} />
                            <Text style={[styles.sevText, { color: sev.text }]}>{item.severity}</Text>
                        </View>
                    </View>
                </View>

                {/* Expanded detail */}
                {isExpanded && (
                    <View style={styles.details}>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>🔍  Symptoms</Text>
                            <Text style={styles.detailText}>{item.symptoms}</Text>
                        </View>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>⚡  Causes</Text>
                            <Text style={styles.detailText}>{item.causes}</Text>
                        </View>
                        <View style={[styles.detailSection, styles.treatBox]}>
                            <Text style={[styles.detailLabel, { color: '#2E7D32' }]}>💊  Treatment</Text>
                            <Text style={[styles.detailText, { color: '#374151' }]}>{item.treatment}</Text>
                        </View>
                    </View>
                )}

                {/* Toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleChip}>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={13}
                            color="#2E7D32"
                        />
                        <Text style={styles.toggleText}>{isExpanded ? 'Hide' : 'Details'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── Screen ──────────────────────────────────────────────────────
const DiseaseLibraryScreen = ({ navigation }) => {
    const [search,     setSearch]     = useState('');
    const [category,   setCategory]   = useState('All');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = DISEASES.filter(d => {
        const matchCat    = category === 'All' || d.category === category;
        const q           = search.toLowerCase();
        const matchSearch = d.name.toLowerCase().includes(q) ||
                            d.affectedPlants.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

            {/* ── Header ── */}
            <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1B5E20" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>🌿 Disease Library</Text>
                        <Text style={styles.headerSub}>{DISEASES.length} diseases · tap to expand</Text>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchRow}>
                    <Ionicons name="search-outline" size={16} color="#A5D6A7" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search disease or plant..."
                        placeholderTextColor="#A5D6A7"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#A5D6A7" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* ── Filter Pills ── */}
            <View style={styles.pillsWrap}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pillsContent}
                >
                    {CATEGORIES.map(cat => {
                        const active = category === cat;
                        const bg     = PILL_BG[cat];
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                activeOpacity={0.8}
                                style={[
                                    styles.pill,
                                    active
                                        ? { backgroundColor: bg, borderColor: bg }
                                        : { backgroundColor: '#fff', borderColor: '#C8E6C9' }
                                ]}
                            >
                                <Text style={styles.pillIcon}>{CAT_ICON[cat]}</Text>
                                <Text style={[
                                    styles.pillLabel,
                                    { color: active ? '#fff' : '#558B2F' }
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Count row ── */}
            <View style={styles.countRow}>
                <Text style={styles.countText}>
                    <Text style={styles.countBold}>{filtered.length}</Text>
                    {' result'}{filtered.length !== 1 ? 's' : ''}
                </Text>
                {category !== 'All' && (
                    <TouchableOpacity onPress={() => setCategory('All')} style={styles.clearBtn}>
                        <Ionicons name="close-circle-outline" size={13} color="#2E7D32" />
                        <Text style={styles.clearText}> Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── List ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                extraData={expandedId}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <DiseaseCard
                        item={item}
                        isExpanded={expandedId === item.id}
                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>🔍</Text>
                        <Text style={styles.emptyTitle}>No results found</Text>
                        <Text style={styles.emptySub}>Try a different keyword or category</Text>
                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={() => { setSearch(''); setCategory('All'); }}
                        >
                            <Text style={styles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },

    // Header
    header: {
        paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#1B5E20',
        letterSpacing: -0.3,
    },
    headerSub: {
        fontSize: 12,
        color: '#81A784',
        marginTop: 2,
    },

    // Search
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        shadowColor: '#1B5E20',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1B5E20',
        fontWeight: '500',
    },

    // Filter pills
    pillsWrap: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F5E9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
    },
    pillsContent: {
        paddingHorizontal: 16,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1.5,
        marginRight: 8,
    },
    pillIcon: {
        fontSize: 13,
        marginRight: 5,
    },
    pillLabel: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Count
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 6,
    },
    countText: { fontSize: 13, color: '#9CAF9C', fontWeight: '500' },
    countBold: { fontSize: 14, color: '#2E7D32', fontWeight: '800' },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
    },
    clearText: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },

    // List
    list: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 120,
    },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEF7EE',
    },
    cardStripe: { width: 4 },
    cardBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emojiBubble: {
        width: 46,
        height: 46,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    emojiText: { fontSize: 24 },
    cardMeta: { flex: 1, marginRight: 8 },
    cardName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A2E1A',
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    plantsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    plantsText: {
        fontSize: 11,
        color: '#9CAF9C',
        fontWeight: '500',
        marginLeft: 4,
        flexShrink: 1,
    },
    badges: { alignItems: 'flex-end' },
    catBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 5,
    },
    catBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
    sevBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    sevDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
    sevText: { fontSize: 10, fontWeight: '800' },

    // Expanded
    details: { marginTop: 12 },
    detailDivider: {
        height: 1,
        backgroundColor: '#E8F5E9',
        marginBottom: 12,
    },
    detailSection: { marginBottom: 10 },
    detailLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4A6741',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailText: {
        fontSize: 13,
        color: '#5A7A5A',
        lineHeight: 20,
    },
    treatBox: {
        backgroundColor: '#F1F8E9',
        padding: 10,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#2E7D32',
        marginBottom: 2,
    },

    // Toggle
    toggleRow: { alignItems: 'center', marginTop: 8 },
    toggleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    toggleText: { fontSize: 12, fontWeight: '700', color: '#2E7D32', marginLeft: 4 },

    // Empty
    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2E7D32', marginBottom: 6 },
    emptySub: { fontSize: 13, color: '#9CAF9C', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    resetBtn: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 24,
        paddingVertical: 11,
        borderRadius: 22,
    },
    resetText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default DiseaseLibraryScreen;