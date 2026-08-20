'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SellerProvider, useSeller } from '@/context/SellerContext';
import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerHeader from '@/components/seller/SellerHeader';
import { ShieldAlert, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SellerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { seller, loading: sellerLoading } = useSeller();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRegisterPage = pathname === '/seller/register';

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isRegisterPage) {
      router.push('/login?redirect=/seller/dashboard');
    }
  }, [authLoading, isAuthenticated, isRegisterPage, router]);

  useEffect(() => {
    if (!sellerLoading && isAuthenticated && !seller && !isRegisterPage) {
      router.push('/seller/register');
    }
  }, [sellerLoading, isAuthenticated, seller, isRegisterPage, router]);

  if (authLoading || sellerLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] flex items-center justify-center animate-bounce shadow-lg shadow-blue-500/20">
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#0A1A44]">Loading UBS Global Seller Portal...</p>
      </div>
    );
  }

  if (isRegisterPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <SellerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <SellerHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Notice Banners */}
        {seller && seller.status === 'pending' && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between text-amber-800 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Application Status: Pending Review.</strong> Your seller application has been submitted and is currently being reviewed by admin.
              </span>
            </div>
            <Link
              href="/seller/documents"
              className="hidden sm:flex items-center gap-1 font-bold text-[#0B4DFF] hover:underline"
            >
              Check KYC Status <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {seller && seller.status === 'suspended' && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-2 text-rose-800 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Store Suspended:</strong> Your seller account is suspended. Please contact seller support for compliance resolution.
            </span>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SellerProvider>
        <SellerLayoutContent>{children}</SellerLayoutContent>
      </SellerProvider>
    </AuthProvider>
  );
}
