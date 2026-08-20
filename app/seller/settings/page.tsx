'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Store, Building2, CreditCard, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';

export default function SellerSettingsPage() {
  const { seller, updateProfile, refreshSeller } = useSeller();

  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    description: '',
    businessType: '',
    street: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (seller) {
      setForm({
        shopName: seller.shopName || '',
        ownerName: seller.ownerName || '',
        phone: seller.phone || '',
        description: seller.description || '',
        businessType: seller.businessType || '',
        street: seller.address?.street || '',
        bankName: seller.bankDetails?.bankName || '',
        accountNumber: seller.bankDetails?.accountNumber || '',
        ifscCode: seller.bankDetails?.ifscCode || '',
        upiId: seller.bankDetails?.upiId || '',
      });
    }
  }, [seller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      const success = await updateProfile({
        shopName: form.shopName,
        description: form.description,
        phone: form.phone,
        businessType: form.businessType,
        address: { street: form.street },
        bankDetails: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          upiId: form.upiId,
        },
      });

      if (success) {
        setSuccessMsg('Store settings updated successfully!');
        await refreshSeller();
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#0A1A44]">Store Settings & Profile</h2>
        <p className="text-xs text-slate-500">Manage public store credentials, bank details and contact info</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0A1A44] border-b border-slate-100 pb-3">Basic Store Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name</label>
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0A1A44] border-b border-slate-100 pb-3">Bank & Payout Accounts</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC / Routing Code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID</label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
