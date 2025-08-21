import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../lib/api";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: { id: string; username: string; email: string; avatar?: string } | null;
  login: (token: string, user: AuthContextValue["user"]) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
          // restore user if available
          if (storedUser) setUser(JSON.parse(storedUser));
          // connect socket and emit online
          const s = connectSocket(storedToken);
          s.on("connect", () => {
            if (user?.id) s.emit("user:online", { userId: user.id });
          });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string, newUser: AuthContextValue["user"]) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, newToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
    ]);
    const s = connectSocket(newToken);
    s.emit("user:online", { userId: newUser?.id });
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(undefined);
    disconnectSocket();
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  };

  const value: AuthContextValue = { isLoading, token, user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

