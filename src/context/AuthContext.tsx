import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens
} from "../utils/token";

type RegisterPayload = {
  fullName: string;
  userName: string;
  email: string;
  password: string;
};

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (emailOrUserName: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

function checkIsAdmin(decoded: any) {
  const role =
    decoded?.role ||
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (Array.isArray(role)) {
    return role.includes("Admin");
  }

  return role === "Admin";
}

function decodeAndSetUser(
  token: string,
  setUser: (value: any) => void,
  setIsAuthenticated: (value: boolean) => void,
  setIsAdmin: (value: boolean) => void
) {
  const decoded: any = jwtDecode(token);

  setUser(decoded);
  setIsAuthenticated(true);
  setIsAdmin(checkIsAdmin(decoded));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) return;

    try {
      decodeAndSetUser(token, setUser, setIsAuthenticated, setIsAdmin);
    } catch {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  const login = async (emailOrUserName: string, password: string) => {
    const response = await api.post("/Auth/login", {
      emailOrUserName,
      password
    });

    const data = response.data.data;

    saveTokens(data.accessToken, data.refreshToken);
    decodeAndSetUser(data.accessToken, setUser, setIsAuthenticated, setIsAdmin);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await api.post("/Auth/register", payload);
    return response.data.message || "Register successful. Check your email.";
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await api.post("/Auth/logout", { refreshToken });
      }
    } catch {
      // logout should still clear local state even if backend request fails
    }

    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}