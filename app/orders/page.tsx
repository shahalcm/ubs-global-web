'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Loader2, ClipboardList, Clock, Truck, ShieldAlert, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'cancelled':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'shipped':
      case 'out_for_delivery':
        return 'text-sky-600 bg-sky-50 border-sky-100';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const getProductImage = (img: string) => {
    return getProductImageUrl(img);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList size={24} className="text-primary" />
            <span>{t('My Orders')}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">{t('Track and manage your global trade purchases')}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-sm font-semibold text-slate-500">{t('Loading orders...')}</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id || order.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-200 transition-all"
              >
                {/* Order Meta Header */}
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 text-sm block">Order #{order.orderNumber}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {t(order.orderStatus)}
                  </span>
                </div>

                {/* Items strip */}
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                        <img src={getProductImage(item.productImage)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-700 text-xs truncate">{t(item.productName)}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Qty: {item.quantity} • ${item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer totals & actions */}
                <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Price</span>
                    <span className="text-primary font-black text-base">${order.grandTotal}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/order-tracking/${order._id || order.id}`)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('Track Order')}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <CornerDownLeft size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 text-base">{t('No orders yet')}</h3>
              <p className="text-slate-400 text-xs mt-1">{t('You have not placed any trade orders yet.')}</p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all"
            >
              {t('Browse Products')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
