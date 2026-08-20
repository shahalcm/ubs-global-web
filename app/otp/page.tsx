'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

function OTPContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: performLocalLogin } = useAuth();

  const phoneParam = searchParams.get('phone') || '';
  const phone = phoneParam.replace(/ /g, '+');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Focus previous on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify OTP with backend
      await api.post('/auth/verify-otp', { phone, otp: otpString });

      try {
        // 2. Attempt login using phone (recent OTP verification session)
        const loginRes = await api.post('/auth/login', { phone });
        if (loginRes.data && loginRes.data.success) {
          const { user, token } = loginRes.data;
          await performLocalLogin(user, token);

          // Check role setup
          if (!user.role) {
            router.push('/role-select');
          } else if (user.role === 'buyer') {
            router.push('/home');
          } else if (user.role === 'seller') {
            router.push('/seller/dashboard');
          } else {
            router.push('/home');
          }
        }
      } catch (loginError: any) {
        // If user not found (404), route to complete profile
        if (loginError.response?.status === 404) {
          router.push(`/complete-profile?phone=${encodeURIComponent(phone)}`);
        } else {
          throw loginError;
        }
      }
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setErrorMsg(err.response?.data?.message || t('Invalid OTP code or verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    try {
      await api.post('/auth/send-otp', { phone });
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      setErrorMsg(t('Failed to resend OTP.'));
    }
  };

  const maskedPhone = phone
    ? phone.slice(0, 4) + ' XXXXXXX' + phone.slice(-2)
    : '+91 XXXXXXX99';

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linear-to-br from-primary via-primary-dark to-slate-900 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden animate-scale-in">
        {/* Decorative background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />

        <div className="relative">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-6 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('Back to Login')}</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">{t('Verify Phone')}</h2>
            <p className="mt-2 text-xs text-slate-400">
              {t('A 6-digit code has been sent to')} <span className="font-bold text-slate-700">{maskedPhone}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Boxes */}
            <div className="flex justify-between gap-2.5 rtl:flex-row-reverse">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  className="w-12 h-13 rounded-2xl border border-slate-200 text-center text-xl font-bold text-primary bg-slate-50/50 focus:outline-none focus:border-primary transition-all shadow-inner"
                  required
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some((d) => !d)}
              className="w-full h-13 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Verifying...')}</span>
                </>
              ) : (
                <span>{t('Verify & Continue')}</span>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-xs font-bold text-accent hover:text-accent-dark transition-colors cursor-pointer"
              >
                {t('Resend OTP')}
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                {t('Resend code in')} <span className="font-bold text-slate-600">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OTPScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    }>
      <OTPContent />
    </Suspense>
  );
}
