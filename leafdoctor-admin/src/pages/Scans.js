import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./Scans.css";

function Scans() {
  const [scans, setScans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchScans(); }, []);
  useEffect(() => { applyFilter(); }, [scans, search, filter]);

  const fetchScans = async () => {
    try {
      const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setScans(data);
    } catch (err) {
      console.error("Error fetching scans:", err);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    let result = [...scans];
    if (filter === "healthy") result = result.filter((s) => s.isHealthy === true);
    else if (filter === "unhealthy") result = result.filter((s) => s.isHealthy === false);
    if (search.trim() !== "") {
      result = result.filter((s) =>
        s.plantName?.toLowerCase().includes(search.toLowerCase()) ||
        s.scientificName?.toLowerCase().includes(search.toLowerCase()) ||
        s.userId?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (loading) return <div className="loading-screen">Loading scans...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Scan History</h1>

      <div className="card users-toolbar">
        <input
          type="text"
          placeholder="Search by plant name or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="users-search"
        />
        <div className="users-filters">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All ({scans.length})
          </button>
          <button className={`filter-btn ${filter === "healthy" ? "active" : ""}`} onClick={() => setFilter("healthy")}>
            Healthy ({scans.filter((s) => s.isHealthy === true).length})
          </button>
          <button className={`filter-btn ${filter === "unhealthy" ? "active" : ""}`} onClick={() => setFilter("unhealthy")}>
            Unhealthy ({scans.filter((s) => s.isHealthy === false).length})
          </button>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="no-results">No scans found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Plant Name</th>
                <th>Scientific Name</th>
                <th>Family</th>
                <th>Confidence</th>
                <th>Healthy</th>
                <th>Date</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((scan) => (
                <tr key={scan.id}>
                  <td>{scan.plantName || "Unknown"}</td>
                  <td>{scan.scientificName || "N/A"}</td>
                  <td>{scan.family || "N/A"}</td>
                  <td>
                    <span className={`badge ${scan.confidence >= 80 ? "badge-green" : "badge-gray"}`}>
                      {scan.confidence ? `${Math.round(scan.confidence)}%` : "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${scan.isHealthy ? "badge-green" : "badge-red"}`}>
                      {scan.isHealthy ? "Healthy" : "Unhealthy"}
                    </span>
                  </td>
                  <td>{formatDate(scan.timestamp)}</td>
                  <td className="user-id-cell">{scan.userId || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Scans;