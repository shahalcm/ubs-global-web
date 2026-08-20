'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, CheckCircle, ShieldCheck, X } from 'lucide-react';
import api from '@/lib/api';
import { useSeller } from '@/context/SellerContext';

export default function SellerPickupAddressesPage() {
  const { seller, refreshSeller } = useSeller();
  const [pickupAddresses, setPickupAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    pickup_location: 'Warehouse_Main',
    name: '',
    phone: '',
    email: '',
    address: '',
    address_2: '',
    city: '',
    state: '',
    country: 'India',
    pin_code: '',
    isDefault: true,
  });

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/sellers/pickup-addresses');
      if (res.data?.success) {
        setPickupAddresses(res.data.pickupAddresses || []);
      }
    } catch (err) {
      console.error('Error loading pickup locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSetDefault = async (locId: string) => {
    try {
      const res = await api.patch(`/sellers/pickup-addresses/${locId}/default`);
      if (res.data?.success) {
        await loadAddresses();
        await refreshSeller();
      }
    } catch (err) {
      console.error('Error setting default pickup location:', err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickup_location || !form.name || !form.phone || !form.address || !form.city || !form.pin_code) {
      setFormError('Please fill in all required fields (Location Tag, Name, Phone, Address, City, Pincode).');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const res = await api.post('/sellers/pickup-addresses', form);
      if (res.data?.success) {
        setIsModalOpen(false);
        await loadAddresses();
        await refreshSeller();
      } else {
        setFormError(res.data?.message || 'Failed to add pickup location.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Server error adding pickup address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Shiprocket Pickup Locations</h2>
          <p className="text-xs text-slate-500">
            Manage dispatch addresses synced directly with automated courier pickup services
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pickup Location</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium mt-3">Loading pickup addresses...</p>
          </div>
        ) : pickupAddresses.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
            No pickup locations registered. Add a location to enable courier order dispatch.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupAddresses.map((loc) => (
              <div
                key={loc._id || loc.pickup_location}
                className={`p-5 rounded-2xl border transition-all ${
                  loc.isDefault
                    ? 'bg-blue-50/40 border-[#0B4DFF] shadow-xs'
                    : 'bg-slate-50/50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B4DFF]" />
                    <span className="text-xs font-bold font-mono text-[#0A1A44] uppercase">
                      {loc.pickup_location}
                    </span>
                  </div>

                  {loc.isDefault ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0B4DFF] text-white text-[10px] font-bold">
                      DEFAULT PICKUP
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(loc._id || loc.pickup_location)}
                      className="text-[11px] font-bold text-[#0B4DFF] hover:underline"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">{loc.name} ({loc.phone})</p>
                  <p>{loc.address}</p>
                  <p>{loc.city}, {loc.state} - {loc.pin_code}</p>
                  <p className="text-[11px] text-slate-400">{loc.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Pickup Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0A1A44] mb-1">Add Dispatch Pickup Location</h3>
            <p className="text-xs text-slate-500 mb-6">Address where couriers will arrive to collect packed parcels</p>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Location Tag *</label>
                <input
                  type="text"
                  required
                  value={form.pickup_location}
                  onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                  placeholder="e.g. Main_Warehouse / Store_Hub"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Building No, Street Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pin Code *</label>
                  <input
                    type="text"
                    required
                    value={form.pin_code}
                    onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#093ecf]"
                >
                  {submitting ? 'Saving...' : 'Sync & Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
