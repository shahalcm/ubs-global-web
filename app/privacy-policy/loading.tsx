import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse hidden sm:block" />
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          
          {/* Header Section Skeleton */}
          <div className="border-b border-slate-100 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-400">
              <Shield className="w-3.5 h-3.5 animate-pulse" />
              <span className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="h-9 sm:h-10 w-2/3 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-9 sm:h-10 w-1/2 bg-slate-200 rounded-xl animate-pulse" />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3.5 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Body Content Skeleton */}
          <div className="space-y-6 py-4">
            {/* Paragraph 1 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Heading 2 Skeleton */}
            <div className="h-6 w-1/3 bg-slate-200 rounded-lg animate-pulse pt-4" />

            {/* Paragraph 2 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Paragraph 3 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-3.5 w-48 bg-slate-100 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
