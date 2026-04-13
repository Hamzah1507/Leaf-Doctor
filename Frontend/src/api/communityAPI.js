import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  Timestamp,
  arrayUnion,
  arrayRemove,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import * as FileSystem from 'expo-file-system';

// ============================================
// HELPER: CONVERT IMAGE TO BASE64
// ============================================
export const uploadPostImage = async (userId, imageUri) => {
  try {
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

    // ✅ Resize to max 800px wide and compress heavily
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.4, format: SaveFormat.JPEG, base64: true }
    );

    return `data:image/jpeg;base64,${manipResult.base64}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
// ============================================
// CREATE POST
// ============================================
export const createCommunityPost = async (postData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // ✅ Convert image to base64
    let imageUrl = null;
    if (postData.imageUri) {
      imageUrl = await uploadPostImage(user.uid, postData.imageUri);
    }

    const newPost = {
      userId: user.uid,
      userName: postData.userName || 'Anonymous',
      userEmail: user.email || '',
      userAvatar: postData.userAvatar || '',
      title: postData.title,
      description: postData.description,
      imageUrl: imageUrl,
      tags: postData.tags || [],
      status: 'unsolved',
      likes: 0,
      likedBy: [],
      replies: 0,
      location: postData.location || 'Unknown',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'community_posts'), newPost);
    return { id: docRef.id, ...newPost };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// ============================================
// GET ALL POSTS
// ============================================
export const getCommunityPosts = async (filterType = 'latest') => {
  try {
    let q;

    if (filterType === 'popular') {
      q = query(collection(db, 'community_posts'), orderBy('likes', 'desc'), limit(20));
    } else if (filterType === 'solved') {
      q = query(collection(db, 'community_posts'), where('status', '==', 'solved'), limit(20));
    } else if (filterType === 'unsolved') {
      q = query(collection(db, 'community_posts'), where('status', '==', 'unsolved'), limit(20));
    } else {
      q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(20));
    }

    const snapshot = await getDocs(q);
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// ============================================
// GET SINGLE POST
// ============================================
export const getCommunityPost = async (postId) => {
  try {
    const docRef = doc(db, 'community_posts', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// ============================================
// GET USER'S POSTS
// ============================================
export const getUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'community_posts'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// ============================================
// LIKE POST
// ============================================
export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'community_posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) throw new Error('Post not found');

    const likedBy = postSnap.data().likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      await updateDoc(postRef, { likedBy: arrayRemove(userId), likes: increment(-1) });
      return false;
    } else {
      await updateDoc(postRef, { likedBy: arrayUnion(userId), likes: increment(1) });
      return true;
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// ============================================
// UPDATE POST STATUS
// ============================================
export const updatePostStatus = async (postId, newStatus) => {
  try {
    if (!['unsolved', 'solved'].includes(newStatus)) throw new Error('Invalid status');
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, { status: newStatus, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
};

// ============================================
// DELETE POST
// ============================================
export const deletePost = async (postId) => {
  try {
    // Delete all replies
    const repliesSnapshot = await getDocs(
      collection(db, 'community_posts', postId, 'replies')
    );
    for (const replyDoc of repliesSnapshot.docs) {
      await deleteDoc(replyDoc.ref);
    }
    // Delete post
    await deleteDoc(doc(db, 'community_posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ============================================
// ADD REPLY
// ============================================
export const addReply = async (postId, replyData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const replyObject = {
      userId: user.uid,
      userName: replyData.userName || 'Anonymous',
      userAvatar: replyData.userAvatar || '',
      message: replyData.message,
      isExpertReply: replyData.isExpertReply || false,
      likes: 0,
      likedBy: [],
      createdAt: Timestamp.now(),
    };

    const replyRef = await addDoc(
      collection(db, 'community_posts', postId, 'replies'),
      replyObject
    );

    await updateDoc(doc(db, 'community_posts', postId), { replies: increment(1) });
    return { id: replyRef.id, ...replyObject };
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// ============================================
// GET REPLIES
// ============================================
export const getPostReplies = async (postId) => {
  try {
    const q = query(
      collection(db, 'community_posts', postId, 'replies'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const replies = [];
    snapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() });
    });
    return replies;
  } catch (error) {
    console.error('Error getting replies:', error);
    throw error;
  }
};

// ============================================
// DELETE REPLY
// ============================================
export const deleteReply = async (postId, replyId) => {
  try {
    await deleteDoc(doc(db, 'community_posts', postId, 'replies', replyId));
    await updateDoc(doc(db, 'community_posts', postId), { replies: increment(-1) });
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
};

// ============================================
// LIKE REPLY
// ============================================
export const likeReply = async (postId, replyId, userId) => {
  try {
    const replyRef = doc(db, 'community_posts', postId, 'replies', replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) throw new Error('Reply not found');

    const likedBy = replySnap.data().likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      await updateDoc(replyRef, { likedBy: arrayRemove(userId), likes: increment(-1) });
      return false;
    } else {
      await updateDoc(replyRef, { likedBy: arrayUnion(userId), likes: increment(1) });
      return true;
    }
  } catch (error) {
    console.error('Error liking reply:', error);
    throw error;
  }
};

// ============================================
// SEARCH POSTS
// ============================================
export const searchPosts = async (searchTerm) => {
  try {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const posts = [];
    const searchLower = searchTerm.toLowerCase();

    snapshot.forEach((doc) => {
      const post = { id: doc.id, ...doc.data() };
      if (
        post.title.toLowerCase().includes(searchLower) ||
        post.description.toLowerCase().includes(searchLower) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      ) {
        posts.push(post);
      }
    });

    return posts;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

// ============================================
// GET POSTS BY TAG
// ============================================
export const getPostsByTag = async (tag) => {
  try {
    const q = query(
      collection(db, 'community_posts'),
      where('tags', 'array-contains', tag)
    );
    const snapshot = await getDocs(q);
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  } catch (error) {
    console.error('Error getting posts by tag:', error);
    throw error;
  }
};

export default {
  createCommunityPost,
  getCommunityPosts,
  getCommunityPost,
  getUserPosts,
  likePost,
  updatePostStatus,
  deletePost,
  addReply,
  getPostReplies,
  deleteReply,
  likeReply,
  uploadPostImage,
  searchPosts,
  getPostsByTag,
};