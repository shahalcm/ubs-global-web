'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Loader2, ArrowLeft, MapPin, ClipboardList, CheckCircle2, Landmark } from 'lucide-react';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { items, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pastAddress, setPastAddress] = useState<any>(null);

  // Group items by seller
  const groupedItems = items.reduce((acc: Record<string, typeof items>, item) => {
    const sId = item.sellerId || 'unknown';
    if (!acc[sId]) acc[sId] = [];
    acc[sId].push(item);
    return acc;
  }, {});

  const sellerIds = Object.keys(groupedItems);
  const activeSellerId = sellerIds[0] || '';
  const activeItems = groupedItems[activeSellerId] || [];

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    const fetchPastAddress = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.orders && res.data.orders.length > 0) {
          const orderWithAddress = res.data.orders.find((o: any) => o.deliveryAddress && o.deliveryAddress.street);
          if (orderWithAddress?.deliveryAddress) {
            setPastAddress(orderWithAddress.deliveryAddress);
          }
        }
      } catch (err) {
        console.error('Error fetching past address:', err);
      }
    };
    fetchPastAddress();
  }, [items, router]);

  const handleAutofillPastAddress = () => {
    if (pastAddress) {
      setAddress({
        fullName: pastAddress.fullName || user?.name || '',
        phone: pastAddress.phone || user?.phone || '',
        email: pastAddress.email || user?.email || '',
        street: pastAddress.street || '',
        city: pastAddress.city || '',
        state: pastAddress.state || '',
        country: pastAddress.country || '',
        zipCode: pastAddress.zipCode || '',
      });
      setErrors({});
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!address.fullName.trim()) tempErrors.fullName = t('Full Name is required');
    if (!address.phone.trim()) tempErrors.phone = t('Phone Number is required');
    if (!address.street.trim()) tempErrors.street = t('Street Address is required');
    if (!address.city.trim()) tempErrors.city = t('City is required');
    if (!address.country.trim()) tempErrors.country = t('Country is required');

    if (address.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      tempErrors.email = t('Please enter a valid email address');
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const subtotal = activeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = 15.0;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + shippingFee + tax;

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create Razorpay Order
      const res = await api.post('/payments/create-order', {
        items: activeItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        sellerId: activeSellerId,
        deliveryAddress: address,
      });

      if (res.data?.success) {
        const { razorpayOrderId, amount, orderId, orderNumber, key } = res.data;
        
        // Redirect to payment gateway page
        router.push(
          `/payment?razorpayOrderId=${razorpayOrderId}&amount=${amount}&orderId=${orderId}&orderNumber=${orderNumber}&grandTotal=${grandTotal.toFixed(
            2
          )}&key=${key}`
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('Failed to initialize order.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('Back')}</span>
        </button>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ClipboardList size={24} className="text-primary" />
          <span>{t('Checkout')}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address Inputs Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-bold text-slate-800 text-base">{t('Shipping Details')}</h3>
                {pastAddress && (
                  <button
                    type="button"
                    onClick={handleAutofillPastAddress}
                    className="text-[11px] font-bold text-accent hover:text-accent-dark transition-colors cursor-pointer bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/5"
                  >
                    {t('Autofill Past Address')}
                  </button>
                )}
              </div>

              <form onSubmit={handleContinueToPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('Recipient Full Name')} *
                    </label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                      required
                    />
                    {errors.fullName && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('Recipient Phone')} *
                    </label>
                    <input
                      type="text"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                      required
                    />
                    {errors.phone && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Email Address')}
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                  />
                  {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Street Address')} *
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Apartment, suite, unit, building, floor, street address"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                    required
                  />
                  {errors.street && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('City')} *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                      required
                    />
                    {errors.city && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.city}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('State')}
                    </label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('Country')} *
                    </label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                      required
                    />
                    {errors.country && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.country}</p>}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('Zip Code')}
                    </label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary bg-slate-50/50 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 mt-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{t('Initializing Order...')}</span>
                    </>
                  ) : (
                    <span>{t('Continue to Payment')} →</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Cart items check panel */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <Landmark size={16} className="text-primary" />
                <span>{t('Order Check')}</span>
              </h3>

              <div className="max-h-40 overflow-y-auto space-y-3 pr-1">
                {activeItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                      <img
                        src={
                          item.image.startsWith('http')
                            ? item.image
                            : `${process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ubsglobalapp.com'}/${item.image}`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-700 text-xs truncate">{t(item.name)}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Qty: {item.quantity} • ${item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout details */}
              <hr className="border-slate-50" />

              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>{t('Subtotal')}</span>
                  <span className="text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Shipping Fee')}</span>
                  <span className="text-slate-800 font-bold">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Estimated Tax (5%)')}</span>
                  <span className="text-slate-800 font-bold">${tax.toFixed(2)}</span>
                </div>
                <hr className="border-slate-50 my-1" />
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-slate-800 font-bold">{t('Total Price')}</span>
                  <span className="text-primary font-black">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
