import React, { useState } from "react";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};