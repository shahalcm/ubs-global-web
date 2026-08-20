'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  Plus,
  User,
  LogOut,
  Store,
  ChevronDown,
  ShieldCheck,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSeller } from '@/context/SellerContext';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  title?: string;
}

export default function SellerHeader({ onMobileMenuToggle, title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { seller } = useSeller();
  const router = useRouter();
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-[#0A1A44] tracking-tight">
            {title || 'Seller Control Center'}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Manage store orders, products, earnings and operations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Store Verification Pill */}
        {seller && (
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            seller.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{seller.status === 'approved' ? 'Verified Seller' : 'Application Pending'}</span>
          </div>
        )}

        {/* Store View Link */}
        <Link
          href="/products"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0B4DFF] bg-slate-100 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Quick Add Product Button */}
        <Link
          href="/seller/products?action=add"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/seller/notifications"
          className="relative p-2 text-slate-600 hover:text-[#0B4DFF] hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            {seller?.shopLogo || user?.avatar ? (
              <img
                src={seller?.shopLogo || user?.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] text-white flex items-center justify-center font-bold text-xs">
                {(seller?.shopName || user?.name || 'S').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-[#0A1A44] hidden md:block max-w-25 truncate">
              {seller?.shopName || user?.name || 'Seller'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {userDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setUserDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#0A1A44] truncate">
                  {seller?.ownerName || user?.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                href="/seller/settings"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0B4DFF]"
              >
                <Store className="w-4 h-4 text-slate-400" />
                <span>Store Settings</span>
              </Link>
              <Link
                href="/seller/subscription"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0B4DFF]"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Subscription Plan</span>
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
