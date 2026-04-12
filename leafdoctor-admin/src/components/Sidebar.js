import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ admin, setAdmin }) {
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/users", label: "Users", icon: "👥" },
    { path: "/scans", label: "Scans", icon: "🔍" },
    { path: "/feedback", label: "Feedback", icon: "💬" },
    { path: "/community", label: "Community", icon: "🌿" }, // ✅ NEW
    { path: "/insights", label: "Insights", icon: "🌱" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌿</div>
        <span className="sidebar-logo-text">LeafDoctor</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Main Menu</p>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-nav-item ${location.pathname === link.path ? "active" : ""}`}
          >
            <span className="sidebar-nav-icon">{link.icon}</span>
            <span className="sidebar-nav-text">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;