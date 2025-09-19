import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isInitialized } = useContext(AuthContext);
  console.log("is protected" , user)

  // ⏳ Wait until AuthProvider finishes initializing
  if (!isInitialized) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>
      Checking session...
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}
