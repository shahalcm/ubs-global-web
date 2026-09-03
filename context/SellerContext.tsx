'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

export interface SellerProfile {
  _id: string;
  userId: any;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
  };
  businessType?: string;
  gstNumber?: string;
  website?: string;
  categories?: string[] | string;
  yearEstablished?: string;
  description?: string;
  shopLogo?: string;
  idProof?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  registrationFeePaid: boolean;
  registrationFeeAmount?: number;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  pickupAddresses?: Array<{
    _id: string;
    pickup_location: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    address_2?: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
    isDefault: boolean;
  }>;
}

interface SellerContextType {
  seller: SellerProfile | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<SellerProfile | null>;
  updateProfile: (data: Partial<SellerProfile>) => Promise<boolean>;
  refreshSeller: () => Promise<void>;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<SellerProfile | null> => {
    if (authLoading) return null;
    if (!isAuthenticated) {
      setSeller(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/sellers/profile');
      if (res.data && res.data.success) {
        setSeller(res.data.seller);
        return res.data.seller;
      } else {
        setSeller(null);
        return null;
      }
    } catch (err: any) {
      console.warn('Load seller profile notice:', err?.response?.data?.message || err.message);
      setSeller(null);
      setError(err?.response?.data?.message || 'Failed to load seller profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, loadProfile]);

  const updateProfile = async (data: Partial<SellerProfile>): Promise<boolean> => {
    try {
      const res = await api.put('/sellers/profile', data);
      if (res.data && res.data.success) {
        setSeller(res.data.seller);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Update seller profile error:', err);
      return false;
    }
  };

  const refreshSeller = async () => {
    await loadProfile();
  };

  return (
    <SellerContext.Provider
      value={{
        seller,
        loading,
        error,
        loadProfile,
        updateProfile,
        refreshSeller,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
