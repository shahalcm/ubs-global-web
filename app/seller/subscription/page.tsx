'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import api from '@/lib/api';

export default function SellerSubscriptionPage() {
  const { seller, refreshSeller } = useSeller();
  const [renewing, setRenewing] = useState(false);

  const handleRenewSubscription = async () => {
    try {
      setRenewing(true);
      const res = await api.post('/sellers/create-subscription-order');
      if (res.data?.success) {
        const { razorpayOrderId, amount, currency, key } = res.data;
        alert(`Subscription payment order created. Amount: ${currency} ${amount / 100}`);
      }
    } catch (err) {
      console.error('Error renewing subscription:', err);
    } finally {
      setRenewing(false);
    }
  };

  const isPaid = seller?.registrationFeePaid || seller?.subscriptionStatus === 'active';
  const expiresDate = seller?.subscriptionExpiresAt
    ? new Date(seller.subscriptionExpiresAt).toLocaleDateString()
    : '1 Year from Registration';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#0A1A44]">Seller Membership & Billing</h2>
        <p className="text-xs text-slate-500">Manage annual seller subscription license and billing renewals</p>
      </div>

      {/* Plan Card */}
      <div className="bg-linear-to-br from-[#0A1A44] via-[#0B4DFF] to-[#1DA1FF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Annual License Plan</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold">
            {isPaid ? 'ACTIVE LICENSE' : 'PENDING'}
          </span>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-3xl font-extrabold text-white">Yearly Global Seller License</h3>
          <p className="text-xs text-blue-100 max-w-md">
            Full access to global storefront listing, multi-currency payouts, customer messaging, and Shiprocket integration.
          </p>
        </div>

        <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-blue-200 block text-[11px]">Expiration Date</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{expiresDate}</span>
          </div>

          <button
            onClick={handleRenewSubscription}
            disabled={renewing}
            className="px-6 py-2.5 bg-white text-[#0B4DFF] text-xs font-extrabold rounded-xl shadow-lg hover:bg-blue-50 transition-all self-start sm:self-auto"
          >
            {renewing ? 'Processing...' : 'Renew Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
