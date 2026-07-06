'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShoppingCart, Store, Check, ArrowRight } from 'lucide-react';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setRoleOnServer } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const success = await setRoleOnServer(selectedRole);
      if (success) {
        if (selectedRole === 'buyer') {
          router.push('/home');
        } else {
          router.push('/seller-download');
        }
      } else {
        alert(t('Failed to update role. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      alert(t('An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-primary tracking-wider">UBS GLOBAL</h1>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-6 tracking-tight">
            {t('How will you use UBS Global?')}
          </h2>
          <p className="mt-2.5 text-sm text-slate-400 max-w-sm mx-auto">
            {t('Select the role that best matches your international trade objectives.')}
          </p>
        </div>

        {/* Roles Selectable List */}
        <div className="space-y-4">
          {/* Buyer Role */}
          <button
            onClick={() => setSelectedRole('buyer')}
            className={`w-full relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
              selectedRole === 'buyer'
                ? 'border-primary bg-primary/2'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`p-3.5 rounded-xl transition-colors ${
                selectedRole === 'buyer' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <ShoppingCart size={24} />
            </div>

            <div className="flex-1 pr-6">
              <h3
                className={`font-bold text-base transition-colors ${
                  selectedRole === 'buyer' ? 'text-primary' : 'text-slate-800'
                }`}
              >
                {t('Buyer')}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {t(
                  'Browse and purchase products globally. Connect with verified international vendors and manage secure logistics for your business.'
                )}
              </p>
            </div>

            {selectedRole === 'buyer' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white animate-scale-in">
                <Check size={14} className="stroke-3" />
              </div>
            )}
          </button>

          {/* Seller Role */}
          <button
            onClick={() => setSelectedRole('seller')}
            className={`w-full relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
              selectedRole === 'seller'
                ? 'border-primary bg-primary/2'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`p-3.5 rounded-xl transition-colors ${
                selectedRole === 'seller' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Store size={24} />
            </div>

            <div className="flex-1 pr-6">
              <h3
                className={`font-bold text-base transition-colors ${
                  selectedRole === 'seller' ? 'text-primary' : 'text-slate-800'
                }`}
              >
                {t('Seller')}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {t(
                  'List and sell your products worldwide. Gain access to a global network of importers and streamline your export operations.'
                )}
              </p>
            </div>

            {selectedRole === 'seller' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white animate-scale-in">
                <Check size={14} className="stroke-3" />
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-13 mt-8 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>{t('Please wait...')}</span>
            </>
          ) : (
            <>
              <span>{t('Continue')}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
