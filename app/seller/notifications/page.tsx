'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, ShoppingBag, Package, DollarSign, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
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
    }
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Seller Activity Notifications</h2>
          <p className="text-xs text-slate-500">Real-time alerts for orders, payouts, and system notices</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium mt-3">Loading notifications feed...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
            No notifications available right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n, idx) => (
              <div key={idx} className="py-4 flex items-start gap-3 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#0A1A44]">{n.title || 'System Notification'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message || n.body}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
