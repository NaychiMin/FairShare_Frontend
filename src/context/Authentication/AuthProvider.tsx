import React, { useEffect, useState, useMemo  } from "react";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";
import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/current", { withCredentials: true });
        setUser(res.data);
      } catch (err: unknown) {
        console.error('Error', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  
  const value = useMemo(() => {
    const login = async (email: string, password: string) => {
      setLoading(true);

      try {
        const response = await authService.login({ email, password });

        setIsAuthenticated(true);
        setJwtToken(response.jwt);
        setUser(response.user);

        localStorage.setItem("token", response.jwt);
      } finally {
        setLoading(false);
      }
    };

    const updateUser = (user: User) => {
      setUser(user);
    };

    const logout = () => {
      authService.logout();

      setJwtToken(null);
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem("token");

      navigate("/login");
    };

    return {
      isAuthenticated,
      jwtToken,
      user,
      login,
      logout,
      updateUser,
      loading,
    };
  }, [isAuthenticated, jwtToken, user, loading, navigate]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
