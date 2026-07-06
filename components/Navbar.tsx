'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LanguageContext';
import {
  Home,
  ShoppingBag,
  Home as RealEstateIcon,
  Heart,
  MessageSquare,
  User,
  LogOut,
  Globe,
  ShoppingCart,
  Menu,
  X,
  MapPin,
  Settings
} from 'lucide-react';

interface NavbarProps {
  onOpenLocation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLocation }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { language, t, changeLanguage } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/real-estate', label: 'Real Estate', icon: RealEstateIcon },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

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
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center py-1">
              <img
                src="/logo.png"
                alt="UBS Global"
                className="h-12 w-auto object-contain cursor-pointer hover:scale-102 transition-transform duration-200"
              />
            </Link>

            {/* Location selector (only when logged in or callback provided) */}
            {isAuthenticated && (
              <button
                onClick={onOpenLocation}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-xs font-semibold text-primary cursor-pointer"
              >
                <MapPin size={14} className="text-accent" />
                <span className="max-w-[160px] truncate">
                  {user?.location?.city
                    ? `${user.location.city}, ${user.location.country}`
                    : t('Set Location')}
                </span>
              </button>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{t(link.label)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            {isAuthenticated && (
              <Link
                href="/cart"
                className={`relative p-2.5 rounded-full transition-all duration-200 hover:bg-slate-100 text-slate-700 ${
                  pathname === '/cart' ? 'bg-primary/5 text-primary' : ''
                }`}
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                aria-label="Change language"
              >
                <Globe size={20} />
              </button>

              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Language
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={async () => {
                          await changeLanguage(lang.code as any);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 cursor-pointer ${
                          language === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-slate-700'
                        }`}
                      >
                        <span>{lang.name}</span>
                        {language === lang.code && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Profile / Login Action */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-primary/20 transition-all hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2.5 border-b border-slate-50">
                        <div className="font-bold text-slate-800 text-sm truncate">{user?.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                        {user?.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                            {user.role}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={16} className="text-slate-400" />
                        <span>{t('Edit Profile')}</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={16} className="text-slate-400" />
                        <span>{t('Account Settings')}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 text-left border-t border-slate-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} className="text-rose-500" />
                        <span>{t('Logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all"
              >
                {t('Login')}
              </Link>
            )}

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-2 shadow-inner">
          {isAuthenticated && (
            <button
              onClick={() => {
                onOpenLocation?.();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-primary"
            >
              <MapPin size={14} className="text-accent" />
              <span className="truncate">
                {user?.location?.city
                  ? `${user.location.city}, ${user.location.state || ''}, ${user.location.country}`
                  : t('Set Location')}
              </span>
            </button>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                <span>{t(link.label)}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-semibold text-center"
            >
              {t('Login')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
