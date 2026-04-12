import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import './App.css';

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Scans from "./pages/Scans";
import Feedback from "./pages/Feedback";
import Community from "./pages/Community"; // ✅ NEW
import Insights from "./pages/Insights";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, "admin", user.uid));
        if (adminDoc.exists()) {
          setAdmin({ uid: user.uid, ...adminDoc.data() });
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh", fontSize: "14px", color: "#00904a"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className={admin ? "app-layout" : ""}>
        {admin && <Sidebar admin={admin} setAdmin={setAdmin} />}
        <div className={admin ? "app-main" : ""}>
          {admin && <TopBar admin={admin} setAdmin={setAdmin} />}
          <Routes>
            <Route path="/login" element={admin ? <Navigate to="/dashboard" /> : <Login setAdmin={setAdmin} />} />
            <Route path="/dashboard" element={<ProtectedRoute admin={admin}><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute admin={admin}><Users /></ProtectedRoute>} />
            <Route path="/scans" element={<ProtectedRoute admin={admin}><Scans /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute admin={admin}><Feedback /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute admin={admin}><Community /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute admin={admin}><Insights /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={admin ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;