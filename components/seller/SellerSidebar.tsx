'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  MessageSquare,
  Wallet,
  BarChart3,
  Bell,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  X,
  Store,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function SellerSidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { seller } = useSeller();

  const menuItems = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/products', icon: Package },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/seller/customers', icon: Users },
    { name: 'Messages', href: '/seller/messages', icon: MessageSquare },
    { name: 'Wallet & Earnings', href: '/seller/wallet', icon: Wallet },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/seller/notifications', icon: Bell },
    { name: 'Pickup Locations', href: '/seller/pickup-addresses', icon: MapPin },
    { name: 'Documents & KYC', href: '/seller/documents', icon: FileText },
    { name: 'Subscription', href: '/seller/subscription', icon: CreditCard },
    { name: 'Store Settings', href: '/seller/settings', icon: Settings },
    { name: 'Seller Support', href: '/seller/support', icon: HelpCircle },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A1A44] text-white w-64 shadow-xl border-r border-blue-900/40">
      {/* Brand & Store Header */}
      <div className="p-5 border-b border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-wide text-white leading-tight">
              {seller?.shopName || 'UBS Global Seller'}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#1DA1FF] font-medium mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {seller?.status === 'approved' ? 'Verified Store' : seller?.status ? seller.status.toUpperCase() : 'Seller Portal'}
            </span>
          </div>
        </div>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/seller/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-linear-to-r from-[#0B4DFF] to-[#1DA1FF] text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-80" />}
            </Link>
          );
        })}
      </div>

      {/* Store Quick Status Footer */}
      <div className="p-4 m-3 rounded-2xl bg-linear-to-br from-blue-900/60 to-slate-900/80 border border-blue-500/20">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
          <span>Registration Fee</span>
          <span className="font-semibold text-emerald-400">
            {seller?.registrationFeePaid ? 'PAID' : 'PENDING'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Plan</span>
          <span className="font-semibold text-[#1DA1FF]">
            {seller?.subscriptionPlan || 'Yearly ($10)'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 z-30 w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
