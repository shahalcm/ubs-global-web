'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../lib/socket';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'buyer' | 'seller';
  avatar?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, userToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  setRoleOnServer: (role: 'buyer' | 'seller') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          connectSocket();
        }
      } catch (error) {
        console.error('localStorage load user error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const login = async (userData: User, userToken: string) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData._id);
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    connectSocket();
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const setRoleOnServer = async (role: 'buyer' | 'seller'): Promise<boolean> => {
    try {
      const res = await api.patch('/auth/set-role', { role });
      if (res.data && res.data.success) {
        const updatedUser = { ...user, role } as User;
        await updateUser(updatedUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to set role:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        setRoleOnServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
