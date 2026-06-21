import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("dd_user");
    const token = localStorage.getItem("dd_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("dd_token", token);
    localStorage.setItem("dd_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("dd_token");
    localStorage.removeItem("dd_user");
    setUser(null);
  };

  const sendOtp = async (identifier, channel) => {
    const { data } = await api.post("/auth/send-otp", { identifier, channel });
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  };

  const loginUser = async (identifier, password) => {
    const { data } = await api.post("/auth/login", {
      identifier,
      password,
    });

    login(data.token, data.user);
    return data;
  };

  const googleLogin = async (idToken) => {
    const { data } = await api.post("/auth/google-login", { idToken });
    login(data.token, data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        sendOtp,
        register,
        loginUser,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
