import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./auth.css";

// Simple icon component for visual flair
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);


export default function Auth() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State to hold auth errors

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors on a new attempt

    try {
      if (isRegistering) {
        await register({ username, password });
      } else {
        await login({ username, password });
      }
      navigate("/dashboard");
      
    } catch (err) {
      // If login/register fails, the API call will throw an error
      const errorMessage = err.response?.data?.error || "Authentication failed. Please try again.";
      setError(errorMessage);
      console.error("Authentication error:", err);
    }
  };

  const handleGoogle = () => {
    // Redirect to the backend's Google auth route
    window.location.href = "https://authentication-pa0c.onrender.com/auth/google";
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setUsername("");
    setPassword("");
    setError(null); // Clear errors when toggling form
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isRegistering ? "Create Account" : "Welcome Back"}</h1>
          <p>{isRegistering ? "Join us!" : "Sign in to continue"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., john_doe"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          
          {/* Display error message if it exists */}
          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary">
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <div className="separator">
          <span>OR</span>
        </div>

        <div className="oauth-actions">
          <button className="btn btn-oauth" onClick={handleGoogle}>
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="toggle-form">
          <p>
            {isRegistering
              ? "Already have an account? "
              : "Don't have an account? "}
            <span onClick={toggleForm}>
              {isRegistering ? "Login" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

