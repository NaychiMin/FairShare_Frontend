import React, { useState } from "react";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";
import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate } = useNavigate();
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    setIsAuthenticated(true);
    setJwtToken(response.jwt);
    setUser(response.user);

    localStorage.setItem("token", response.jwt);
  };

  const updateUser = async (user: User) => {
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setJwtToken(null);
    setUser(null);

    localStorage.removeItem("token");
    setIsAuthenticated(false);

    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        jwtToken,
        user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};