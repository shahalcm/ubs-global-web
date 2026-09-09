'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart, CartItem } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Building2,
  CreditCard,
  Banknote,
  Truck,
  ShieldCheck,
  AlertCircle,
  Tag,
  Store,
  ChevronRight,
  Package,
  Home,
  Briefcase,
  Sparkles,
  Lock,
  X,
  Zap
} from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

interface AddressForm {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  addressType: 'home' | 'work' | 'other';
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
}

function CheckoutContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterSellerParam = searchParams.get('sellerId');

  const { user, isAuthenticated, loading: authLoading, login: performAuthLogin } = useAuth();
  const { items, clearCart, removeFromCart } = useCart();

  // Quick sign-in modal state for unauthenticated users
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoadingModal, setAuthLoadingModal] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [address, setAddress] = useState<AddressForm>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    landmark: '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || 'India',
    zipCode: '',
    addressType: 'home',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pastAddress, setPastAddress] = useState<any>(null);

  // Checkout Options
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [sellerNote, setSellerNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Active vendor selection if cart has multi-vendor items
  const [selectedSellerTab, setSelectedSellerTab] = useState<string>('all');

  // Multi-vendor grouping & seller normalization
  const sellerGroups = useMemo<SellerGroup[]>(() => {
    const groups: Record<string, SellerGroup> = {};

    for (const item of items) {
      // Normalize sellerId string (never allow '[object Object]' or null)
      let sId = item.sellerId;
      if (typeof sId === 'object' && sId !== null) {
        sId = (sId as any)._id || (sId as any).id || '';
      }
      sId = String(sId || '').trim();
      if (!sId || sId.includes('[object')) {
        sId = 'global_verified_seller';
      }

      const sName = item.sellerName || 'UBS Global Verified Seller';

      if (!groups[sId]) {
        groups[sId] = {
          sellerId: sId,
          sellerName: sName,
          items: [],
          subtotal: 0,
          shippingFee: 0,
        };
      }

      groups[sId].items.push(item);
      groups[sId].subtotal += (item.price || 0) * (item.quantity || 1);

      // Shipping calculation for this seller
      if (!item.freeShipping && item.shippingFee) {
        groups[sId].shippingFee = Math.max(groups[sId].shippingFee, Number(item.shippingFee));
      }
    }

    return Object.values(groups);
  }, [items]);

  // Determine which items are being checked out
  const checkoutItems = useMemo(() => {
    if (selectedSellerTab === 'all') {
      return items;
    }
    const targetGroup = sellerGroups.find((g) => g.sellerId === selectedSellerTab);
    return targetGroup ? targetGroup.items : items;
  }, [items, selectedSellerTab, sellerGroups]);

  // Set initial selected tab based on query param if present
  useEffect(() => {
    if (filterSellerParam && sellerGroups.some((g) => g.sellerId === filterSellerParam)) {
      setSelectedSellerTab(filterSellerParam);
    }
  }, [filterSellerParam, sellerGroups]);

  // Unauthenticated users can view and fill the form smoothly; auth prompt appears upon placing order

  // Sync user defaults into address
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        city: prev.city || user.location?.city || '',
        state: prev.state || user.location?.state || '',
        country: prev.country || user.location?.country || 'India',
      }));
    }
  }, [user]);

  // Redirect if cart is empty and fetch past delivery address
  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push('/cart');
      return;
    }

    const fetchPastAddress = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.orders && res.data.orders.length > 0) {
          const orderWithAddress = res.data.orders.find(
            (o: any) => o.deliveryAddress && o.deliveryAddress.street
          );
          if (orderWithAddress?.deliveryAddress) {
            setPastAddress(orderWithAddress.deliveryAddress);
          }
        }
      } catch (err) {
        console.warn('Past address fetch notice:', err);
      }
    };

    fetchPastAddress();
  }, [items, router, isAuthenticated, authLoading]);

  // Autofill past address
  const handleAutofillPastAddress = () => {
    if (pastAddress) {
      setAddress({
        fullName: pastAddress.fullName || pastAddress.name || user?.name || '',
        phone: pastAddress.phone || user?.phone || '',
        email: pastAddress.email || user?.email || '',
        street: pastAddress.street || '',
        landmark: pastAddress.landmark || '',
        city: pastAddress.city || '',
        state: pastAddress.state || '',
        country: pastAddress.country || 'India',
        zipCode: pastAddress.zipCode || '',
        addressType: pastAddress.addressType || 'home',
      });
      setErrors({});
    }
  };

  // Pricing calculations
  const itemsSubtotal = useMemo(() => {
    return checkoutItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  }, [checkoutItems]);

  const baseShippingFee = useMemo(() => {
    if (checkoutItems.length === 0) return 0;
    // If all items offer free shipping
    const hasPaidShipping = checkoutItems.some((i) => !i.freeShipping);
    if (!hasPaidShipping) return 0;

    // Use highest item shipping fee or default standard fee
    const maxFee = checkoutItems.reduce((max, i) => Math.max(max, i.shippingFee || 0), 0);
    return maxFee > 0 ? maxFee : 15.0;
  }, [checkoutItems]);

  const expressExtraFee = shippingSpeed === 'express' ? 9.99 : 0;
  const totalShipping = baseShippingFee + expressExtraFee;
  const tax = itemsSubtotal * 0.05;
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const grandTotal = Math.max(0, itemsSubtotal + totalShipping + tax - discount);

  // Delivery estimation text
  const estimatedDelivery = useMemo(() => {
    const d = new Date();
    const days = shippingSpeed === 'express' ? 2 : 5;
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [shippingSpeed]);

  // Promo code apply handler
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code');
      return;
    }

    setApplyingPromo(true);
    setTimeout(() => {
      if (code === 'UBS10' || code === 'WELCOME10') {
        const disc = Number((itemsSubtotal * 0.1).toFixed(2));
        setAppliedPromo({ code, discount: disc });
        setPromoCode('');
      } else if (code === 'FREESHIP') {
        setAppliedPromo({ code, discount: baseShippingFee });
        setPromoCode('');
      } else {
        setPromoError('Invalid coupon code. Try UBS10 or WELCOME10');
      }
      setApplyingPromo(false);
    }, 400);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // Form validation
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    const fullNameVal = (address.fullName || '').trim();
    const phoneVal = (address.phone || '').trim();
    const streetVal = (address.street || '').trim();
    const cityVal = (address.city || '').trim();
    const countryVal = (address.country || '').trim();
    const zipVal = (address.zipCode || '').trim();
    const emailVal = (address.email || '').trim();

    if (!fullNameVal) tempErrors.fullName = t('Full Name is required');
    if (!phoneVal) tempErrors.phone = t('Phone Number is required');
    else if (phoneVal.length < 7) tempErrors.phone = t('Enter a valid phone number');

    if (!streetVal) tempErrors.street = t('Street Address is required');
    if (!cityVal) tempErrors.city = t('City is required');
    if (!countryVal) tempErrors.country = t('Country is required');
    if (!zipVal) tempErrors.zipCode = t('ZIP / Postal Code is required');

    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      tempErrors.email = t('Please enter a valid email address');
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Core order placement execution
  const executeOrderPlacement = async () => {
    setLoading(true);

    try {
      const formattedAddress = {
        fullName: address.fullName.trim(),
        name: address.fullName.trim(),
        phone: address.phone.trim(),
        email: address.email.trim(),
        street: address.street.trim(),
        landmark: address.landmark.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        country: address.country.trim(),
        zipCode: address.zipCode.trim(),
        addressType: address.addressType,
        deliveryInstructions: address.landmark.trim(),
      };

      // Extract accurate sellerId (target primary seller if single vendor or selected vendor)
      const primarySellerId =
        selectedSellerTab !== 'all'
          ? selectedSellerTab
          : sellerGroups[0]?.sellerId && sellerGroups[0].sellerId !== 'global_verified_seller'
          ? sellerGroups[0].sellerId
          : undefined;

      // Handle Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        const res = await api.post('/orders', {
          items: checkoutItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          sellerId: primarySellerId,
          deliveryAddress: formattedAddress,
          paymentMethod: 'cod',
          shippingSpeed,
          sellerNote: sellerNote.trim(),
        });

        if (res.data?.success) {
          // Clear checked-out items from cart
          if (selectedSellerTab === 'all' || sellerGroups.length <= 1) {
            clearCart();
          } else {
            checkoutItems.forEach((i) => removeFromCart(i.productId));
          }

          const createdOrderId =
            res.data.orders?.[0]?._id || res.data.order?._id || res.data.orderId;
          if (createdOrderId) {
            router.push(`/order-tracking/${createdOrderId}`);
          } else {
            router.push('/orders');
          }
          return;
        }
      }

      // Handle Online Payment (Razorpay)
      const res = await api.post('/payments/create-order', {
        items: checkoutItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        sellerId: primarySellerId,
        currency: 'USD',
        amount: grandTotal,
        shippingSpeed,
        sellerNote: sellerNote.trim(),
        deliveryAddress: formattedAddress,
      });

      if (res.data?.success) {
        const { razorpayOrderId, amount, orderId, orderNumber, key } = res.data;

        // Redirect to payment gateway page
        router.push(
          `/payment?razorpayOrderId=${razorpayOrderId}&amount=${amount}&orderId=${orderId}&orderNumber=${orderNumber}&grandTotal=${grandTotal.toFixed(
            2
          )}&key=${key}`
        );
      } else {
        alert(res.data?.message || t('Failed to initialize order payment.'));
      }
    } catch (err: any) {
      console.warn('Order submission notice:', err?.response?.data?.message || err?.message);
      alert(err.response?.data?.message || t('Failed to process your order. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Place Order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (checkoutItems.length === 0) {
      alert(t('Your cart is empty.'));
      router.push('/cart');
      return;
    }

    // If not authenticated, open quick auth modal without losing checkout inputs
    if (!isAuthenticated) {
      setAuthPhone(address.phone || '9876543210');
      setAuthPassword('');
      setAuthError('');
      setShowAuthModal(true);
      return;
    }

    await executeOrderPlacement();
  };

  // Quick Sign In Modal Handler
  const handleQuickLogin = async (phoneToUse?: string, passToUse?: string) => {
    const p = (phoneToUse || authPhone).trim();
    const pw = passToUse || authPassword;
    if (!p) {
      setAuthError(t('Please enter your phone number'));
      return;
    }
    if (!pw) {
      setAuthError(t('Please enter your password'));
      return;
    }

    setAuthLoadingModal(true);
    setAuthError('');

    try {
      const fullPhone = p.startsWith('+') ? p : (p.length === 10 ? `+91${p}` : p);
      const res = await api.post('/auth/login', { phone: fullPhone, password: pw });
      if (res.data?.success && res.data?.token) {
        await performAuthLogin(res.data.user, res.data.token);
        setShowAuthModal(false);
        // Continue order placement directly
        setTimeout(() => {
          executeOrderPlacement();
        }, 150);
      } else {
        setAuthError(res.data?.message || t('Login failed. Please verify credentials.'));
      }
    } catch (err: any) {
      console.warn('Quick login notice:', err?.response?.data?.message || err?.message);
      setAuthError(err.response?.data?.message || t('Incorrect password or user not found.'));
    } finally {
      setAuthLoadingModal(false);
    }
  };

  const handle1ClickDemoLogin = async () => {
    setAuthPhone('9876543210');
    setAuthPassword('password123');
    await handleQuickLogin('9876543210', 'password123');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#0B4DFF]" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>{t('Back to Cart')}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <Lock size={14} />
            <span>{t('256-Bit SSL Encrypted Checkout')}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1A44] tracking-tight flex items-center gap-2.5">
            <ClipboardList size={28} className="text-[#0B4DFF]" />
            <span>{t('Secure Checkout')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete delivery details and select your preferred payment method
          </p>
        </div>

        {/* Guest info banner */}
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-linear-to-r from-blue-50 to-indigo-50/60 border border-blue-200/70 p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B4DFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {t('Checking out as Guest or New Customer')}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {t('Fill in your delivery address below. You can also sign in to autofill your saved addresses.')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthPhone(address.phone || '9876543210');
                setAuthPassword('');
                setAuthError('');
                setShowAuthModal(true);
              }}
              className="text-xs font-bold text-[#0B4DFF] hover:text-[#093ecf] px-3.5 py-2 bg-white rounded-xl border border-blue-200/80 shadow-2xs whitespace-nowrap cursor-pointer hover:bg-blue-50/50 transition-colors"
            >
              {t('Sign In')} →
            </button>
          </div>
        )}

        {/* Multi-Vendor Tabs if items come from multiple sellers */}
        {sellerGroups.length > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Store size={16} className="text-[#0B4DFF]" />
                {t('Your cart contains items from multiple vendors')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {sellerGroups.length} {t('vendors')}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedSellerTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSellerTab === 'all'
                    ? 'bg-[#0B4DFF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('All Vendors')} ({items.length})
              </button>

              {sellerGroups.map((g) => (
                <button
                  type="button"
                  key={g.sellerId}
                  onClick={() => setSelectedSellerTab(g.sellerId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedSellerTab === g.sellerId
                      ? 'bg-[#0B4DFF] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Store size={13} />
                  <span>{g.sellerName}</span>
                  <span className="text-[10px] opacity-75">({g.items.length})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Delivery Details, Shipping Speed, Payment Options, Seller Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. SHIPPING ADDRESS */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-bold text-[#0A1A44] text-base">{t('Shipping & Delivery Address')}</h3>
                </div>

                {pastAddress && (
                  <button
                    type="button"
                    onClick={handleAutofillPastAddress}
                    className="text-xs font-bold text-[#0B4DFF] hover:text-[#093ecf] transition-colors cursor-pointer bg-blue-50/80 hover:bg-blue-100/60 px-3 py-1.5 rounded-xl border border-blue-100"
                  >
                    {t('Autofill Past Address')}
                  </button>
                )}
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('Address Type')}
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'home', label: 'Home', icon: Home },
                    { id: 'work', label: 'Work / Office', icon: Briefcase },
                    { id: 'other', label: 'Other', icon: MapPin },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = address.addressType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setAddress({ ...address, addressType: type.id as any })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-[#0B4DFF] text-[#0B4DFF]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{t(type.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('Recipient Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                    />
                    {errors.fullName && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('Recipient Phone Number')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                    />
                    {errors.phone && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Email Address (for order updates)')}
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                  {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Street Address & House / Flat No.')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Flat 4B, Greenwood Apts, 12th Cross Road"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                  {errors.street && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Landmark / Area (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    placeholder="Near City Hospital, Opp. Metro Station"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('City')} *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                    {errors.city && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('State')} *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('Country')} *</label>
                    <input
                      type="text"
                      required
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      placeholder="e.g. India"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                    {errors.country && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('ZIP / Pincode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      placeholder="e.g. 400001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                    {errors.zipCode && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SHIPPING SPEED */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1A44] text-base">{t('Shipping Speed & Delivery')}</h3>
                  <p className="text-[11px] text-slate-400">Choose how quickly you want your package delivered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Standard */}
                <div
                  onClick={() => setShippingSpeed('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    shippingSpeed === 'standard'
                      ? 'border-[#0B4DFF] bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-[#0B4DFF]" />
                      <span className="font-bold text-xs text-[#0A1A44]">{t('Standard Delivery')}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#0B4DFF]">
                      {baseShippingFee > 0 ? `$${baseShippingFee.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Estimated delivery: <span className="font-bold text-slate-700">{estimatedDelivery} (3-5 Days)</span>
                  </p>
                </div>

                {/* Express */}
                <div
                  onClick={() => setShippingSpeed('express')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    shippingSpeed === 'express'
                      ? 'border-[#0B4DFF] bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <span className="font-bold text-xs text-[#0A1A44]">{t('Express Priority')}</span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-600">+$9.99</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Fast air priority delivery: <span className="font-bold text-slate-700">1-2 Business Days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT METHOD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1A44] text-base">{t('Payment Method')}</h3>
                  <p className="text-[11px] text-slate-400">Select how you want to pay for your order</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* Razorpay Card / UPI / NetBanking */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#0B4DFF] bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A1A44]">
                        {t('Online Payment (Cards, UPI, NetBanking, Wallets)')}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Secure instant checkout via Razorpay 256-bit gateway
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'razorpay' ? 'border-[#0B4DFF] bg-[#0B4DFF]' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-[#0B4DFF] bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A1A44]">{t('Cash on Delivery (COD)')}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Pay cash or UPI directly when your order is delivered
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-[#0B4DFF] bg-[#0B4DFF]' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. NOTE TO SELLER */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                {t('Instructions or Note to Seller (Optional)')}
              </label>
              <textarea
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                placeholder="e.g. Please pack carefully, gate code is 1234, deliver before 5 PM..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
              ></textarea>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary, Items by Seller, Coupon, and Pay Button */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
              <h3 className="font-extrabold text-[#0A1A44] text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>{t('Order Summary')}</span>
                <span className="text-xs text-slate-400 font-medium">
                  {checkoutItems.length} {t('items')}
                </span>
              </h3>

              {/* Items List Grouped by Seller */}
              <div className="max-h-64 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {sellerGroups
                  .filter((g) => selectedSellerTab === 'all' || g.sellerId === selectedSellerTab)
                  .map((group) => (
                    <div key={group.sellerId} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      {/* Seller Tag */}
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Store size={12} className="text-[#0B4DFF]" />
                        <span className="text-[11px] font-bold text-slate-700 truncate">{group.sellerName}</span>
                        <CheckCircle2 size={12} className="text-blue-500 shrink-0 ml-auto" />
                      </div>

                      {/* Items from this seller */}
                      {group.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            <img
                              src={getProductImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{t(item.name)}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] text-slate-400 font-medium">
                                Qty: <strong className="text-slate-700">{item.quantity}</strong>
                              </span>
                              <span className="text-xs font-extrabold text-[#0A1A44]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-slate-100">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-emerald-600" />
                      <span className="font-bold text-emerald-800">{appliedPromo.code}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        (-${appliedPromo.discount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-rose-600 font-bold text-[11px] hover:underline cursor-pointer"
                    >
                      {t('Remove')}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Coupon code (e.g. UBS10)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={applyingPromo}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {applyingPromo ? '...' : t('Apply')}
                      </button>
                    </div>
                    {promoError && <p className="text-rose-500 text-[10px] font-bold mt-1">{promoError}</p>}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>{t('Items Subtotal')}</span>
                  <span className="font-bold text-slate-800">${itemsSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t('Shipping Fee')}</span>
                  <span className="font-bold text-slate-800">
                    {totalShipping > 0 ? `$${totalShipping.toFixed(2)}` : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{t('Estimated Tax (5%)')}</span>
                  <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t('Discount')}</span>
                    <span>-${appliedPromo.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[#0A1A44]">{t('Total Amount')}</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#0B4DFF]">${grandTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">USD (incl. all taxes)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#0B4DFF] hover:bg-[#093ecf] text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>{t('Processing Order...')}</span>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote size={16} />
                    <span>{t('Place Order (Cash on Delivery)')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>{t('Proceed to Secure Payment')} →</span>
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Verified UBS Global Seller Guarantee</span>
              </div>
            </div>
          </div>
        </form>

        {/* Quick Sign-In Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative border border-slate-100">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center mx-auto mb-2 font-black">
                  <Lock size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-[#0A1A44]">
                  {t('Sign In to Complete Order')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('Enter your password to link this order, or use 1-click test login.')}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickLogin();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Phone Number')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoadingModal}
                  className="w-full py-3 rounded-xl bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {authLoadingModal ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      <span>{t('Signing In...')}</span>
                    </>
                  ) : (
                    <span>{t('Sign In & Place Order')} →</span>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 absolute">
                  {t('OR QUICK TEST')}
                </span>
              </div>

              <button
                type="button"
                onClick={handle1ClickDemoLogin}
                disabled={authLoadingModal}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Zap size={14} className="text-emerald-600 fill-emerald-600" />
                <span>{t('1-Click Test Login (Demo Buyer)')}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => router.push(`/login?redirect=/checkout`)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  {t('Go to Full Login Screen')} →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs font-semibold text-[#0A1A44]">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
