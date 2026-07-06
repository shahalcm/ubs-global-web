'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Loader2, ShieldCheck, CreditCard, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const razorpayOrderId = searchParams.get('razorpayOrderId') || '';
  const amount = searchParams.get('amount') || '';
  const orderId = searchParams.get('orderId') || '';
  const orderNumber = searchParams.get('orderNumber') || '';
  const grandTotal = searchParams.get('grandTotal') || '0.00';
  const rzpKey = searchParams.get('key') || '';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Load Razorpay Script dynamically in browser
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayNow = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      let paymentId = 'pay_mock_' + Math.random().toString(36).substring(7);
      let signature = 'sig_mock_' + Math.random().toString(36).substring(7);

      const isMockOrder =
        !rzpKey ||
        rzpKey === 'rzp_test_your_key_id' ||
        !razorpayOrderId ||
        razorpayOrderId.startsWith('order_mock_');

      if (!isMockOrder && window.Razorpay) {
        // Open Real Razorpay browser checkout overlay
        await new Promise((resolve, reject) => {
          const options = {
            key: rzpKey,
            amount: amount,
            currency: 'USD',
            name: 'UBS Global',
            description: `Order #${orderNumber}`,
            image: 'https://cdn-icons-png.flaticon.com/512/3143/3143212.png',
            order_id: razorpayOrderId,
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            theme: { color: '#1a237e' },
            handler: function (response: any) {
              paymentId = response.razorpay_payment_id;
              signature = response.razorpay_signature;
              resolve(true);
            },
            modal: {
              ondismiss: function () {
                reject(new Error(t('Payment cancelled by user')));
              },
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }

      // Verify payment with server
      const verifyRes = await api.post('/payments/verify', {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        orderId: orderId,
      });

      if (verifyRes.data?.success) {
        clearCart();
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Payment failure:', err);
      setErrorMsg(err.message || t('Payment processing failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-800">{t('Payment Successful!')}</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                {t('Your payment of')} <span className="font-bold text-slate-700">${grandTotal}</span> {t('has been processed.')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-500 text-left space-y-1">
              <div>
                Order ID: <span className="text-slate-700 font-bold">#{orderNumber}</span>
              </div>
              <div>
                Status: <span className="text-emerald-600 font-bold">Paid</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push(`/order-tracking/${orderId}`)}
                className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {t('Track Order')}
              </button>
              <button
                onClick={() => router.push('/home')}
                className="flex-1 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                {t('Continue Shopping')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 relative overflow-hidden animate-scale-in">
          {/* Header */}
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-6 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('Cancel Payment')}</span>
          </button>

          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto">
              <CreditCard size={28} className="text-accent" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">{t('Secure Checkout')}</h2>
              <p className="text-slate-400 text-xs mt-1">Order #{orderNumber}</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-start gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Total Amount')}</span>
              <div className="text-3xl font-black text-primary">
                ${grandTotal} <span className="text-sm font-semibold text-slate-500">USD</span>
              </div>
            </div>

            {/* Shield disclaimer */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 py-2.5 rounded-xl">
              <ShieldCheck size={16} />
              <span>{t('Secure 256-bit SSL Encrypted Payment')}</span>
            </div>

            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Processing payment...')}</span>
                </>
              ) : (
                <span>
                  {t('Pay Now')} ${grandTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
