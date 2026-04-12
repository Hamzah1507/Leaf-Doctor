import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Navbar.css";

function Navbar({ admin, setAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setAdmin(null);
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Users" },
    { path: "/scans", label: "Scans" },
    { path: "/feedback", label: "Feedback" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="navbar-logo-icon">🌿</div>
        <span className="navbar-logo-text">LeafDoctor Admin</span>
      </div>

      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <span className="navbar-email">{admin?.email}</span>
        <span className="navbar-role">{admin?.role}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;