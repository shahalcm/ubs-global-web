'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function SellerCustomersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await api.get('/orders/seller-orders');
        if (res.data?.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  // Derive unique customer list from orders
  const customersMap = new Map();
  orders.forEach((o) => {
    const custId = o.user?._id || o.user?.email || o.shippingAddress?.email || 'guest';
    if (!customersMap.has(custId)) {
      customersMap.set(custId, {
        id: custId,
        name: o.user?.name || o.shippingAddress?.fullName || 'Buyer Customer',
        email: o.user?.email || o.shippingAddress?.email || 'N/A',
        phone: o.user?.phone || o.shippingAddress?.phone || 'N/A',
        city: o.shippingAddress?.city || 'N/A',
        country: o.shippingAddress?.country || 'Global',
        totalOrders: 1,
        totalSpent: o.grandTotal || o.sellerEarnings || 0,
      });
    } else {
      const existing = customersMap.get(custId);
      existing.totalOrders += 1;
      existing.totalSpent += o.grandTotal || o.sellerEarnings || 0;
    }
  });

  const customerList = Array.from(customersMap.values()).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Store Customer Directory</h2>
          <p className="text-xs text-slate-500">List of verified buyers who purchased from your store</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium mt-3">Loading customer profiles...</p>
          </div>
        ) : customerList.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium">
            No customers found. Customer records will automatically compile when orders are placed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerList.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A1A44]">{c.name}</h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {c.city}, {c.country}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">{c.totalOrders} Orders Placed</span>
                  <span className="text-[#0B4DFF] font-bold">${c.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
