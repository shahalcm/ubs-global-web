'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import {
  Loader2,
  User as UserIcon,
  ShieldCheck,
  Download,
  Trash2,
  FileText,
  Lock,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);



  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.patch('/users/profile', { name, email, phone });
      if (res.data && res.data.success) {
        await updateUser(res.data.user);
        setSuccessMsg(t('Profile updated successfully'));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || t('Failed to update profile'));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('Passwords do not match'));
      return;
    }

    setUpdatingPassword(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.patch('/users/change-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        setSuccessMsg(t('Password changed successfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || t('Incorrect current password or change failed.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleGDPRExport = async () => {
    if (!confirm(t('Do you want to export your personal data? An archive will be compiled.'))) return;
    try {
      const res = await api.get('/users/export-data');
      alert(t('Your data has been exported successfully. Details sent to email.'));
      // Download raw data payload as JSON directly in browser as fallback
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'ubs_profile_data.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
      alert(t('Failed to export data.'));
    }
  };

  const handleGDPRPurge = async () => {
    if (!confirm(t('WARNING: This will permanently delete your account and trade records. This action is irreversible. Continue?'))) return;
    try {
      const res = await api.delete('/users/delete-account');
      if (res.data?.success) {
        alert(t('Your account has been deleted. Logging you out.'));
        await logout();
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      alert(t('Failed to delete account.'));
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserIcon size={24} className="text-primary" />
            <span>{t('Account Settings')}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">{t('Manage profile details and data options')}</p>
        </div>

        {/* Notices */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-2xl">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings forms (col-span-2) */}
          <div className="md:col-span-2 space-y-6">
            {/* Edit details form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                {t('Profile Information')}
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Full Name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-primary bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Email Address')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-primary bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-primary bg-slate-50/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/10 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingProfile ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>{t('Save Profile')}</span>
                </button>
              </form>
            </div>

            {/* Change Password form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">{t('Change Password')}</h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t('Current Password')}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('New Password')}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {t('Confirm Password')}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/10 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingPassword ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>{t('Update Password')}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Pane: GDPR + Legal Policy links */}
          <div className="space-y-6">
            {/* GDPR Settings */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>GDPR Privacy</span>
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handleGDPRExport}
                  className="w-full flex items-center justify-start gap-2.5 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 text-left text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  <Download size={16} className="text-slate-400" />
                  <span>{t('Export Personal Data')}</span>
                </button>

                <button
                  onClick={handleGDPRPurge}
                  className="w-full flex items-center justify-start gap-2.5 p-3 rounded-2xl hover:bg-rose-50 border border-rose-100/50 text-left text-xs font-bold text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} className="text-rose-500" />
                  <span>{t('Delete Account')}</span>
                </button>
              </div>
            </div>

            {/* Legal Documents policy */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>{t('Policies')}</span>
              </h3>

              <div className="space-y-2">
                {[
                  { path: '/terms-and-conditions', label: 'Terms & Conditions' },
                  { path: '/privacy-policy', label: 'Privacy Policy' },
                  { path: '/refund-policy', label: 'Refund Policy' },
                  { path: '/account-deletion-policy', label: 'Account Deletion Policy' },
                ].map((doc) => (
                  <button
                    key={doc.path}
                    onClick={() => router.push(doc.path)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <span>{t(doc.label)}</span>
                    <Compass size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
