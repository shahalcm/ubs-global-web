'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { LocationModal } from '../../components/LocationModal';
import { Search, MapPin, ChevronRight, Shield, ShieldCheck, Lock, Star, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

const CATEGORIES = [
  { id: '1', name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80' },
  { id: '2', name: 'Mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80' },
  { id: '3', name: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80' },
  { id: '4', name: 'Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
  { id: '5', name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  { id: '6', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80' },
  { id: '7', name: 'Medicines', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
  { id: '8', name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80' },
  { id: '9', name: 'Spare Parts', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80' }, // Replaced spare parts text with a placeholder
  { id: '10', name: 'Perfumes', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
  { id: '11', name: 'Service Portal', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80' },
  { id: '12', name: 'Real Estate', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80' },
  { id: '13', name: 'Building Materials', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80' },
  { id: '14', name: 'Machinery', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80' },
  { id: '15', name: 'Oils', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80' },
  { id: '16', name: 'Job Portal', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80' },
];

const STATIC_BANNERS = [
  {
    id: '1',
    title: 'Global Shipping & Logistics',
    subtitle: 'LOGISTICS EXPERT',
    btn: 'Get a Quote',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=700&q=80',
  },
  {
    id: '2',
    title: 'Premium Import Deals',
    subtitle: 'LIMITED OFFER',
    btn: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=700&q=80',
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [banners, setBanners] = useState<any[]>(STATIC_BANNERS);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Load backend content
  const loadHomeData = useCallback(async () => {
    try {
      const [categoriesRes, productsRes, bannersRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/products?limit=8&sort=newest').catch(() => null),
        api.get('/banners').catch(() => null),
      ]);

      if (categoriesRes?.data?.categories) {
        const apiCategories = categoriesRes.data.categories;
        const merged = [...CATEGORIES];
        apiCategories.forEach((apiCat: any) => {
          const index = merged.findIndex(
            (c) => c.name.toLowerCase().trim() === apiCat.name.toLowerCase().trim()
          );
          if (index !== -1) {
            merged[index] = { ...merged[index], ...apiCat };
          } else {
            merged.push(apiCat);
          }
        });
        setCategories(merged);
      }

      if (productsRes?.data?.products) {
        setFeaturedProducts(productsRes.data.products);
      }

      if (bannersRes?.data?.banners && bannersRes.data.banners.length > 0) {
        setBanners(bannersRes.data.banners);
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadHomeData();
    }
  }, [authLoading, loadHomeData]);

  // Autoplay Banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const getProductImage = (images: string[]) => {
    return getProductImageUrl(images && images[0]);
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenLocation={() => setLocationModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header, location & search banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary-dark text-white p-6 sm:p-10 shadow-lg shadow-primary/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-accent tracking-widest uppercase">
                {t('Welcome back,')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {user?.name || t('Guest')}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm">
                Explore global imports, machinery, logistics, and real estate.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder') || 'Search products, spare parts, real estate...'}
                className="w-full h-12 pl-12 pr-4 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-100 focus:text-slate-800 rounded-2xl border border-white/20 focus:border-white focus:outline-none transition-all placeholder-white/60 text-sm font-semibold"
              />
              <Search className="absolute left-4 top-3.5 text-white/60 focus-within:text-slate-400" size={18} />
            </form>
          </div>
        </section>

        {/* Location Selector display bar */}
        <section
          onClick={() => setLocationModalOpen(true)}
          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
              <MapPin size={20} className="text-accent" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('Current Location')}
              </span>
              <span className="font-bold text-slate-800 text-sm block">
                {user?.location?.fullAddress || t('Set Location')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </section>

        {/* Category Browser grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{t('browse_category')}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.slice(0, 16).map((item) => (
              <button
                key={item.id || item._id}
                onClick={() => {
                  if (item.name.toLowerCase() === 'real estate') {
                    router.push('/real-estate');
                  } else {
                    router.push(`/products?category=${encodeURIComponent(item.name)}`);
                  }
                }}
                className="group flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 text-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80';
                    }}
                  />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors block">
                  {t(item.name)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Ad Banners Carousel */}
        <section className="relative h-60 md:h-72 rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
          {banners.map((banner, index) => (
            <div
              key={banner.id || banner._id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent p-6 sm:p-10 flex flex-col justify-end text-white">
                <span className="text-[10px] font-black text-accent tracking-widest uppercase mb-1.5 block">
                  {t(banner.subtitle || 'LIMITED OFFER')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black max-w-lg mb-4 text-shadow">{t(banner.title)}</h2>
                <button
                  onClick={() => router.push(banner.linkUrl || '/products')}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold w-fit shadow-md transition-all cursor-pointer"
                >
                  {t(banner.btn || 'Shop Now')}
                </button>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 right-6 z-20 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeBanner === i ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Products lists */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('featured_products')}</h2>
            <button
              onClick={() => router.push('/products')}
              className="text-xs font-bold text-accent hover:text-accent-dark transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{t('view_all')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => router.push(`/product/${item._id || item.id}`)}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-50">
                    <img
                      src={getProductImage(item.images)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.sellerId?.shopName && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider">
                        {item.sellerId.shopName}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {t(item.category?.name || item.category)}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {t(item.title || item.name)}
                    </h3>

                    {/* Show price tag if not job/service category */}
                    {!['job portal', 'service portal'].includes(
                      (item.category?.name || item.category || '').toLowerCase().trim()
                    ) && (
                      <div className="pt-2 flex justify-between items-center">
                        <span className="font-extrabold text-primary text-base">${item.price}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                            alert(t('Added to cart!'));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer border border-primary/5"
                        >
                          + {t('Add')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Skeletal Loader placeholders
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Secure Trading banner information */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-sm">
          <div className="space-y-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider w-fit block">
              {t('Secure Payments')}
            </span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {t('secure_payments')}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {t('secure_payments_desc') ||
                'All transaction funds are protected by absolute escrow security. Money is dispersed to exporters only upon verification of supply chains.'}
            </p>

            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {t('verified_vendors')}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <Lock size={16} className="text-primary" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {t('escrow_support')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden aspect-video border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&q=80"
              alt="Secure Payment illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </main>

      {/* Global Location Setter Dialog */}
      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  );
}
