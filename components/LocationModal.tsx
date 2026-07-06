'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../lib/api';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();

  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.location) {
      setCity(user.location.city || '');
      setState(user.location.state || '');
      setCountry(user.location.country || '');
      setFullAddress(user.location.fullAddress || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleGPSUpdate = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('Geolocation is not supported by your browser'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim free reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            const resolvedCity = addr.city || addr.town || addr.village || addr.suburb || '';
            const resolvedState = addr.state || addr.region || '';
            const resolvedCountry = addr.country || '';
            const resolvedAddress = data.display_name || '';

            const resolvedLoc = {
              latitude,
              longitude,
              city: resolvedCity,
              state: resolvedState,
              country: resolvedCountry,
              fullAddress: resolvedAddress,
            };

            const res = await api.put('/users/location', resolvedLoc);
            if (res.data && res.data.success) {
              await updateUser(res.data.user);
              onClose();
            }
          } else {
            setErrorMsg(t('Failed to resolve coordinates to address'));
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setErrorMsg(t('Failed to fetch address details'));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setErrorMsg(t('Location permission denied or timeout'));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !country.trim()) {
      setErrorMsg(t('City and Country are required'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const locationData = {
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        fullAddress: fullAddress.trim() || `${city.trim()}, ${state ? state.trim() + ', ' : ''}${country.trim()}`,
      };

      const res = await api.put('/users/location', locationData);
      if (res.data && res.data.success) {
        await updateUser(res.data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('Manual save location error:', err);
      setErrorMsg(err.response?.data?.message || t('Failed to update location'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-slate-800">{t('Update Location')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-sm font-semibold text-slate-500">{t('Updating Location...')}</span>
          </div>
        ) : (
          <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* GPS Button */}
            <button
              onClick={handleGPSUpdate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-all border border-primary/10 cursor-pointer"
            >
              <Navigation size={16} />
              <span>{t('Use GPS / Current Location')}</span>
            </button>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-slate-100" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('OR')}</span>
              <hr className="flex-1 border-slate-100" />
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t('City')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('City')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary transition-all bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t('State')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder={t('State')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t('Country')}</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('Country')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary transition-all bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">{t('Full Address')}</label>
                <textarea
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder={t('Full Address')}
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-primary transition-all bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {t('Save Location')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
