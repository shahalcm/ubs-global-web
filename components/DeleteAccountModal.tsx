'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELETION_REASONS = [
  'I have privacy or data security concerns',
  'I created a duplicate or secondary account',
  'I am no longer trading or using this platform',
  'I had an unsatisfactory customer experience',
  'I am taking a temporary break',
  'Other reason',
];

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout, user } = useAuth();

  const [confirmText, setConfirmText] = useState('');
  const [selectedReason, setSelectedReason] = useState(DELETION_REASONS[0]);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setErrorMsg(t("Please type 'DELETE' to confirm account deletion."));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.delete('/users/delete-account', {
        data: {
          reason: selectedReason,
          feedback: additionalFeedback.trim() || undefined,
        },
      });

      if (res.data?.success) {
        setDeletedSuccess(true);
        setTimeout(async () => {
          await logout();
          router.replace('/login?deleted=true');
        }, 1800);
      } else {
        setErrorMsg(res.data?.message || t('Failed to delete account. Please try again.'));
      }
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        t('An unexpected error occurred while deleting your account.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (loading) return;
    setConfirmText('');
    setErrorMsg('');
    setAdditionalFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <ShieldAlert size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {t('Delete Account Permanently')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {user?.email || user?.phone || t('This action cannot be undone')}
              </p>
            </div>
          </div>
          {!deletedSuccess && (
            <button
              onClick={handleModalClose}
              disabled={loading}
              className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {deletedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-800">
                  {t('Account Deleted Successfully')}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('Your profile has been removed and you have been signed out. Redirecting to login...')}
                </p>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Warning Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>{t('Important information before you proceed:')}</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] font-medium text-amber-800">
                  <li>
                    {t('Your personal name, phone number, and email will be immediately anonymized.')}
                  </li>
                  <li>
                    {t('All active chat conversations and push notification tokens will be deleted.')}
                  </li>
                  <li>
                    {t('Past completed orders and invoices are decoupled for legal and tax compliance.')}
                  </li>
                  <li>
                    {t('You will be immediately signed out from all web and mobile devices.')}
                  </li>
                </ul>
              </div>

              {/* Form Controls */}
              <form onSubmit={handleDelete} className="space-y-4">
                {/* Reason Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Why are you leaving? (Optional)')}
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    {DELETION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {t(r)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Any feedback or suggestions?')}
                  </label>
                  <textarea
                    rows={2}
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder={t('Tell us how we could improve...')}
                    disabled={loading}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white resize-none transition-colors"
                  />
                </div>

                {/* Confirmation Input: Type DELETE */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('To confirm deletion, please type')}{' '}
                    <span className="font-mono font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      DELETE
                    </span>{' '}
                    {t('below:')}
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={loading}
                    autoCapitalize="characters"
                    className="w-full h-11 px-4 text-center font-mono font-black tracking-widest text-rose-600 uppercase rounded-xl border-2 border-rose-200 focus:border-rose-600 focus:outline-none bg-rose-50/30 text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('Cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !isConfirmed}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{t('Deleting Account...')}</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>{t('Permanently Delete')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
