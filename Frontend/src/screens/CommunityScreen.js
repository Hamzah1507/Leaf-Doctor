import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjust based on your auth setup
import {
  getCommunityPosts,
  deletePost,
  likePost,
} from '../api/communityAPI';

const CommunityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('latest'); // 'latest', 'popular', 'solved', 'unsolved'
  const [likedPosts, setLikedPosts] = useState({});

  // Load posts on mount and when filter changes
  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getCommunityPosts(filter);
      setPosts(fetchedPosts);

      // Initialize liked posts
      const liked = {};
      fetchedPosts.forEach((post) => {
        liked[post.id] = post.likedBy?.includes(user?.uid) || false;
      });
      setLikedPosts(liked);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId) => {
    if (!user?.uid) {
      Alert.alert('Login Required', 'Please log in to like posts');
      return;
    }
    try {
      const isNowLiked = await likePost(postId, user.uid);
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: isNowLiked,
      }));

      // Update post likes count
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isNowLiked ? post.likes + 1 : post.likes - 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleDeletePost = async (postId, authorId) => {
    if (user.uid !== authorId) {
      Alert.alert('Error', 'You can only delete your own posts');
      return;
    }

    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', onPress: () => { } },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deletePost(postId);
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
            Alert.alert('Success', 'Post deleted');
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const navigateToPostDetail = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  const navigateToCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const renderPostCard = ({ item: post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.userName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.postTime}>
              {post.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                post.status === 'solved'
                  ? styles.solvedStatus
                  : styles.unsolvedStatus,
              ]}
            >
              {post.status === 'solved' ? '✓ Solved' : '? Unsolved'}
            </Text>
          </View>
        </View>

        {/* Delete Button (if owner) */}
        {user?.uid === post.userId && (
          <TouchableOpacity
            onPress={() => handleDeletePost(post.id, post.userId)}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteBtnText}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Title & Description */}
      <TouchableOpacity
        onPress={() => navigateToPostDetail(post)}
        style={styles.postContent}
      >
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postDescription} numberOfLines={2}>
          {post.description}
        </Text>

        {/* Post Image */}
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
            // ✅ Add this
            fadeDuration={200}
          />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Location */}
        {post.location && (
          <Text style={styles.location}>📍 {post.location}</Text>
        )}
      </TouchableOpacity>

      {/* Post Footer - Engagement */}
      <View style={styles.postFooter}>
        <View style={styles.engagementStats}>
          <Text style={styles.statText}>{post.likes || 0} Likes</Text>
          <Text style={styles.statText}>{post.replies || 0} Replies</Text>
        </View>
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            likedPosts[post.id] && styles.actionBtnActive,
          ]}
          onPress={() => handleLikePost(post.id)}
        >
          <Text style={styles.actionBtnText}>
            {likedPosts[post.id] ? '❤️' : '🤍'} Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigateToPostDetail(post)}
        >
          <Text style={styles.actionBtnText}>💬 Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigateToPostDetail(post)}
        >
          <Text style={styles.actionBtnText}>👁️ View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Community</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={navigateToCreatePost}
        >
          <Text style={styles.createBtnText}>+ New Post</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['latest', 'popular', 'solved', 'unsolved'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterBtn,
              filter === filterType && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === filterType && styles.filterBtnTextActive,
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00bf63" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubText}>
            Be the first to post about your plant issue!
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={navigateToCreatePost}
          >
            <Text style={styles.emptyBtnText}>Create First Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          // ✅ Add these performance props
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={(data, index) => ({ length: 420, offset: 420 * index, index })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  createBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00bf63',
    borderRadius: 6,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterBtnActive: {
    backgroundColor: '#00bf63',
    borderColor: '#00bf63',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00bf63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  solvedStatus: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  unsolvedStatus: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 10,
  },
  deleteBtnText: {
    fontSize: 18,
    color: '#999',
  },
  postContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#00bf63',
    fontWeight: '500',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  postFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  engagementStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#ffe8f0',
  },
  actionBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#00bf63',
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CommunityScreen;