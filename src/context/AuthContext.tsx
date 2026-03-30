import React, { createContext, ReactNode, useState, useEffect } from "react";
import { apiService, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const savedToken = await apiService.getToken();

      if (savedToken) {
        setToken(savedToken);

        // Verify token by getting current user
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user);
        } else {
          // Token is invalid, clear it
          await apiService.clearToken();
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(
        fullName,
        email,
        phoneNumber,
        password,
      );

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
