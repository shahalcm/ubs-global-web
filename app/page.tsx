'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace('/home');
    }
  }, [loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl font-black text-white tracking-widest animate-pulse">
          UBS <span className="text-accent">GLOBAL</span>
        </span>
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    </div>
  );
}
