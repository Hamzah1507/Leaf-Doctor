import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    StyleSheet, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getPostReplies, addReply, likePost, deletePost } from '../api/communityAPI';

const PostDetailScreen = ({ navigation, route }) => {
    const { post } = route.params;
    const { user, userProfile } = useAuth();

    // ✅ Now works cleanly - AuthContext merges Firebase uid
    const currentUid = user?.uid;
    const isOwner = currentUid === post.userId;

    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [liked, setLiked] = useState(post.likedBy?.includes(currentUid) || false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);

    useEffect(() => { loadReplies(); }, []);

    const loadReplies = async () => {
        try {
            setLoadingReplies(true);
            const fetchedReplies = await getPostReplies(post.id);
            setReplies(fetchedReplies);
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleLike = async () => {
        if (!currentUid) {
            Alert.alert('Login Required', 'Please log in to like posts');
            return;
        }
        try {
            const isNowLiked = await likePost(post.id, currentUid);
            setLiked(isNowLiked);
            setLikesCount((prev) => isNowLiked ? prev + 1 : prev - 1);
        } catch (error) {
            Alert.alert('Error', 'Failed to like post');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePost(post.id);
                            Alert.alert('Deleted', 'Your post has been deleted.', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    },
                },
            ]
        );
    };

    const handleAddReply = async () => {
        if (!currentUid) {
            Alert.alert('Login Required', 'Please log in to reply');
            return;
        }
        if (!replyText.trim()) {
            Alert.alert('Error', 'Please enter a reply');
            return;
        }
        try {
            setSubmitting(true);
            const newReply = await addReply(post.id, {
                userName: userProfile?.name || user?.displayName || 'Anonymous',
                userAvatar: userProfile?.avatar || '',
                message: replyText.trim(),
            });
            setReplies((prev) => [newReply, ...prev]);
            setReplyText('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Detail</Text>
                {/* ✅ Only post owner sees delete button */}
                {isOwner ? (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                        <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backBtn} />
                )}
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Post Card */}
                <View style={styles.postCard}>
                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {post.userName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.userName}>{post.userName}</Text>
                            <Text style={styles.postTime}>
                                {post.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                            </Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            post.status === 'solved' ? styles.solvedBadge : styles.unsolvedBadge
                        ]}>
                            <Text style={styles.statusText}>
                                {post.status === 'solved' ? '✓ Solved' : '? Unsolved'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.description}>{post.description}</Text>

                    {post.imageUrl && (
                        <Image
                            source={{ uri: post.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                            fadeDuration={200}
                        />
                    )}

                    {post.tags?.length > 0 && (
                        <View style={styles.tagsRow}>
                            {post.tags.map((tag, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {post.location && (
                        <Text style={styles.location}>📍 {post.location}</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.likeBtn, liked && styles.likeBtnActive]}
                        onPress={handleLike}
                    >
                        <Text style={styles.likeBtnText}>
                            {liked ? '❤️' : '🤍'} {likesCount} Likes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Reply Input */}
                <View style={styles.replyInputCard}>
                    <Text style={styles.replyTitle}>💬 Add a Reply</Text>
                    <TextInput
                        style={styles.replyInput}
                        placeholder="Share your advice or solution..."
                        placeholderTextColor="#999"
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={!submitting}
                    />
                    <TouchableOpacity
                        style={[styles.replyBtn, submitting && styles.replyBtnDisabled]}
                        onPress={handleAddReply}
                        disabled={submitting}
                    >
                        {submitting
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.replyBtnText}>Post Reply</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Replies */}
                <View style={styles.repliesSection}>
                    <Text style={styles.repliesTitle}>
                        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                    </Text>
                    {loadingReplies ? (
                        <ActivityIndicator color="#00bf63" style={{ marginTop: 20 }} />
                    ) : replies.length === 0 ? (
                        <Text style={styles.noReplies}>
                            No replies yet. Be the first to help!
                        </Text>
                    ) : (
                        replies.map((reply) => (
                            <View key={reply.id} style={styles.replyCard}>
                                <View style={styles.replyHeader}>
                                    <View style={styles.replyAvatar}>
                                        <Text style={styles.replyAvatarText}>
                                            {reply.userName?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.replyUserName}>{reply.userName}</Text>
                                        <Text style={styles.replyTime}>
                                            {reply.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.replyMessage}>{reply.message}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    backBtn: { paddingVertical: 8, paddingHorizontal: 12, minWidth: 80 },
    backBtnText: { fontSize: 14, color: '#00bf63', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    deleteBtn: { paddingVertical: 8, paddingHorizontal: 12, minWidth: 80, alignItems: 'flex-end' },
    deleteBtnText: { fontSize: 13, color: '#e74c3c', fontWeight: '600' },
    scroll: { flex: 1 },
    postCard: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee' },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00bf63', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    userName: { fontSize: 14, fontWeight: '600', color: '#333' },
    postTime: { fontSize: 12, color: '#999' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    solvedBadge: { backgroundColor: '#d4edda' },
    unsolvedBadge: { backgroundColor: '#fff3cd' },
    statusText: { fontSize: 11, fontWeight: '600', color: '#333' },
    title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
    description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
    image: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12, backgroundColor: '#f0f0f0' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#e8f5e9', borderRadius: 12 },
    tagText: { fontSize: 12, color: '#00bf63', fontWeight: '500' },
    location: { fontSize: 13, color: '#666', marginBottom: 12 },
    likeBtn: { paddingVertical: 10, backgroundColor: '#f5f5f5', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
    likeBtnActive: { backgroundColor: '#ffe8f0', borderColor: '#ffb3c6' },
    likeBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
    replyInputCard: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee' },
    replyTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
    replyInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, color: '#333', minHeight: 80, backgroundColor: '#fafafa' },
    replyBtn: { marginTop: 10, paddingVertical: 12, backgroundColor: '#00bf63', borderRadius: 8, alignItems: 'center' },
    replyBtnDisabled: { opacity: 0.6 },
    replyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    repliesSection: { margin: 12, marginTop: 0 },
    repliesTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
    noReplies: { color: '#999', fontSize: 14, textAlign: 'center', marginTop: 20 },
    replyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    replyAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#00bf63', justifyContent: 'center', alignItems: 'center' },
    replyAvatarText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    replyUserName: { fontSize: 13, fontWeight: '600', color: '#333' },
    replyTime: { fontSize: 11, color: '#999' },
    replyMessage: { fontSize: 14, color: '#555', lineHeight: 20 },
});

export default PostDetailScreen;