'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function SellerWalletPage() {
  const [earningsData, setEarningsData] = useState<any>(null);
  const [txList, setTxList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const loadEarningsBreakdown = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/seller/earnings');
      if (res.data?.success) {
        setEarningsData(res.data.earnings);
        setTxList(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching seller earnings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarningsBreakdown();
  }, [loadEarningsBreakdown]);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    const maxAvailable = Number(earningsData?.pendingWithdrawal || 0);

    if (!amountNum || amountNum <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amountNum > maxAvailable) {
      setWithdrawError(`Requested amount exceeds available balance of $${maxAvailable.toFixed(2)}.`);
      return;
    }

    try {
      setSubmittingWithdraw(true);
      setWithdrawError(null);
      const res = await api.post('/payments/seller/withdraw', { amount: amountNum });
      if (res.data?.success) {
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        await loadEarningsBreakdown();
        alert(`Withdrawal request of $${amountNum.toFixed(2)} submitted successfully!`);
      } else {
        setWithdrawError(res.data?.message || 'Failed to submit withdrawal request.');
      }
    } catch (err: any) {
      setWithdrawError(err.response?.data?.message || 'Server error submitting withdrawal.');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const totalEarnings = Number(earningsData?.totalEarnings || 0);
  const pendingWithdrawal = Number(earningsData?.pendingWithdrawal || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Seller Wallet & Payouts</h2>
          <p className="text-xs text-slate-500">Track total revenue, commission deductions, and request payouts</p>
        </div>

        <button
          onClick={loadEarningsBreakdown}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#0B4DFF] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Balance Banner Card */}
      <div className="bg-linear-to-br from-[#0A1A44] via-[#0B4DFF] to-[#1DA1FF] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Gross Total Earnings
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">${totalEarnings.toFixed(2)}</h3>
            <span className="text-[11px] text-blue-200 mt-1 block">Lifetime revenue on UBS Global</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
              Available to Withdraw
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-400">${pendingWithdrawal.toFixed(2)}</h3>
            <span className="text-[11px] text-blue-200 mt-1 block">Ready for transfer</span>
          </div>

          <div className="flex items-center sm:justify-end">
            <button
              onClick={() => {
                setWithdrawAmount(pendingWithdrawal.toString());
                setWithdrawModalOpen(true);
              }}
              disabled={pendingWithdrawal <= 0}
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#0B4DFF] disabled:bg-slate-300 disabled:text-slate-500 hover:bg-blue-50 text-xs font-extrabold rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0A1A44] mb-1">Transaction Breakdown</h3>
        <p className="text-xs text-slate-500 mb-6">Detailed ledger of order commissions and payout withdrawals</p>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium mt-3">Loading transaction history...</p>
          </div>
        ) : txList.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium">
            No transactions recorded yet. Completed orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Net Seller Earnings</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txList.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(tx.createdAt || tx.paidAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">${(tx.grossAmount || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-slate-500">${(tx.commissionAmount || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">${(tx.sellerEarnings || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{tx.paymentMethod || 'Online'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0A1A44] mb-1">Request Seller Payout</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter amount to transfer to your linked bank account or UPI ID.
            </p>

            {withdrawError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-[#0A1A44]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available: ${pendingWithdrawal.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw}
                  className="px-6 py-2 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#093ecf]"
                >
                  {submittingWithdraw ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
