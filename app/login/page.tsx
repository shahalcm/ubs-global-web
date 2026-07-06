'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Loader2, Phone, AlertCircle } from 'lucide-react';

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+92', flag: '🇵🇰', name: 'PK' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
];

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[2]); // Default IN (+91) or US (+1)
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setErrorMsg(t('Please enter a valid phone number'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = selectedCountry.code + phone;
      // Request send OTP from backend
      const res = await api.post('/auth/send-otp', { phone: fullPhone });
      
      // Navigate to OTP page
      router.push(`/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.response?.data?.message || t('Failed to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginMock = () => {
    // Standard mock verification fallback on local env, or explain Firebase Google Sign-In setup
    setErrorMsg(t('Google Sign-In is only available on Mobile currently. Please log in using Phone OTP.'));
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linear-to-br from-primary via-primary-dark to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden animate-scale-in">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />

        <div className="relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-wider text-primary">
              UBS <span className="text-accent">GLOBAL</span>
            </h1>
            <p className="mt-2.5 text-sm font-semibold text-slate-500">
              {t('Welcome back')}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t('Enter your phone number to receive a secure login code')}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('Phone Number')}
              </label>

              <div className="flex gap-2">
                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="h-13 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-sm">{selectedCountry.code}</span>
                  </button>

                  {showPicker && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
                      <div className="absolute left-0 mt-2 w-48 max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20 animate-fade-in">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowPicker(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          >
                            <span className="text-lg">{c.flag}</span>
                            <span className="font-semibold text-slate-600">{c.code}</span>
                            <span className="text-slate-400 text-xs truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Number Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={15}
                    className="w-full h-13 pl-11 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold tracking-wider"
                    required
                    disabled={loading}
                  />
                  <Phone size={16} className="absolute left-4 top-4.5 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Please wait...')}</span>
                </>
              ) : (
                <span>{t('Continue')} →</span>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="my-8 flex items-center gap-3">
            <hr className="flex-1 border-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('OR')}</span>
            <hr className="flex-1 border-slate-100" />
          </div>

          {/* Google Login Mock Button */}
          <button
            onClick={handleGoogleLoginMock}
            className="w-full h-13 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#ea4335"
                d="M12 5.04c1.78 0 3.39.61 4.65 1.8l3.48-3.48C17.97 1.24 15.22.4 12 .4 7.37.4 3.4 3.07 1.48 6.97l4.08 3.16C6.54 7.28 9.04 5.04 12 5.04z"
              />
              <path
                fill="#4285f4"
                d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.38-2.6.26-6.52 0-11.16 0z"
              />
              <path
                fill="#fbbc05"
                d="M5.56 10.13c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.48 4.27C.53 6.18 0 8.32 0 10.6s.53 4.42 1.48 6.33l4.08-3.16c-.25-.74-.39-1.53-.39-2.35L5.56 10.13z"
              />
              <path
                fill="#34a853"
                d="M12 20.6c3.24 0 5.96-1.07 7.95-2.91l-3.66-2.84c-1.02.68-2.32 1.09-3.95 1.09-2.96 0-5.46-2.24-6.44-5.09L1.48 13.91C3.4 17.8 7.37 20.6 12 20.6z"
              />
            </svg>
            <span>{t('Continue with Google')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
