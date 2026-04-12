import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useLocation } from "react-router-dom";
import "./Users.css";

function Users() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("filter") || "all";
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { applyFilter(); }, [users, search, filter]);
  useEffect(() => { setCurrentPage(1); }, [filter, search]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    let result = [...users];
    if (filter === "active") result = result.filter((u) => !u.isBlocked);
    else if (filter === "blocked") result = result.filter((u) => u.isBlocked);
    if (search.trim() !== "") {
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    setSelectedUsers([]);
  };

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: true });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u)));
    } catch (err) {
      alert("Failed to block user. Please try again.");
    }
    setActionLoading(null);
  };

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: false });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: false } : u)));
    } catch (err) {
      alert("Failed to unblock user. Please try again.");
    }
    setActionLoading(null);
  };

  const handleBulkBlock = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Block ${selectedUsers.length} selected users?`)) return;
    for (const userId of selectedUsers) {
      await updateDoc(doc(db, "users", userId), { isBlocked: true });
    }
    setUsers((prev) => prev.map((u) => selectedUsers.includes(u.id) ? { ...u, isBlocked: true } : u));
    setSelectedUsers([]);
  };

  const handleBulkUnblock = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Unblock ${selectedUsers.length} selected users?`)) return;
    for (const userId of selectedUsers) {
      await updateDoc(doc(db, "users", userId), { isBlocked: false });
    }
    setUsers((prev) => prev.map((u) => selectedUsers.includes(u.id) ? { ...u, isBlocked: false } : u));
    setSelectedUsers([]);
  };

  const toggleSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const pageUserIds = currentUsers.map((u) => u.id);
    const allSelected = pageUserIds.every((id) => selectedUsers.includes(id));
    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !pageUserIds.includes(id)));
    } else {
      setSelectedUsers((prev) => [...new Set([...prev, ...pageUserIds])]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const totalPages = Math.ceil(filtered.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filtered.slice(startIndex, startIndex + usersPerPage);
  const pageUserIds = currentUsers.map((u) => u.id);
  const allPageSelected = pageUserIds.length > 0 && pageUserIds.every((id) => selectedUsers.includes(id));

  if (loading) return <div className="loading-screen">Loading users...</div>;

  return (
    <div className="page-container">
      <div className="page-title">Users</div>

      <div className="card">
        <div className="users-toolbar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="users-search"
          />
          <div className="users-filters">
            <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All ({users.length})
            </button>
            <button className={`filter-btn ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
              Active ({users.filter((u) => !u.isBlocked).length})
            </button>
            <button className={`filter-btn ${filter === "blocked" ? "active" : ""}`} onClick={() => setFilter("blocked")}>
              Blocked ({users.filter((u) => u.isBlocked).length})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="bulk-count">{selectedUsers.length} user(s) selected</span>
            <button className="btn-red" onClick={handleBulkBlock}>Block Selected</button>
            <button className="btn-green" onClick={handleBulkUnblock}>Unblock Selected</button>
            <button className="btn-gray" onClick={() => setSelectedUsers([])}>Clear</button>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="no-results">No users found.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className={user.isBlocked ? "blocked-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td>{user.username || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastSeen)}</td>
                    <td>
                      <span className={`badge ${user.isBlocked ? "badge-red" : "badge-green"}`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <button className="btn-green" onClick={() => handleUnblock(user.id)} disabled={actionLoading === user.id}>
                          {actionLoading === user.id ? "Wait..." : "Unblock"}
                        </button>
                      ) : (
                        <button className="btn-red" onClick={() => handleBlock(user.id)} disabled={actionLoading === user.id}>
                          {actionLoading === user.id ? "Wait..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Showing {startIndex + 1} - {Math.min(startIndex + usersPerPage, filtered.length)} of {filtered.length} users
              </span>
              <div className="pagination-buttons">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Users;