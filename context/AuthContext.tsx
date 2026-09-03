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

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60; // 90 days in seconds
const NINETY_DAYS_MS = NINETY_DAYS_SECONDS * 1000;

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
        const authExpiry = localStorage.getItem('auth_expiry');

        // Verify if session has expired past 90 days
        if (authExpiry && Date.now() > Number(authExpiry)) {
          console.warn('🔒 [AuthContext] 90-day session expired.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('auth_expiry');
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
          setLoading(false);
          return;
        }

        const isValidToken =
          storedToken &&
          storedToken.trim() !== '' &&
          storedToken !== 'null' &&
          storedToken !== 'undefined';

        if (isValidToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken.trim());
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Refresh 90-day timestamp if missing
          if (!authExpiry) {
            localStorage.setItem('auth_expiry', String(Date.now() + NINETY_DAYS_MS));
          }

          // Ensure cookie is synced for 90 days
          document.cookie = `token=${storedToken.trim()}; Path=/; Max-Age=${NINETY_DAYS_SECONDS}; SameSite=Lax`;

          connectSocket();

          // Background sync user profile silently to get latest role, avatar, and updates
          api.get('/users/profile')
            .then((res) => {
              if (res.data?.user) {
                const refreshedUser = res.data.user;
                localStorage.setItem('user', JSON.stringify(refreshedUser));
                setUser(refreshedUser);
              }
            })
            .catch((err) => {
              console.warn('Background profile sync non-fatal error:', err?.message);
            });
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
    const expiryTimestamp = Date.now() + NINETY_DAYS_MS;
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData._id);
    localStorage.setItem('auth_expiry', String(expiryTimestamp));

    // Persist 90-day cookie
    document.cookie = `token=${userToken}; Path=/; Max-Age=${NINETY_DAYS_SECONDS}; SameSite=Lax`;

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
      localStorage.removeItem('auth_expiry');
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';

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
