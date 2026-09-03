'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import {
  Loader2,
  Phone,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Store,
  ArrowRight
} from 'lucide-react';

const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
];

function SignupContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: performLogin } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp' | 'routing'>('phone');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default India (+91)
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 'otp') return;
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  const fullPhoneNumber = selectedCountry.code + phone.trim();

  // STEP 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 7) {
      setErrorMsg(t('Please enter a valid phone number'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.post('/auth/send-otp', { phone: fullPhoneNumber });
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.response?.data?.message || t('Failed to send verification code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // STEP 2: Verify OTP and check if account already exists
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg(t('Please enter all 6 digits of the verification code'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify OTP with backend
      const verifyRes = await api.post('/auth/verify-otp', {
        phone: fullPhoneNumber,
        otp: otpCode,
      });

      if (!verifyRes.data?.success) {
        throw new Error(verifyRes.data?.message || t('Invalid verification code'));
      }

      setStep('routing');
      setStatusMsg(t('Code verified! Checking account status...'));

      // 2. Check if user already has an account
      let accountExists = false;
      let userData: any = null;
      let authToken = '';
      let isSellerAccount = false;

      try {
        // Attempt login using the verified phone session
        const loginRes = await api.post('/auth/login', { phone: fullPhoneNumber });
        if (loginRes.data?.success && loginRes.data?.token) {
          accountExists = true;
          userData = loginRes.data.user;
          authToken = loginRes.data.token;
          isSellerAccount = Boolean(loginRes.data.isSeller || userData.role === 'seller');
        }
      } catch (loginErr: any) {
        if (loginErr.response?.status === 404) {
          // Account does not exist
          accountExists = false;
        } else {
          // Try fallback check-phone route if available
          try {
            const checkRes = await api.post('/auth/check-phone', { phone: fullPhoneNumber });
            if (checkRes.data?.exists) {
              accountExists = true;
              isSellerAccount = Boolean(checkRes.data.isSeller || checkRes.data.role === 'seller');
            }
          } catch {
            accountExists = false;
          }
        }
      }

      // CASE A: USER ALREADY HAS AN ACCOUNT
      if (accountExists && userData && authToken) {
        setStatusMsg(t('Welcome back! Logging into your account...'));
        await performLogin(userData, authToken);

        // If they have a seller account, route directly to seller dashboard
        if (isSellerAccount) {
          setTimeout(() => {
            router.replace('/seller/dashboard');
          }, 800);
        } else if (userData.role === 'buyer') {
          setTimeout(() => {
            router.replace('/home');
          }, 800);
        } else {
          setTimeout(() => {
            router.replace('/role-select');
          }, 800);
        }
        return;
      }

      // CASE B: USER HAS NO ACCOUNT -> ASK TO COMPLETE PROFILE
      setStatusMsg(t('Phone verified! Please complete your profile.'));
      setTimeout(() => {
        router.replace(`/complete-profile?phone=${encodeURIComponent(fullPhoneNumber)}`);
      }, 700);
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setErrorMsg(err.response?.data?.message || err.message || t('Invalid code. Please try again.'));
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setErrorMsg('');
    inputRefs.current[0]?.focus();

    try {
      await api.post('/auth/send-otp', { phone: fullPhoneNumber });
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setErrorMsg(t('Failed to resend code. Please wait and try again.'));
    }
  };

  const maskedPhone = fullPhoneNumber
    ? fullPhoneNumber.slice(0, 4) + ' XXXXXXX' + fullPhoneNumber.slice(-2)
    : '';

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-800/30 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/home" className="inline-block">
            <h1 className="text-3xl font-black tracking-wider text-slate-900">
              UBS <span className="text-blue-600">GLOBAL</span>
            </h1>
          </Link>
          <p className="mt-1.5 text-xs font-semibold text-slate-500">
            {step === 'phone'
              ? t('Create your account to start trading internationally')
              : step === 'otp'
              ? t('Verify your phone number with the 6-digit code')
              : t('Authenticating your account...')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: ENTER PHONE NUMBER */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('Mobile Phone Number')}
              </label>

              <div className="flex gap-2">
                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="h-13 px-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer text-sm"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                  </button>

                  {showCountryPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowCountryPicker(false)}
                      />
                      <div className="absolute left-0 mt-1.5 w-52 max-h-56 overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-2xl py-1.5 z-30 divide-y divide-slate-50">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code + c.name}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowCountryPicker(false);
                            }}
                            className={`w-full px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-left hover:bg-blue-50 transition-colors cursor-pointer ${
                              selectedCountry.code === c.code ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 font-medium'
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-semibold">{c.name}</span>
                            <span className="text-slate-400 ml-auto">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full h-13 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold tracking-wider focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    required
                    autoFocus
                  />
                  <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 font-medium">
                {t('We will send a one-time verification code (OTP) via SMS.')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 7}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Sending Code...')}</span>
                </>
              ) : (
                <>
                  <span>{t('Continue with OTP')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-400 font-medium">
                {t('Enter the 6-digit code sent to')}{' '}
                <span className="font-bold text-slate-800">{maskedPhone}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {t('Change phone number')}
              </button>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-blue-600 focus:bg-white text-slate-800 outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">
                {canResend ? t("Didn't receive code?") : `${t('Resend code in')} ${timer}s`}
              </span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-40 font-bold transition-opacity cursor-pointer"
              >
                {t('Resend OTP')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Verifying...')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{t('Verify & Continue')}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: ROUTING / PROGRESS */}
        {step === 'routing' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
              <Loader2 className="animate-spin" size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-800 text-base">{t('Account Verification')}</h3>
              <p className="text-xs font-medium text-slate-500">{statusMsg}</p>
            </div>
          </div>
        )}

        {/* Footer: Already have an account? Log In */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            {t('Already have an account?')}{' '}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all inline-flex items-center gap-1"
            >
              <span>{t('Log In')}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={36} />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
