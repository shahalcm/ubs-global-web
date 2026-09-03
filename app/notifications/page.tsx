'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import {
  Bell,
  Check,
  ShoppingBag,
  Package,
  DollarSign,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      loadNotifications();
    }
  }, [authLoading, loadNotifications]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return <Package size={18} className="text-blue-600" />;
      case 'payment':
        return <DollarSign size={18} className="text-emerald-600" />;
      case 'security':
        return <ShieldAlert size={18} className="text-rose-600" />;
      default:
        return <Bell size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft size={14} />
              <span>{t('Back')}</span>
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell size={24} className="text-blue-600" />
              <span>{t('Notifications')}</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t('Stay updated on order status, shipments, and account security.')}
            </p>
          </div>
        </div>

        {/* Content */}
        {!isAuthenticated && !authLoading ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Bell size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {t('Sign in to view your notifications')}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('Receive instant alerts when orders ship, suppliers reply, and payments clear.')}
              </p>
            </div>
            <button
              onClick={() => router.push('/login?redirect=/notifications')}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 mx-auto transition-all cursor-pointer hover:scale-[1.01]"
            >
              <span>{t('Sign In to Continue')}</span>
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Loading notifications...')}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <Inbox className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-extrabold text-slate-700 text-base">{t('No notifications yet')}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('When you receive order updates, shipment tracking, or supplier messages, they will appear here.')}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {notifications.map((n, idx) => (
              <div
                key={n._id || idx}
                className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-xs">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900">{n.title || t('Notification')}</h4>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(n.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message || n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
