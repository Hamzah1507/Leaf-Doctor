import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./Feedback.css";

function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFeedback(data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const renderStars = (rating) => {
    if (!rating) return "N/A";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading) return <div className="loading-screen">Loading feedback...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">User Feedback</h1>

      {feedback.length === 0 ? (
        <div className="card">
          <p className="no-results">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedback.map((item) => (
            <div key={item.id} className="feedback-card">
              <div className="feedback-header">
                <div className="feedback-avatar">
                  {item.username ? item.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="feedback-user-info">
                  <div className="feedback-username">{item.username || "Anonymous"}</div>
                  <div className="feedback-date">{formatDate(item.createdAt)}</div>
                </div>
                <div className="feedback-stars">{renderStars(item.rating)}</div>
              </div>
              <p className="feedback-message">{item.message || "No message provided."}</p>
              {item.userId && (
                <div className="feedback-userid">ID: {item.userId}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feedback;