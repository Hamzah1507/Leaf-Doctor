import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import "./TopBar.css";

function TopBar({ admin, setAdmin }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const getInitials = (email) => {
    if (!email) return "AD";
    return email.substring(0, 2).toUpperCase();
  };

  const getFirstName = (email) => {
    if (!email) return "Admin";
    return email.split("@")[0];
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAdmin(null);
    navigate("/login");
  };

  const handleResetPassword = async () => {
    setResetError("");
    setResetSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setResetError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setResetSuccess("Password updated. Logging out...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(async () => {
        await signOut(auth);
        setAdmin(null);
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setResetError("Current password is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setResetError("Too many attempts. Please try again later.");
      } else {
        setResetError("Failed to update password. Try again.");
      }
    }
    setResetLoading(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-welcome">
          Welcome back, <span>{getFirstName(admin?.email)}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-profile" onClick={() => { setShowDropdown(!showDropdown); setShowResetForm(false); setResetError(""); setResetSuccess(""); }}>
          <div className="topbar-avatar">{getInitials(admin?.email)}</div>
          <div className="topbar-profile-info">
            <div className="topbar-profile-name">{getFirstName(admin?.email)}</div>
            <div className="topbar-profile-role">{admin?.role}</div>
          </div>
          <span className="topbar-arrow">{showDropdown ? "▲" : "▼"}</span>
        </div>

        {showDropdown && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-header">
              <div className="topbar-dropdown-avatar">{getInitials(admin?.email)}</div>
              <div>
                <div className="topbar-dropdown-name">Welcome, {getFirstName(admin?.email)}</div>
                <div className="topbar-dropdown-email">{admin?.email}</div>
                <span className="topbar-dropdown-badge">{admin?.role}</span>
              </div>
            </div>

            <div className="topbar-dropdown-divider"></div>

            <div className="topbar-dropdown-item">
              <span>📧</span>
              <span>{admin?.email}</span>
            </div>
            <div className="topbar-dropdown-item">
              <span>🛡️</span>
              <span>Role: {admin?.role}</span>
            </div>

            <div className="topbar-dropdown-item" onClick={() => { setShowResetForm(!showResetForm); setResetError(""); setResetSuccess(""); }}>
              <span>🔑</span>
              <span>Reset Password</span>
            </div>

            {showResetForm && (
              <div className="topbar-reset-form">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="topbar-reset-input"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="topbar-reset-input"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="topbar-reset-input"
                />
                {resetError && <div className="topbar-reset-error">{resetError}</div>}
                {resetSuccess && <div className="topbar-reset-success">{resetSuccess}</div>}
                <button
                  className="topbar-reset-btn"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            <div className="topbar-dropdown-divider"></div>
            <div className="topbar-dropdown-item logout" onClick={handleLogout}>
              <span>🚪</span>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBar;