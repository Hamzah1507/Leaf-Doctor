import React, { useEffect, useState } from "react";
import {
  collection, getDocs, deleteDoc, doc,
  orderBy, query, updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "community_posts", postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await updateDoc(doc(db, "community_posts", postId), { status: newStatus });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const filtered = posts.filter(p => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.userName?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "solved" ? p.status === "solved" :
      filter === "unsolved" ? p.status === "unsolved" : true;
    return matchSearch && matchFilter;
  });

  const formatDate = (ts) => {
    if (!ts) return "Unknown";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🌿 Community Posts</h1>
          <p style={styles.subtitle}>Manage community discussions and posts</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{posts.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{posts.filter(p => p.status === "solved").length}</span>
            <span style={styles.statLabel}>Solved</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{posts.filter(p => p.status === "unsolved").length}</span>
            <span style={styles.statLabel}>Unsolved</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          placeholder="Search by title, user or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={styles.filterBtns}>
          {["all", "solved", "unsolved"].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div style={styles.center}>Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.center}>No posts found</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Tags</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Likes</th>
                <th style={styles.th}>Replies</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <React.Fragment key={post.id}>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {post.userName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span style={styles.userName}>{post.userName || "Anonymous"}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.postTitle}>{post.title}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tagsCell}>
                        {post.tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} style={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>{formatDate(post.createdAt)}</td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.statusSelect,
                          backgroundColor: post.status === "solved" ? "#d4edda" : "#fff3cd",
                          color: post.status === "solved" ? "#155724" : "#856404",
                        }}
                        value={post.status}
                        onChange={e => handleStatusChange(post.id, e.target.value)}
                      >
                        <option value="unsolved">Unsolved</option>
                        <option value="solved">Solved</option>
                      </select>
                    </td>
                    <td style={styles.td}>❤️ {post.likes || 0}</td>
                    <td style={styles.td}>💬 {post.replies || 0}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        >
                          {expandedPost === post.id ? "Hide" : "View"}
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedPost === post.id && (
                    <tr>
                      <td colSpan={8} style={styles.expandedCell}>
                        <div style={styles.expandedContent}>
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt="post"
                              style={styles.postImage}
                            />
                          )}
                          <div style={styles.expandedDetails}>
                            <p style={styles.expandedDesc}>{post.description}</p>
                            {post.location && (
                              <p style={styles.expandedMeta}>📍 {post.location}</p>
                            )}
                            <p style={styles.expandedMeta}>
                              📧 {post.userEmail || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  title: { fontSize: "24px", fontWeight: "700", color: "#333", margin: 0 },
  subtitle: { fontSize: "14px", color: "#999", marginTop: "4px" },
  statsRow: { display: "flex", gap: "16px" },
  statBox: { textAlign: "center", padding: "12px 20px", backgroundColor: "#f0faf4", borderRadius: "8px", minWidth: "70px" },
  statNum: { display: "block", fontSize: "22px", fontWeight: "700", color: "#00904a" },
  statLabel: { display: "block", fontSize: "12px", color: "#666", marginTop: "2px" },
  filterRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" },
  searchInput: { flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" },
  filterBtns: { display: "flex", gap: "8px" },
  filterBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  filterBtnActive: { backgroundColor: "#00904a", color: "#fff", borderColor: "#00904a" },
  tableWrapper: { backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#f9f9f9" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase", borderBottom: "1px solid #eee" },
  tableRow: { borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#333", verticalAlign: "middle" },
  userCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#00904a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px", flexShrink: 0 },
  userName: { fontWeight: "500" },
  postTitle: { fontWeight: "600", color: "#333" },
  tagsCell: { display: "flex", gap: "4px", flexWrap: "wrap" },
  tag: { padding: "2px 8px", backgroundColor: "#e8f5e9", color: "#00904a", borderRadius: "10px", fontSize: "11px", fontWeight: "500" },
  statusSelect: { padding: "4px 8px", borderRadius: "6px", border: "none", fontWeight: "600", fontSize: "12px", cursor: "pointer" },
  actions: { display: "flex", gap: "8px" },
  viewBtn: { padding: "6px 12px", backgroundColor: "#e8f5e9", color: "#00904a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  deleteBtn: { padding: "6px 12px", backgroundColor: "#fde8e8", color: "#e74c3c", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  center: { textAlign: "center", padding: "60px", color: "#999", fontSize: "16px" },
  expandedCell: { padding: "0", backgroundColor: "#fafafa", borderBottom: "2px solid #e8f5e9" },
  expandedContent: { display: "flex", gap: "20px", padding: "16px 20px", alignItems: "flex-start" },
  postImage: { width: "160px", height: "120px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 },
  expandedDetails: { flex: 1 },
  expandedDesc: { fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "8px" },
  expandedMeta: { fontSize: "13px", color: "#888" },
};

export default Community;