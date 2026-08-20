'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function SellerSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      setSentMsg(null);
      const res = await api.post('/contact-requests', {
        subject,
        message,
        category: 'seller_help',
      });
      if (res.data?.success || res.status < 400) {
        setSentMsg('Your support request has been submitted to UBS Global Seller Helpdesk!');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.error('Error submitting support ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#0A1A44]">Seller Support & Help Desk</h2>
        <p className="text-xs text-slate-500">Get assistance with fulfillment, payouts, compliance, or technical issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Side Card */}
        <div className="bg-linear-to-br from-[#0A1A44] to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold mb-1">Direct Support Lines</h3>
            <p className="text-xs text-slate-300 mb-6">Our priority seller support team is available 24/7.</p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#1DA1FF] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email Support</span>
                  <span className="font-bold">sellers@ubsglobalapp.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#1DA1FF] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Helpline</span>
                  <span className="font-bold">+1 (800) 555-UBSG</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl text-[11px] text-blue-200">
            Dedicated account manager available for verified sellers.
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1A44] mb-4">Submit a Support Ticket</h3>

          {sentMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{sentMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitSupport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding order payout status"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe the issue or assistance required..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
