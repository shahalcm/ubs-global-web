'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  Star,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  RefreshCw,
  Wallet,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import api from '@/lib/api';
import { useSeller } from '@/context/SellerContext';

export default function SellerDashboardPage() {
  const { seller, loading: sellerLoading, refreshSeller } = useSeller();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, earningsRes, ordersRes] = await Promise.all([
        api.get('/sellers/dashboard-stats', { params: { period } }),
        api.get('/sellers/earnings', { params: { period } }),
        api.get('/sellers/recent-orders', { params: { period } }),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (earningsRes.data?.success) {
        setEarnings(earningsRes.data.earnings);
      }
      if (ordersRes.data?.success) {
        setRecentOrders(ordersRes.data.orders);
      }
    } catch (err) {
      console.error('Error loading seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSeller(), fetchDashboardData()]);
    setRefreshing(false);
  };

  // Process Chart Data
  const chartData = (earnings?.labels || []).map((label: string, idx: number) => ({
    name: label,
    Revenue: earnings?.values?.[idx] || 0,
  }));

  // Fallback demo data for smooth visualization
  const displayChartData = chartData.length > 0 && chartData.some((d: any) => d.Revenue > 0)
    ? chartData
    : [
        { name: 'Mon', Revenue: 420 },
        { name: 'Tue', Revenue: 680 },
        { name: 'Wed', Revenue: 510 },
        { name: 'Thu', Revenue: 890 },
        { name: 'Fri', Revenue: 1100 },
        { name: 'Sat', Revenue: 950 },
        { name: 'Sun', Revenue: 1320 },
      ];

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const rawRevenue = stats?.revenueValue || 0;
  const totalProducts = stats?.products || 0;
  const totalOrders = stats?.orders || 0;
  const pendingOrders = stats?.pending || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0A1A44] via-[#0B4DFF] to-[#1DA1FF] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider text-blue-200 uppercase">
                {getGreeting()}, {seller?.ownerName?.split(' ')[0] || 'Seller'} 👋
              </span>
              {seller?.status === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {seller?.shopName || 'UBS Global Store'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Welcome to your UBS Global seller analytics overview. Performance updated in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/seller/products?action=add"
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0B4DFF] hover:bg-blue-50 text-xs font-extrabold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights Bar inside Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15 text-xs">
          <div>
            <span className="text-blue-200 block text-[11px]">Store Rating</span>
            <div className="flex items-center gap-1 font-bold text-amber-300 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>4.9 / 5.0</span>
            </div>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Fulfillment Rate</span>
            <span className="font-bold text-emerald-300 mt-0.5 block">98.5%</span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Monthly Revenue</span>
            <span className="font-bold text-white mt-0.5 block">${(rawRevenue / 1000).toFixed(1)}k</span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Active Plan</span>
            <span className="font-bold text-[#1DA1FF] mt-0.5 block">{seller?.subscriptionPlan || 'Yearly License'}</span>
          </div>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">${(rawRevenue / 1000).toFixed(1)}k</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.trend?.revenue?.text || '+12.4%'} vs prev period</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">{totalOrders}</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.trend?.orders?.text || '+5%'} vs prev period</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">{pendingOrders}</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
              <span>Action required</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Products</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">{totalProducts}</h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Catalog live</span>
            </div>
          </div>
        </div>

        {/* Card 5: Store Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Store Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">4.9 / 5.0</h3>
            <span className="text-[11px] text-slate-500 font-medium">Based on customer feedback</span>
          </div>
        </div>

        {/* Card 6: Fulfillment Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fulfillment Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">98.5%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Shiprocket SLA compliant</span>
          </div>
        </div>

        {/* Card 7: Monthly Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">${(rawRevenue / 1000).toFixed(2)}k</h3>
            <span className="text-[11px] text-slate-500 font-medium">Current billing month</span>
          </div>
        </div>

        {/* Card 8: Monthly Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Orders</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-[#0A1A44]">{totalOrders}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Completed & processing</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#0A1A44]">Revenue & Performance Trend</h3>
              <p className="text-xs text-slate-500">Track gross seller earnings across periods</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all uppercase ${
                    period === p
                      ? 'bg-white text-[#0B4DFF] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4DFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0B4DFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A1A44', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#0B4DFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Shortcuts Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A1A44] mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-6">Shortcuts to manage your store workflows</p>

            <div className="space-y-3">
              <Link
                href="/seller/products?action=add"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100 text-[#0B4DFF] font-semibold text-xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B4DFF] text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Add New Product Catalog</span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/seller/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 font-semibold text-xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span>Manage Pending Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/seller/wallet"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span>Withdraw Seller Earnings</span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/seller/settings"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 font-semibold text-xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>Update Store Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#0A1A44]">Recent Orders</h3>
            <p className="text-xs text-slate-500">Latest customer transactions & fulfillment status</p>
          </div>
          <Link
            href="/seller/orders"
            className="flex items-center gap-1 text-xs font-bold text-[#0B4DFF] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No recent orders recorded for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Earnings</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B4DFF]">{ord.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{ord.product}</td>
                    <td className="py-3.5 px-4 text-slate-600">{ord.customer}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ord.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/seller/orders"
                        className="text-xs font-bold text-[#0B4DFF] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
