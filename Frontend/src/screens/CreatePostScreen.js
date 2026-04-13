import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { createCommunityPost } from '../api/communityAPI';

const CreatePostScreen = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [loading, setLoading] = useState(false);

  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 500;
  const MAX_TAGS = 5;

  const pickImageFromGallery = async () => {
    try {
      // ✅ Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your photo library in settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takeCameraPhoto = async () => {
    try {
      // ✅ Request permission first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access in settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleAddImage = () => {
    Alert.alert('Add Image', 'Choose image source', [
      { text: 'Camera', onPress: takeCameraPhoto },
      { text: 'Gallery', onPress: pickImageFromGallery },
      { text: 'Cancel' },
    ]);
  };

  const handleCreatePost = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return; }
    if (title.length < 10) { Alert.alert('Error', 'Title must be at least 10 characters'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please enter a description'); return; }
    if (description.length < 20) { Alert.alert('Error', 'Description must be at least 20 characters'); return; }
    if (!imageUri) { Alert.alert('Error', 'Please add an image'); return; }

    const parsedTags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0).slice(0, MAX_TAGS);
    if (parsedTags.length === 0) { Alert.alert('Error', 'Please add at least one tag'); return; }

    try {
      setLoading(true);
      const postData = {
        userName: userProfile?.name || user?.displayName || user?.username || 'Anonymous',
        userAvatar: userProfile?.avatar || user?.photoURL || '',
        title: title.trim(),
        description: description.trim(),
        imageUri: imageUri,
        tags: parsedTags,
        location: location || 'Unknown',
      };

      await createCommunityPost(postData);
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.formContainer}>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="What's your plant issue?"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_TITLE_LENGTH}
              editable={!loading}
            />
            <Text style={styles.charCount}>{title.length}/{MAX_TITLE_LENGTH}</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your plant problem in detail..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              maxLength={MAX_DESCRIPTION_LENGTH}
              multiline
              numberOfLines={5}
              editable={!loading}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/{MAX_DESCRIPTION_LENGTH}</Text>
          </View>

          {/* Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image <Text style={styles.required}>*</Text></Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.changeImageBtn} onPress={handleAddImage}>
                  <Text style={styles.changeImageBtnText}>Change Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                  <Text style={styles.removeImageBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handleAddImage} disabled={loading}>
                <Text style={styles.imagePickerIcon}>📸</Text>
                <Text style={styles.imagePickerText}>Add Image</Text>
                <Text style={styles.imagePickerSubText}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tags separated by commas (e.g., leaf disease, browning)"
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
              editable={!loading}
            />
            <Text style={styles.helperText}>Max {MAX_TAGS} tags. Separate with commas.</Text>
            {tags && (
              <View style={styles.tagsPreview}>
                {tags.split(',').map(t => t.trim()).filter(t => t.length > 0).slice(0, MAX_TAGS).map((tag, index) => (
                  <View key={index} style={styles.tagPreview}>
                    <Text style={styles.tagPreviewText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you located?"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Please provide clear photos and detailed descriptions for better community responses.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleCreatePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Post to Community</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  backBtnText: { fontSize: 14, color: '#00bf63', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  formContainer: { backgroundColor: '#fff', marginVertical: 8, paddingHorizontal: 16, paddingVertical: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#e74c3c' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa' },
  textArea: { minHeight: 100, paddingTop: 10 },
  charCount: { fontSize: 12, color: '#999', marginTop: 6, textAlign: 'right' },
  imagePickerBtn: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#ddd', borderRadius: 8, paddingVertical: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  imagePickerIcon: { fontSize: 40, marginBottom: 10 },
  imagePickerText: { fontSize: 14, fontWeight: '600', color: '#333' },
  imagePickerSubText: { fontSize: 12, color: '#999', marginTop: 4 },
  imagePreviewContainer: { alignItems: 'center' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12, backgroundColor: '#f0f0f0' },
  changeImageBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#00bf63', borderRadius: 6, marginBottom: 8, width: '100%', alignItems: 'center' },
  changeImageBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  removeImageBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f5f5f5', borderRadius: 6, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  removeImageBtnText: { color: '#e74c3c', fontWeight: '600', fontSize: 14 },
  helperText: { fontSize: 12, color: '#999', marginTop: 6 },
  tagsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tagPreview: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#e8f5e9', borderRadius: 12 },
  tagPreviewText: { fontSize: 12, color: '#00bf63', fontWeight: '500' },
  infoBox: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#e3f2fd', borderLeftWidth: 3, borderLeftColor: '#2196f3', borderRadius: 4, gap: 10 },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, fontSize: 12, color: '#1565c0', lineHeight: 16 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  submitBtn: { paddingVertical: 14, backgroundColor: '#00bf63', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default CreatePostScreen;