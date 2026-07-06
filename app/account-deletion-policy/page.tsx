'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';

export default function AccountDeletionPolicyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/legal-docs/account-deletion-policy')
      .then((res) => {
        if (res.data?.success) {
          setDoc(res.data.legalDoc);
        }
      })
      .catch((err) => console.error('Failed to load account deletion policy:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
        {/* Header navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('Back')}</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
            <FileText className="text-primary animate-pulse" size={24} />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {doc?.title || t('Account Deletion Policy')}
            </h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Loading document...')}</span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {doc?.content || t('UBS Global corporate terms and policies apply.')}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
