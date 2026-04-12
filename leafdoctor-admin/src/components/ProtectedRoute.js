import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ admin, children }) {
  if (!admin) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default ProtectedRoute;