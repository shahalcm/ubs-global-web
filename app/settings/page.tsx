'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Settings, Globe, Shield, HelpCircle, Mail, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function SettingsScreen() {
  const { t, language, changeLanguage } = useTranslation();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  // Settings states
  const [dataConsent, setDataConsent] = useState(user?.location ? true : false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Help Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const handlePrivacySave = async (e: any) => {
    const checked = e.target.checked;
    setDataConsent(checked);
    try {
      await api.patch('/users/privacy-settings', {
        allowDataProcessing: checked,
        marketingConsent: checked,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendHelpTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const res = await api.post('/contact-requests', {
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
      });

      if (res.data?.success) {
        alert(t('Your support ticket has been submitted. We will contact you soon.'));
        setTicketSubject('');
        setTicketMessage('');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('Failed to submit ticket.'));
    } finally {
      setSubmittingTicket(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ur', name: 'اردو' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-primary" />
            <span>{t('App Settings')}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">{t('Configure UI settings and get support help')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Language Selection */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <span>{t('Language Preference')}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code as any)}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      language === lang.code
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Preferences */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <span>{t('Privacy Settings')}</span>
              </h3>

              <div className="space-y-4 text-xs font-bold text-slate-600">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataConsent}
                    onChange={handlePrivacySave}
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-700 text-sm block leading-none mb-1">
                      {t('Allow Personal Information Processing')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium leading-relaxed block">
                      {t('Allow UBS Global to process personal information for customizing experience.')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-700 text-sm block leading-none mb-1">
                      {t('Enable Push Notifications')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium leading-relaxed block">
                      {t('Receive order notifications, tracking alerts, and seller chat responses.')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Help Support Ticket Column */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                <span>{t('Support Center')}</span>
              </h3>

              <form onSubmit={handleSendHelpTicket} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t('Subject')}
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Shipping Delay"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-primary bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t('Message')}
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder={t('Describe your issue in detail...')}
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary bg-slate-50/50 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-55"
                >
                  {submittingTicket ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  <span>{t('Submit Ticket')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
