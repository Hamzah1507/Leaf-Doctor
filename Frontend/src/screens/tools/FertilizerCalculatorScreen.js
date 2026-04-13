import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const FERTILIZER_RATES = {
    'Tomatoes':      { Seedling: 0.03, Vegetative: 0.06, Flowering: 0.08, Dormant: 0.02 },
    'Roses':         { Seedling: 0.02, Vegetative: 0.05, Flowering: 0.07, Dormant: 0.01 },
    'Indoor Plants': { Seedling: 0.01, Vegetative: 0.02, Flowering: 0.03, Dormant: 0.01 },
    'Vegetables':    { Seedling: 0.03, Vegetative: 0.05, Flowering: 0.07, Dormant: 0.02 },
    'Lawns':         { Seedling: 0.04, Vegetative: 0.08, Flowering: 0.06, Dormant: 0.02 },
};

const FertilizerCalculatorScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [area, setArea] = useState('');
    const [plantType, setPlantType] = useState(null);
    const [growthStage, setGrowthStage] = useState(null);
    const [result, setResult] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const plantTypes = [
        { id: '1', name: 'Tomatoes',      label: t('plantTomatoes') || 'Tomatoes' },
        { id: '2', name: 'Roses',         label: t('plantRoses') || 'Roses' },
        { id: '3', name: 'Indoor Plants', label: t('plantIndoor') || 'Indoor Plants' },
        { id: '4', name: 'Vegetables',    label: t('plantVegetables') || 'Vegetables' },
        { id: '5', name: 'Lawns',         label: t('plantLawns') || 'Lawns' },
    ];

    const growthStages = [
        { value: 'Seedling',   label: t('stageSeedling') || 'Seedling' },
        { value: 'Vegetative', label: t('stageVegetative') || 'Vegetative' },
        { value: 'Flowering',  label: t('stageFlowering') || 'Flowering' },
        { value: 'Dormant',    label: t('stageDormant') || 'Dormant' },
    ];

    const calculate = () => {
        if (!plantType) { Alert.alert('Missing Info', 'Please select a plant type.'); return; }
        if (!growthStage) { Alert.alert('Missing Info', 'Please select a growth stage.'); return; }
        const areaNum = parseFloat(area);
        if (isNaN(areaNum) || areaNum <= 0) { Alert.alert('Invalid Input', 'Please enter a valid area in square meters.'); return; }
        const rate = FERTILIZER_RATES[plantType.name]?.[growthStage.value] || 0.05;
        setResult((rate * areaNum).toFixed(2));
    };

    const renderPlantItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => { setPlantType(item); setModalVisible(false); }}
        >
            <Text style={styles.modalItemText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <StatusBar barStyle="dark-content" />

            {/* ── Back Button ── */}
            {navigation?.canGoBack() && (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color="#2e7d32" />
                </TouchableOpacity>
            )}

            {/* Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.iconBox}>
                    <Ionicons name="calculator" size={24} color="#2e7d32" />
                </View>
                <View>
                    <Text style={styles.headerTitle}>{t('smartDosing') || 'Smart Dosing'}</Text>
                    <Text style={styles.headerSubtitle}>{t('smartDosingSubtitle') || 'Precision fertilizer calculator'}</Text>
                </View>
            </View>

            {/* Plant Type */}
            <Text style={styles.sectionLabel}>
                <Ionicons name="leaf-outline" size={16} color="#2e7d32" /> {t('plantType') || 'Plant Type'}
            </Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
                <Text style={[styles.dropdownText, !plantType && styles.placeholderText]}>
                    {plantType ? plantType.label : t('selectPlantPlaceholder') || 'Select plant type...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {/* Growth Stage */}
            <Text style={styles.sectionLabel}>
                <Ionicons name="time-outline" size={16} color="#2e7d32" /> {t('growthStage') || 'Growth Stage'}
            </Text>
            <View style={styles.chipsContainer}>
                {growthStages.map((stage) => (
                    <TouchableOpacity
                        key={stage.value}
                        style={[styles.chip, growthStage?.value === stage.value && styles.activeChip]}
                        onPress={() => setGrowthStage(stage)}
                    >
                        <Text style={[styles.chipText, growthStage?.value === stage.value && styles.activeChipText]}>
                            {stage.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Garden Area */}
            <Text style={styles.sectionLabel}>
                <Ionicons name="resize-outline" size={16} color="#2e7d32" /> {t('gardenArea') || 'Garden Area (m²)'}
            </Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={area}
                    onChangeText={setArea}
                    placeholder={t('areaPlaceholder') || 'Enter area in m²'}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Calculate Button */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
                <Text style={styles.calculateButtonText}>{t('calculateDosage') || 'Calculate Dosage'}</Text>
            </TouchableOpacity>

            {/* Result */}
            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Recommended Amount</Text>
                    <Text style={styles.resultValue}>{result} kg</Text>
                    <Text style={styles.resultNote}>
                        For {plantType?.label} at {growthStage?.label} stage over {area} m²
                    </Text>
                </View>
            )}

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Plant Type</Text>
                        <FlatList data={plantTypes} keyExtractor={(item) => item.id} renderItem={renderPlantItem} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e0f7fa' },
    contentContainer: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 16, paddingBottom: 150 },

    // ── Back Button ──
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 25, elevation: 3 },
    iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    headerSubtitle: { fontSize: 14, color: '#2e7d32', marginTop: 2 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: '#004d40', marginBottom: 10, marginTop: 10 },
    dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#b2dfdb', borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dropdownText: { fontSize: 16, color: '#333' },
    placeholderText: { color: '#999' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    chip: { flexBasis: '48%', paddingVertical: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#b2dfdb', borderRadius: 12, alignItems: 'center' },
    activeChip: { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
    chipText: { color: '#004d40', fontWeight: '500' },
    activeChipText: { color: '#2e7d32', fontWeight: 'bold' },
    inputContainer: { marginBottom: 25 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#b2dfdb', borderRadius: 12, padding: 15, fontSize: 16, color: '#333' },
    calculateButton: { backgroundColor: '#2e7d32', paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 4 },
    calculateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    resultContainer: { marginTop: 30, backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#b2dfdb' },
    resultLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
    resultValue: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
    resultNote: { fontSize: 12, color: '#999', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#2e7d32' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
});

export default FertilizerCalculatorScreen;