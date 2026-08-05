'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Loader2, Phone, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Mail } from 'lucide-react';

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

  // Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[2]); // Default IN (+91)
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: OTP, 3: New Password
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCountry, setForgotCountry] = useState(COUNTRIES[2]);
  const [showForgotPicker, setShowForgotPicker] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // OTP Login Submission
  const handleOTPContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setErrorMsg(t('Please enter a valid phone number'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = selectedCountry.code + phone.trim();
      await api.post('/auth/send-otp', { phone: fullPhone });
      router.push(`/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.response?.data?.message || t('Failed to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Password Login Submission
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setErrorMsg(t('Please enter a valid phone number'));
      return;
    }
    if (!password) {
      setErrorMsg(t('Please enter your password'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullPhone = selectedCountry.code + phone.trim();
      const res = await api.post('/auth/login', { phone: fullPhone, password });

      if (res.data?.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (res.data.user?.role === 'seller') {
          router.replace('/seller/dashboard');
        } else if (res.data.user?.role === 'buyer') {
          router.replace('/home');
        } else {
          router.replace('/role-select');
        }
      } else {
        setErrorMsg(res.data?.message || t('Incorrect password. Please try again.'));
      }
    } catch (err: any) {
      console.error('Password login error:', err);
      setErrorMsg(err.response?.data?.message || t('Incorrect password. Please enter correct password.'));
    } finally {
      setLoading(false);
    }
  };

  // Open Forgot Password Modal
  const openForgotPassword = () => {
    setForgotPhone(phone);
    setForgotCountry(selectedCountry);
    setForgotStep(1);
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotErrorMsg('');
    setForgotSuccessMsg('');
    setShowForgotModal(true);
  };

  // Forgot Step 1: Send OTP
  const handleForgotSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone || forgotPhone.length < 7) {
      setForgotErrorMsg(t('Please enter a valid phone number'));
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg('');

    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim();
      const res = await api.post('/auth/forgot-password', { phone: fullPhone });
      if (res.data?.success) {
        setForgotSuccessMsg(t('OTP sent to your registered phone number'));
        setForgotStep(2);
      } else {
        setForgotErrorMsg(res.data?.message || t('No account found with this phone number'));
      }
    } catch (err: any) {
      console.error('Forgot password send OTP error:', err);
      setForgotErrorMsg(err.response?.data?.message || t('No registered account found with this phone number.'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Step 2: Verify OTP
  const handleVerifyForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length < 4) {
      setForgotErrorMsg(t('Please enter the 6-digit verification code'));
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg('');

    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim();
      const res = await api.post('/auth/verify-otp', { phone: fullPhone, otp: forgotOtp.trim() });
      if (res.data?.success) {
        setForgotStep(3);
      } else {
        setForgotErrorMsg(res.data?.message || t('Invalid or expired OTP'));
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setForgotErrorMsg(err.response?.data?.message || t('Invalid or expired OTP'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Step 3: Reset Password & Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setForgotErrorMsg(t('New password must be at least 6 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotErrorMsg(t('Passwords do not match'));
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg('');

    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim();
      const res = await api.post('/auth/reset-password-otp', {
        phone: fullPhone,
        otp: forgotOtp.trim(),
        newPassword: newPassword.trim()
      });

      if (res.data?.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setShowForgotModal(false);

        if (res.data.user?.role === 'seller') {
          router.replace('/seller/dashboard');
        } else if (res.data.user?.role === 'buyer') {
          router.replace('/home');
        } else {
          router.replace('/role-select');
        }
      } else {
        setForgotErrorMsg(res.data?.message || t('Failed to reset password. Please try again.'));
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setForgotErrorMsg(err.response?.data?.message || err.message || t('Failed to reset password'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-wider text-slate-900">
            UBS <span className="text-blue-600">GLOBAL</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {t('Sign in to manage your global trade')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              loginMode === 'otp'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📱 {t('OTP Login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              loginMode === 'password'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔒 {t('Password Login')}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OTP LOGIN FORM */}
        {loginMode === 'otp' && (
          <form onSubmit={handleOTPContinue} className="space-y-6">
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
                      <div className="absolute left-0 mt-2 w-48 max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20">
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
                    className="w-full h-13 pl-11 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 transition-all bg-slate-50 text-sm font-semibold"
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
              className="w-full h-13 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Please wait...')}</span>
                </>
              ) : (
                <span>{t('Get Login Code')} →</span>
              )}
            </button>
          </form>
        )}

        {/* PASSWORD LOGIN FORM */}
        {loginMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('Phone Number')}
              </label>

              <div className="flex gap-2">
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
                      <div className="absolute left-0 mt-2 w-48 max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20">
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

                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={15}
                    className="w-full h-13 pl-11 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 transition-all bg-slate-50 text-sm font-semibold"
                    required
                    disabled={loading}
                  />
                  <Phone size={16} className="absolute left-4 top-4.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('Password')}
                </label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {t('Forgot Password?')}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-13 pl-11 pr-12 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 transition-all bg-slate-50 text-sm font-semibold"
                  required
                  disabled={loading}
                />
                <Lock size={16} className="absolute left-4 top-4.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t('Please wait...')}</span>
                </>
              ) : (
                <span>{t('Sign In')} →</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <a
              href="https://www.ubsglobalapp.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {t('Privacy Policy')}
            </a>
            <span>•</span>
            <a
              href="https://www.ubsglobalapp.com/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {t('Terms of Service')}
            </a>
          </div>

          <a
            href="mailto:ubsimportingexporting@gmail.com"
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors font-medium"
          >
            <Mail size={14} />
            <span>ubsimportingexporting@gmail.com</span>
          </a>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {t('Reset Password')}
              </h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotErrorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{forgotErrorMsg}</span>
              </div>
            )}

            {forgotSuccessMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: Enter Phone Number */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendOTP} className="space-y-4">
                <p className="text-xs text-slate-500">
                  {t('Enter your registered phone number to receive a 6-digit password reset code.')}
                </p>

                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowForgotPicker(!showForgotPicker)}
                      className="h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <span>{forgotCountry.flag}</span>
                      <span>{forgotCountry.code}</span>
                    </button>

                    {showForgotPicker && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowForgotPicker(false)} />
                        <div className="absolute left-0 mt-1 w-44 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-100 shadow-xl py-1 z-20">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setForgotCountry(c);
                                setShowForgotPicker(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 cursor-pointer"
                            >
                              <span>{c.flag}</span>
                              <span className="font-bold">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={15}
                    className="flex-1 h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : <span>{t('Send Verification Code')}</span>}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOTP} className="space-y-4">
                <p className="text-xs text-slate-500">
                  {t('Enter the 6-digit code sent to')} <span className="font-bold text-slate-800">{forgotCountry.code} {forgotPhone}</span>
                </p>

                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:border-blue-600"
                  required
                />

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : <span>{t('Verify Code')} →</span>}
                </button>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-500">
                  {t('Create a new password for your account.')}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{t('New Password')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">{t('Confirm New Password')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : <span>{t('Set New Password & Sign In')}</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
