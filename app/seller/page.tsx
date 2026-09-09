'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSeller } from '@/context/SellerContext';

export default function SellerPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { seller, loading: sellerLoading } = useSeller();

  useEffect(() => {
    if (!authLoading && !sellerLoading) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/seller/register');
        return;
      }
      if (seller && seller.registrationFeePaid) {
        router.replace('/seller/dashboard');
      } else {
        router.replace('/seller/register');
      }
    }
  }, [seller, sellerLoading, isAuthenticated, authLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-[#0A1A44]">Redirecting to Seller Workspace...</p>
      </div>
    </div>
  );
}
