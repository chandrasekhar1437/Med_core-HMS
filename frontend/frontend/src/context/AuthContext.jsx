import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Pre-load user state from localStorage if available to avoid flash of unauthenticated state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Validate session on app startup if a token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // FIXED: Route set to /auth/me so it appends cleanly to /api/v1
        const res = await API.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Auth session check failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Accepts arguments flexibly as (arg1, arg2) -> handles both (token, userData) and (userData, token)
  const loginUser = (arg1, arg2) => {
    let token = "";
    let userData = null;

    if (typeof arg1 === "string" && (typeof arg2 === "object" || !arg2)) {
      token = arg1;
      userData = arg2;
    } else if (typeof arg1 === "object" && typeof arg2 === "string") {
      userData = arg1;
      token = arg2;
    } else if (typeof arg1 === "string" && typeof arg2 === "string") {
      token = arg1;
      userData = { email: "user@medcore.com", role: "admin" };
    }

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    }

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || !!localStorage.getItem("token"),
        loading,
        login: loginUser, // Backward compatibility alias
        loginUser,
        logout,
      }}
    >
      {!loading ? (
        children
      ) : (
        <div style={styles.loader}>
          <p>Restoring session...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

const styles = {
  loader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    color: "#64748b",
  },
};