'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PrivacyPolicyError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Privacy Policy route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Mini Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center">
          <Link href="/home" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="UBS Global"
              className="h-10 w-auto object-contain cursor-pointer"
            />
            <span className="font-extrabold text-slate-800 tracking-tight hidden sm:inline text-lg">
              UBS Global
            </span>
          </Link>
        </div>
      </header>

      {/* Main Error Body */}
      <main className="max-w-2xl mx-auto px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 flex flex-col items-center max-w-lg w-full">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Unable to Load Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              We encountered a network or server issue trying to load the latest legal document from the server. Please try again.
            </p>
          </div>

          {error.message && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left w-full">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Error Details
              </span>
              <code className="text-xs text-slate-600 font-mono break-all leading-normal block mt-1">
                {error.message}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer shadow-sm transition-all hover:shadow duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <Link
              href="/home"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        &copy; {new Date().getFullYear()} UBS Global Inc. All rights reserved.
      </footer>
    </div>
  );
}
