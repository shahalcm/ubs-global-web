'use client';

import React, { useState } from 'react';
import { FileText, ShieldCheck, Clock, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import api from '@/lib/api';

export default function SellerDocumentsPage() {
  const { seller, refreshSeller } = useSeller();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#0A1A44]">Seller KYC & Verification Documents</h2>
        <p className="text-xs text-slate-500">Manage identity proofs, business license, and verification audit trail</p>
      </div>

      {/* Verification Status Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            seller?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {seller?.status === 'approved' ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A1A44]">
              {seller?.status === 'approved' ? 'Fully Verified UBS Global Seller' : 'KYC Under Admin Audit'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {seller?.status === 'approved'
                ? 'Your business registration and tax credentials have been verified.'
                : 'Documents submitted. Review typically takes 24-48 business hours.'}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
          seller?.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {seller?.status?.toUpperCase() || 'PENDING'}
        </span>
      </div>

      {/* Uploaded Documents List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shop Logo Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider">Store Logo</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">SUBMITTED</span>
          </div>

          <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {seller?.shopLogo ? (
              <img src={seller.shopLogo} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-slate-400 font-medium">No Logo Uploaded</div>
            )}
          </div>
        </div>

        {/* ID Proof Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider">Identity / Registration Proof</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">SUBMITTED</span>
          </div>

          <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {seller?.idProof ? (
              <img src={seller.idProof} alt="ID Proof" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-slate-400 font-medium">No Document Uploaded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
