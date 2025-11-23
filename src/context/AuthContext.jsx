import { createContext, useState, useEffect, useContext, useRef } from "react";
import * as authApi from "../api/auth";
import LoadingSpinner from "../pages/LoadingSpinner/LoadingSpinner";

export const AuthContext = createContext();

// Custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isRun = useRef(false);

  // This effect runs once on app load to check for an existing session
  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    const initializeAuth = async () => {
      try {
        const csrfSuccess = await authApi.getCsrfToken();
        if (csrfSuccess) {
          const { data } = await authApi.refreshToken();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        // This is an expected failure if the user is not logged in.
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      await authApi.getCsrfToken();
      const { data } = await authApi.loginUser(credentials);
      setUser(data.user);
    } catch (error) {
      console.error("Login failed in context:", error);
      setUser(null);
      throw error;
    }
  };

  const register = async (credentials) => {
    try {
      await authApi.getCsrfToken();
      const { data } = await authApi.registerUser(credentials);
      setUser(data.user);
    } catch (error) {
      console.error("Registration failed in context:", error);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } catch (error) {
      console.error("Logout API call failed, but clearing client-side state anyway.", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isInitialized,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? children : <LoadingSpinner />}
    </AuthContext.Provider>
  );
};

