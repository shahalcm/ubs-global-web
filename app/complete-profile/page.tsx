'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Loader2, User, Mail, Lock, MapPin, Navigation, Eye, EyeOff } from 'lucide-react';

function CompleteProfileContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: performLocalLogin } = useAuth();

  const phoneParam = searchParams.get('phone') || '';
  const phone = phoneParam.replace(/ /g, '+');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGPSUpdate = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('Geolocation is not supported by your browser'));
      return;
    }

    setLocLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            setCity(addr.city || addr.town || addr.village || addr.suburb || '');
            setState(addr.state || addr.region || '');
            setCountry(addr.country || '');
            setFullAddress(data.display_name || '');
            setPincode(addr.postcode || '');
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setErrorMsg(t('Failed to resolve coordinates. Please enter manually.'));
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setErrorMsg(t('Location permission denied or timeout'));
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg(t('Please fill all required fields'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('Passwords do not match'));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t('Password must be at least 6 characters'));
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone,
        location: {
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          country: country.trim() || undefined,
          fullAddress: fullAddress.trim() || undefined,
        },
      };

      // Signup API call
      const res = await api.post('/auth/signup', userData);

      if (res.data && res.data.success) {
        const { user, token } = res.data;
        await performLocalLogin(user, token);
        router.push('/role-select');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.response?.data?.message || t('Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-linear-to-br from-primary via-primary-dark to-slate-900 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden animate-scale-in">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />

        <div className="relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">{t('Complete Profile')}</h2>
            <p className="mt-1.5 text-xs text-slate-400">
              {t('Set up your credentials to trade globally on UBS Global')}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {t('Full Name')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('Full Name')}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold"
                  required
                  disabled={loading}
                />
                <User size={16} className="absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {t('Email Address')} *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold"
                  required
                  disabled={loading}
                />
                <Mail size={16} className="absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('Password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm"
                    required
                    disabled={loading}
                  />
                  <Lock size={16} className="absolute left-3.5 top-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('Confirm Password')} *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm"
                    required
                    disabled={loading}
                  />
                  <Lock size={16} className="absolute left-3.5 top-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Location Details')}</span>
                <button
                  type="button"
                  onClick={handleGPSUpdate}
                  disabled={locLoading}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {locLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                  <span>{t('Use GPS')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('City')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('City')}
                    className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('Country')}
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('Country')}
                    className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t('Full Address')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder={t('Address details')}
                    className="w-full h-11 pl-9 pr-4 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary transition-all bg-slate-50/50 text-sm font-semibold"
                    disabled={loading}
                  />
                  <MapPin size={14} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
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
                  <span>{t('Registering...')}</span>
                </>
              ) : (
                <span>{t('Register Account')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfileScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
