'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  PackageCheck,
  Truck,
  XCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/api';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const tabs = ['all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/orders/seller-orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching seller orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      if (res.data?.success) {
        await loadOrders(true);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status.');
    } fontally: {
      setUpdatingOrderId(null);
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.ubsglobalapp.com/api'}/orders/${orderId}/view-invoice`, '_blank');
    } catch (err) {
      console.error('Error viewing invoice:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">NEW ORDER</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">CONFIRMED</span>;
      case 'packed':
        return <span className="px-2.5 py-1 rounded-full bg-[#EAF4FF] text-[#0B4DFF] border border-blue-200 text-[10px] font-bold">PACKED</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">SHIPPED</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">DELIVERED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{status?.toUpperCase()}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedTab === 'all') return true;
    return o.orderStatus === selectedTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Order Fulfillment & Logistics</h2>
          <p className="text-xs text-slate-500">Track incoming buyer orders, pack shipments, and generate invoices</p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            loadOrders(true);
          }}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#0B4DFF] transition-colors shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
              selectedTab === tab
                ? 'bg-[#0B4DFF] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'placed' ? 'New Orders' : tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium mt-3">Loading order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#0A1A44]">No Orders Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no orders listed under tab "{selectedTab}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrderId === order._id;
            const currentStatus = order.orderStatus;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sm text-[#0B4DFF]">
                        #UBS-{String(order._id).slice(-6).toUpperCase()}
                      </span>
                      {getStatusBadge(currentStatus)}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateInvoice(order._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Products Items */}
                <div className="py-4 space-y-3">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                              P
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.productName || 'Product'}</p>
                          <span className="text-[11px] text-slate-500">Qty: {item.quantity || 1}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#0A1A44]">${(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-3 rounded-xl">
                  <div className="text-xs">
                    <span className="text-slate-500">Total Seller Earnings: </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${(order.sellerEarnings || order.grandTotal || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex items-center gap-2">
                    {isUpdating ? (
                      <span className="text-xs text-slate-500 font-medium">Updating...</span>
                    ) : (
                      <>
                        {currentStatus === 'placed' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                              className="px-4 py-1.5 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#093ecf]"
                            >
                              Confirm Order
                            </button>
                          </>
                        )}

                        {currentStatus === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'packed')}
                            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700"
                          >
                            Mark as Packed
                          </button>
                        )}

                        {currentStatus === 'packed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'shipped')}
                            className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-purple-700"
                          >
                            Mark as Shipped
                          </button>
                        )}

                        {currentStatus === 'shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
