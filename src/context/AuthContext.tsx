import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User interface
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Get the base API URL from environment variables
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user/token from session storage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('vaultshare_token');
    const storedUser = sessionStorage.getItem('vaultshare_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem('vaultshare_token', data.token);
    sessionStorage.setItem('vaultshare_user', JSON.stringify(data.user));
  };

  // Register function
  const register = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem('vaultshare_token', data.token);
    sessionStorage.setItem('vaultshare_user', JSON.stringify(data.user));
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('vaultshare_token');
    sessionStorage.removeItem('vaultshare_user');
  };

  // Context value
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
