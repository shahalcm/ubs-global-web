'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Building2,
  FileCheck,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Tag,
  Sparkles,
  Upload,
  Globe,
  DollarSign,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSeller } from '@/context/SellerContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+92', flag: '🇵🇰', name: 'PK' },
  { code: '+880', flag: '🇧🇩', name: 'BD' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { seller, loading: sellerLoading, refreshSeller } = useSeller();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Regional Pricing Offer
  const [offer, setOffer] = useState<any>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Phone Country Code
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[2]); // Default +91

  // Form State
  const [form, setForm] = useState({
    shopName: '',
    ownerName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    businessType: 'Sole Proprietorship',
    gstNumber: '',
    website: '',
    categories: 'Electronics, Apparel, Accessories',
    yearEstablished: '2023',
    description: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  // Files
  const [shopLogoFile, setShopLogoFile] = useState<File | null>(null);
  const [shopLogoPreview, setShopLogoPreview] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerLoading && seller && seller.registrationFeePaid) {
      router.replace('/seller/dashboard');
    }
  }, [seller, sellerLoading, router]);

  useEffect(() => {
    loadRegistrationOffer();
  }, []);

  const loadRegistrationOffer = async () => {
    try {
      setOfferLoading(true);
      const res = await api.get('/seller-registration/offer');
      if (res.data?.success) {
        setOffer(res.data);
        if (res.data.promo?.code) {
          setPromoCodeInput(res.data.promo.code);
        }
        const matched = COUNTRIES.find((c) => c.name === res.data.country);
        if (matched) {
          setSelectedCountry(matched);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 400 && (err.response?.data?.message?.includes('already paid') || err.response?.data?.message?.includes('already submitted'))) {
        router.replace('/seller/dashboard');
      } else {
        console.warn('Notice loading regional offer:', err.response?.data?.message || err.message);
        setErrorMessage(err.response?.data?.message || 'Could not load registration offer.');
      }
    } finally {
      setOfferLoading(false);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCodeInput.trim() || !offer?.offerId) return;
    try {
      setApplyingPromo(true);
      setErrorMessage(null);
      setPromoSuccessMsg(null);
      const res = await api.post('/seller-registration/promo/validate', {
        offerId: offer.offerId,
        code: promoCodeInput.trim(),
      });
      if (res.data?.success) {
        setPromoSuccessMsg('Promo code applied successfully!');
        setOffer((prev: any) => ({
          ...prev,
          finalAmount: res.data.finalAmount,
          discount: {
            ...prev?.discount,
            amount: res.data.discountAmount,
            value: res.data.promo.discountValue,
            type: res.data.promo.discountType,
          },
          promo: {
            available: true,
            code: res.data.promo.code,
          },
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired promo code.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setShopLogoFile(file);
      setShopLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdProofFile(file);
      setIdProofPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = (stepNum: number) => {
    setErrorMessage(null);
    if (stepNum === 2) {
      if (!form.shopName.trim() || !form.ownerName.trim() || !form.phone.trim() || !form.address.trim()) {
        setErrorMessage('Please fill in all required business fields (Shop Name, Owner Name, Phone, Address).');
        return false;
      }
    }
    if (stepNum === 3) {
      if (!shopLogoFile && !shopLogoPreview) {
        setErrorMessage('Please upload a Shop Logo to proceed.');
        return false;
      }
      if (!idProofFile && !idProofPreview) {
        setErrorMessage('Please upload an ID Proof (Govt ID or Business Registration) to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Load Razorpay script if needed
      if (offer?.finalAmount > 0 && !window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      let paymentDetails: any = {};

      if (offer?.finalAmount > 0) {
        // Step A: Create Razorpay Order
        const payRes = await api.post('/seller-registration/create-payment', {
          offerId: offer.offerId,
        });

        if (!payRes.data?.success) {
          throw new Error(payRes.data?.message || 'Payment creation failed');
        }

        const { razorpayOrderId, amount, currency, key } = payRes.data;

        // Step B: Trigger Razorpay Modal
        const rzpResult: any = await new Promise((resolve, reject) => {
          const options = {
            key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount,
            currency: currency || 'INR',
            name: 'UBS Global Seller Registration',
            description: `Store Registration Fee (${offer.region} Tier)`,
            order_id: razorpayOrderId,
            handler: function (response: any) {
              resolve(response);
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment process cancelled by user.'));
              },
            },
            prefill: {
              name: form.ownerName,
              email: user?.email,
              contact: form.phone,
            },
            theme: {
              color: '#0B4DFF',
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        });

        paymentDetails = {
          razorpayOrderId: rzpResult.razorpay_order_id,
          razorpayPaymentId: rzpResult.razorpay_payment_id,
          razorpaySignature: rzpResult.razorpay_signature,
        };
      }

      // Step C: Submit Seller Application FormData
      const formData = new FormData();
      formData.append('shopName', form.shopName);
      formData.append('ownerName', form.ownerName);
      formData.append('phone', `${selectedCountry.code}${form.phone}`);
      formData.append('address', form.address);
      formData.append('businessType', form.businessType);
      formData.append('gstNumber', form.gstNumber);
      formData.append('website', form.website);
      formData.append('categories', form.categories);
      formData.append('yearEstablished', form.yearEstablished);
      formData.append('description', form.description);
      formData.append('bankDetails', JSON.stringify({
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        upiId: form.upiId,
      }));

      if (offer?.offerId) {
        formData.append('offerId', offer.offerId);
      }
      if (paymentDetails.razorpayOrderId) {
        formData.append('razorpayOrderId', paymentDetails.razorpayOrderId);
        formData.append('razorpayPaymentId', paymentDetails.razorpayPaymentId);
        formData.append('razorpaySignature', paymentDetails.razorpaySignature);
      }

      if (shopLogoFile) {
        formData.append('shopLogo', shopLogoFile);
      }
      if (idProofFile) {
        formData.append('idProof', idProofFile);
      }

      const applyRes = await api.post('/sellers/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (applyRes.data?.success) {
        await refreshSeller();
        router.push('/seller/dashboard');
      } else {
        throw new Error(applyRes.data?.message || 'Failed to submit application');
      }
    } catch (err: any) {
      console.error('Seller registration submission error:', err);
      setErrorMessage(err.message || 'Server error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Regional Offer', icon: Tag },
    { num: 2, label: 'Store Details', icon: Building2 },
    { num: 3, label: 'Documents', icon: FileCheck },
    { num: 4, label: 'Bank Details', icon: CreditCard },
    { num: 5, label: 'Review & Pay', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-[#0A1A44] mb-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <span>UBS Global</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B4DFF] font-bold">
            SELLER PORTAL
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1A44]">
          Become an Authorized UBS Global Seller
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Reach millions of buyers across 190+ countries with regional pricing support and localized fulfillment.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="max-w-4xl mx-auto mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"></div>
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-linear-to-tr from-[#0B4DFF] to-[#1DA1FF] text-white shadow-lg shadow-blue-500/30 scale-110 ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-[#0B4DFF] font-bold' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Step Cards Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/70 p-6 sm:p-10">
        {/* STEP 1: Regional Offer & Pricing */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1A44]">Regional Seller Registration Offer</h2>
                <p className="text-xs text-slate-500">
                  Dynamic location-based fee reduction automatically detected for your region.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0B4DFF] rounded-full text-xs font-bold border border-blue-200">
                <Globe className="w-4 h-4" />
                <span>Country: {offer?.country || 'Detected'}</span>
              </div>
            </div>

            {offerLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-medium mt-3">Detecting country & calculating regional discount...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pricing Summary Card */}
                <div className="lg:col-span-2 bg-linear-to-br from-[#0A1A44] to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#0B4DFF]/30 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-wider text-blue-300 uppercase">
                      {offer?.region || 'STANDARD'} REGION TIER
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      {offer?.discount?.value > 0 ? `${offer.discount.value}% REGIONAL OFF` : 'REGULAR'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        ${offer?.finalAmount ?? 200} USD
                      </span>
                      {offer?.baseAmount > offer?.finalAmount && (
                        <span className="text-base text-slate-400 line-through">
                          ${offer.baseAmount} USD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      Includes 1-Year Full UBS Global Seller License, Unlimited Product Uploads, and Verified Badge.
                    </p>
                  </div>

                  {/* Promo Input */}
                  <div className="border-t border-slate-700/60 pt-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Have a Promo Code or Special Voucher?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTER PROMO CODE"
                        className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:border-[#0B4DFF]"
                      />
                      <button
                        type="button"
                        onClick={handleValidatePromo}
                        disabled={applyingPromo}
                        className="px-4 py-2 bg-[#0B4DFF] hover:bg-[#1DA1FF] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        {applyingPromo ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {promoSuccessMsg && (
                      <p className="text-xs font-medium text-emerald-400 mt-2">{promoSuccessMsg}</p>
                    )}
                  </div>
                </div>

                {/* Benefits Side List */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider mb-3">
                      Seller Privileges
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Global buyer network & storefront</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Shiprocket & logistics integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Instant multi-currency withdrawals</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Real-time buyer chat & notifications</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Store & Business Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#0A1A44]">Business & Store Profile</h2>
              <p className="text-xs text-slate-500">Provide your official store identity and contact information.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={form.shopName}
                  onChange={handleFormChange}
                  placeholder="e.g. Apex Global Electronics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleFormChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = COUNTRIES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="px-2.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code + c.name} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="9876543210"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Entity Type
                </label>
                <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                  <option value="Partnership">Partnership / LLP</option>
                  <option value="Individual">Individual / Freelancer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Street Address, City, State, Country"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST / VAT Tax ID (Optional)
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleFormChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website / Social Link (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleFormChange}
                  placeholder="https://mybusiness.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Briefly summarize what products or services your store specializes in..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Documents Upload */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#0A1A44]">Store Branding & Documents</h2>
              <p className="text-xs text-slate-500">Upload your logo and government ID or business registration proof.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shop Logo Upload */}
              <div className="border-2 border-dashed border-slate-200 hover:border-[#0B4DFF] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50 relative">
                {shopLogoPreview ? (
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-md">
                    <img src={shopLogoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      Change Logo
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer w-full">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#0A1A44]">Upload Shop Logo</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* ID Proof Upload */}
              <div className="border-2 border-dashed border-slate-200 hover:border-[#0B4DFF] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50 relative">
                {idProofPreview ? (
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-md">
                    <img src={idProofPreview} alt="ID Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      Change Document
                      <input type="file" accept="image/*,.pdf" onChange={handleIdProofChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer w-full">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B4DFF] flex items-center justify-center mb-2">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#0A1A44]">Upload ID / Business Proof</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Passport, Aadhaar, GST or Reg License</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleIdProofChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Bank Details */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#0A1A44]">Payout & Bank Details</h2>
              <p className="text-xs text-slate-500">Provide bank information for automated earnings payouts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleFormChange}
                  placeholder="e.g. HDFC Bank / Chase Bank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleFormChange}
                  placeholder="123456789098"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IFSC / SWIFT / Routing Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleFormChange}
                  placeholder="HDFC0001234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={form.upiId}
                  onChange={handleFormChange}
                  placeholder="username@bank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#0A1A44]">Review & Submit Application</h2>
              <p className="text-xs text-slate-500">Confirm your application details before completing registration.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Shop Name:</span>
                <span className="font-bold text-[#0A1A44]">{form.shopName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Owner Name:</span>
                <span className="font-bold text-[#0A1A44]">{form.ownerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-[#0A1A44]">{selectedCountry.code} {form.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Registration Fee Due:</span>
                <span className="font-bold text-[#0B4DFF]">
                  ${offer?.finalAmount ?? 200} USD {offer?.finalAmount === 0 && '(VIP FREE)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By clicking <strong>"Submit Application"</strong>, you agree to the UBS Global Seller Agreement and store verification terms.
            </p>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-linear-to-r from-[#0B4DFF] to-[#1DA1FF] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-[#0B4DFF] to-[#1DA1FF] text-white text-xs font-bold rounded-xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Application...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit & Pay Registration Fee</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
