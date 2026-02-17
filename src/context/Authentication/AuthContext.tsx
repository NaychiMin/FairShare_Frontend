import { createContext } from "react";
import type { User } from "../../types/User";

type AuthContextType = {
  isAuthenticated: boolean;
  jwtToken: string | null;
  user: User | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);