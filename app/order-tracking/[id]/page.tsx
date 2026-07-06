'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import api from '../../../lib/api';
import { Navbar } from '../../../components/Navbar';
import { Loader2, ArrowLeft, CheckCircle2, Circle, Truck, Package, XCircle, Ban, AlertCircle, Clock } from 'lucide-react';

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { id } = use(params);

  const { t } = useTranslation();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadOrderTracking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}/track`);
      if (res.data?.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Error loading tracking information:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrderTracking();
  }, [loadOrderTracking]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason || cancelReason.trim().length < 5) {
      alert(t('Please enter a valid reason (at least 5 characters).'));
      return;
    }

    setCancelling(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/orders/${id}/cancel`, {
        reason: cancelReason.trim(),
      });
      if (res.data?.success) {
        alert(t('Your order has been cancelled successfully.'));
        setCancelModalOpen(false);
        setCancelReason('');
        loadOrderTracking();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || t('Failed to cancel order.'));
    } finally {
      setCancelling(false);
    }
  };

  const getStepState = (stepName: string) => {
    if (!order) return 'pending';
    const statusOrder = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.orderStatus);
    const stepIdx = statusOrder.indexOf(stepName);

    if (order.orderStatus === 'cancelled') return 'cancelled';

    if (currentIdx >= stepIdx) {
      return 'completed';
    } else if (currentIdx + 1 === stepIdx) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getTimelineTime = (status: string) => {
    if (!order || !order.timeline) return '';
    const event = order.timeline.find((t: any) => t.status === status);
    if (!event) return '';
    return new Date(event.timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const trackingSteps = [
    { name: 'placed', label: 'Order Placed', desc: 'Your trade order has been created.' },
    { name: 'confirmed', label: 'Order Confirmed', desc: 'Vendor has confirmed item availability.' },
    { name: 'packed', label: 'Items Packed', desc: 'Logistics cargo packaging completed.' },
    { name: 'shipped', label: 'Shipped', desc: 'Freight cargo handed over to shipping lines.' },
    { name: 'delivered', label: 'Delivered', desc: 'Products received at destination address.' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="font-semibold text-slate-600">{t('Order not found.')}</p>
        <button
          onClick={() => router.push('/orders')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          {t('Back to Orders')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('Back to Orders')}</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Order Tracking</h2>
              <p className="text-slate-400 text-xs mt-1">Order ID: #{order.orderNumber}</p>
            </div>

            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
              >
                {t('Cancel Order')}
              </button>
            )}
          </div>

          {/* Cancellation Info banner */}
          {order.orderStatus === 'cancelled' && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-2xl space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <XCircle size={16} className="text-rose-500" />
                {t('Order Cancelled')}
              </span>
              <p className="font-medium text-rose-600/90 leading-relaxed pl-5.5">
                Reason: {order.cancelReason || 'Cancelled by buyer'}
              </p>
            </div>
          )}

          {/* Timeline steps */}
          {order.orderStatus !== 'cancelled' ? (
            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {trackingSteps.map((step) => {
                const state = getStepState(step.name);
                const time = getTimelineTime(step.name);

                return (
                  <div key={step.name} className="relative flex gap-4">
                    {/* Circle icon */}
                    <div className="absolute -left-8.5 top-0.5 z-10 shrink-0">
                      {state === 'completed' ? (
                        <div className="w-7.5 h-7.5 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-primary/10">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : state === 'current' ? (
                        <div className="w-7.5 h-7.5 rounded-full bg-accent flex items-center justify-center text-white ring-4 ring-accent/15 animate-pulse">
                          <Clock size={16} />
                        </div>
                      ) : (
                        <div className="w-7.5 h-7.5 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400">
                          <Circle size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4
                          className={`font-bold text-sm ${
                            state === 'completed'
                              ? 'text-primary font-extrabold'
                              : state === 'current'
                              ? 'text-accent'
                              : 'text-slate-400'
                          }`}
                        >
                          {t(step.label)}
                        </h4>
                        {time && <span className="text-[10px] text-slate-400 font-bold">{time}</span>}
                      </div>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed">{t(step.desc)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Ban size={40} className="text-rose-500 opacity-60" />
              <span className="text-sm font-semibold text-slate-400">{t('No active tracking for cancelled orders.')}</span>
            </div>
          )}
        </div>
      </main>

      {/* Cancel Order Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 overflow-hidden animate-scale-in">
            <h3 className="text-lg font-bold border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5 text-rose-600">
              <AlertCircle size={20} />
              <span>{t('Cancel Order')}</span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t('Reason for Cancellation')}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t('Please explain why you want to cancel this order...')}
                  rows={4}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary bg-slate-50/50 resize-none font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 border-t border-slate-50 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer"
                >
                  {t('No, Keep Order')}
                </button>
                <button
                  type="submit"
                  disabled={cancelling || cancelReason.trim().length < 5}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200/50 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {cancelling ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{t('Cancel Order')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
