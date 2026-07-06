'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Smartphone, Store, ShieldCheck, HelpCircle, ArrowLeft, LogOut, Download } from 'lucide-react';

export default function SellerDownloadScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sellerFeatures = [
    {
      icon: Store,
      title: 'Global Export Catalog',
      desc: 'List products and real estate to reach importers and agents worldwide.',
    },
    {
      icon: Smartphone,
      title: 'AI Assisted Real-time Chat',
      desc: 'Automatic multi-language translation directly built inside chat messages.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Vendor Status',
      desc: 'Escrow payment security and logistics tracking system support.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-black text-primary tracking-wider">
          UBS <span className="text-accent">GLOBAL</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>{t('Logout')}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 justify-center">
        {/* Left Side: Mockups & Info */}
        <div className="flex-1 space-y-6 max-w-md">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
            {t('Merchant Portal')}
          </span>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            {t('Manage your exports on the go')}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t(
              'The UBS Global Seller Portal is fully optimized for mobile devices. Download the App to upload inventories, chat with foreign buyers, and secure shipping orders.'
            )}
          </p>

          <hr className="border-slate-200" />

          {/* Features Checklist */}
          <div className="space-y-4 pt-2">
            {sellerFeatures.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="flex gap-3.5">
                  <div className="p-2 rounded-xl bg-primary/5 text-primary shrink-0 h-10 w-10 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{t(feat.title)}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t(feat.desc)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex gap-4">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{t('Back to Buyer Portal')}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Downloads & Phone Card */}
        <div className="flex-1 max-w-sm w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 relative overflow-hidden animate-scale-in">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />

          <div className="relative text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20">
              <Download size={32} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{t('Get the Seller App')}</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                {t('Available for all iOS and Android devices. Scan QR code or download from store.')}
              </p>
            </div>

            {/* Mock QR Code Card */}
            <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-4 max-w-[180px] mx-auto shadow-inner">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-center">
                {/* Simulated QR code graphics */}
                <div className="grid grid-cols-5 gap-1.5 w-28 h-28 opacity-90">
                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-primary rounded-sm border border-white" />

                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm border border-white" />

                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-slate-200 rounded-sm" />
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-slate-100 rounded-sm" />

                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm border border-white" />

                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-slate-100 rounded-sm" />
                  <div className="bg-primary rounded-sm border border-white" />
                  <div className="bg-primary rounded-sm border border-white" />
                </div>
              </div>
              <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Scan to Download
              </span>
            </div>

            {/* App Store / Google Play Mock Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white transition-all cursor-pointer shadow-md"
              >
                {/* Apple icon representation */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Download on the</div>
                  <div className="text-sm font-bold mt-0.5">App Store</div>
                </div>
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white transition-all cursor-pointer shadow-md"
              >
                {/* Android icon representation */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 3.25A1.25 1.25 0 0 0 3.75 4.5v15A1.25 1.25 0 0 0 5 20.75h14A1.25 1.25 0 0 0 20.25 19.5v-15A1.25 1.25 0 0 0 19 3.25H5zm2.44 2.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75zm9.12.75a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Get it on</div>
                  <div className="text-sm font-bold mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
