'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { LocationModal } from '../../components/LocationModal';
import {
  Search,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Star,
  ArrowRight,
  Loader2,
  Sparkles,
  Truck,
  Building,
  Store,
  ShoppingCart,
  Heart,
  TrendingUp,
  Globe2,
  CheckCircle2,
  ArrowUpRight,
  Boxes,
  Compass,
  FileText,
  BadgePercent,
  SlidersHorizontal,
  Flame,
  Plane
} from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

const CATEGORIES = [
  { id: '1', name: 'Machinery', icon: '⚙️', count: '1,420 items', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80', group: 'Industrial' },
  { id: '2', name: 'Electronics', icon: '⚡', count: '3,850 items', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80', group: 'Tech' },
  { id: '3', name: 'Building Materials', icon: '🏗️', count: '890 items', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=80', group: 'Industrial' },
  { id: '4', name: 'Real Estate', icon: '🏢', count: '640 properties', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80', group: 'Property' },
  { id: '5', name: 'Fashion & Apparel', icon: '👗', count: '5,120 items', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80', group: 'Consumer' },
  { id: '6', name: 'Spare Parts', icon: '🔧', count: '2,300 items', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80', group: 'Industrial' },
  { id: '7', name: 'Mobiles & Gadgets', icon: '📱', count: '4,100 items', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80', group: 'Tech' },
  { id: '8', name: 'Furniture & Decor', icon: '🛋️', count: '1,780 items', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80', group: 'Consumer' },
  { id: '9', name: 'Cosmetics & Beauty', icon: '✨', count: '2,900 items', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80', group: 'Consumer' },
  { id: '10', name: 'Perfumes & Fragrances', icon: '🌸', count: '980 items', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80', group: 'Consumer' },
  { id: '11', name: 'Grocery & Commodities', icon: '🌾', count: '3,200 items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80', group: 'Consumer' },
  { id: '12', name: 'Medicines & Health', icon: '💊', count: '1,150 items', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', group: 'Industrial' },
];

const STATIC_BANNERS = [
  {
    id: '1',
    title: 'Cross-Border Ocean & Air Freight',
    subtitle: 'GLOBAL LOGISTICS NETWORK',
    tag: 'VERIFIED CARRIERS',
    desc: 'Seamless international shipping, customs documentation, and automated container tracking across 50+ ports.',
    btn: 'Get Shipping Quote',
    linkUrl: '/products?category=Machinery',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=85',
  },
  {
    id: '2',
    title: 'Direct Factory Sourcing & Escrow',
    subtitle: '100% BUYER PROTECTION',
    tag: 'SECURE ESCROW',
    desc: 'Trade with vetted manufacturers. Payments are released strictly after Bill of Lading & port inspection approval.',
    btn: 'Explore Verified Exporters',
    linkUrl: '/products',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=85',
  },
  {
    id: '3',
    title: 'Prime Commercial Real Estate & Warehousing',
    subtitle: 'STRATEGIC ASSETS',
    tag: 'GLOBAL HUBS',
    desc: 'Invest in premium industrial warehouses, office developments, and logistics hubs in key trade zones.',
    btn: 'Browse Properties',
    linkUrl: '/real-estate',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85',
  },
];

const QUICK_SEARCH_TAGS = [
  'Heavy Machinery',
  'Solar Panels',
  'Electronics',
  'Industrial Valves',
  'Raw Cotton',
  'Warehouses',
  'Medical Supplies'
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('All Categories');
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'industrial' | 'tech' | 'consumer'>('all');
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [banners, setBanners] = useState<any[]>(STATIC_BANNERS);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartToast, setCartToast] = useState<string | null>(null);

  // Load backend content
  const loadHomeData = useCallback(async () => {
    try {
      const [categoriesRes, productsRes, bannersRes, wishlistRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/products?limit=12&sort=newest').catch(() => null),
        api.get('/banners').catch(() => null),
        isAuthenticated ? api.get('/wishlist').catch(() => null) : Promise.resolve(null),
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

      if (wishlistRes) {
        const raw = wishlistRes?.data?.products || wishlistRes?.data?.wishlist || [];
        if (Array.isArray(raw)) {
          setWishlistIds(raw.map((item: any) => item?.productId?._id || item?.productId || item?._id));
        }
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setPageLoading(false);
    }
  }, [isAuthenticated]);

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
    }, 5500);
    return () => clearInterval(interval);
  }, [banners]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const catQuery = selectedSearchCat !== 'All Categories' ? `&category=${encodeURIComponent(selectedSearchCat)}` : '';
    router.push(`/products?search=${encodeURIComponent(search.trim())}${catQuery}`);
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    setWishlistIds((prev) =>
      isCurrentlyWishlisted ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    try {
      await api.post(`/wishlist/toggle/${productId}`);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      // Revert on error
      setWishlistIds((prev) =>
        isCurrentlyWishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product);
    setCartToast(product.title || t('Product added to cart!'));
    setTimeout(() => {
      setCartToast(null);
    }, 2800);
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'industrial') return c.group === 'Industrial';
    if (activeTab === 'tech') return c.group === 'Tech';
    if (activeTab === 'consumer') return c.group === 'Consumer' || c.group === 'Property';
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 selection:bg-blue-600 selection:text-white">
      <Navbar onOpenLocation={() => setLocationModalOpen(true)} />

      {/* Cart Quick Toast */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <div className="text-xs">
            <span className="font-bold">{t('Added to cart:')}</span>{' '}
            <span className="text-slate-300 truncate max-w-50 inline-block align-bottom">{cartToast}</span>
          </div>
          <Link href="/cart" className="ml-2 font-black text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2">
            {t('View Cart')} &rarr;
          </Link>
        </div>
      )}

      {/* HERO SECTION WITH DYNAMIC GRADIENT & SEARCH ENGINE */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-16 sm:pb-20 border-b border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-125 h-125 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Top Ticker & Trust Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-400 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-200 font-bold tracking-wide">
                {t('LIVE GLOBAL TRADE NETWORK')}
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400">
                12,500+ Verified Exporters Across 50+ Countries
              </span>
            </div>

            {/* Location selector pill */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 text-[11px]"
            >
              <MapPin size={13} className="text-blue-400" />
              <span className="font-bold">{user?.location?.country || user?.location?.city || t('Ship To: Global')}</span>
              <ChevronRight size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Main Hero Value Proposition */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-wide">
              <Sparkles size={14} className="animate-spin text-blue-400" style={{ animationDuration: '4s' }} />
              <span>{t('Empowering International B2B & B2C Commerce')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
              Smarter Global Trade.{' '}
              <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Direct From Source.
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Source industrial machinery, wholesale electronics, commodities, and real estate.
              Protected with 100% escrow guarantees and end-to-end freight logistics.
            </p>
          </div>

          {/* Elevated Multi-Select Search Engine */}
          <div className="bg-white/10 backdrop-blur-xl p-2 sm:p-2.5 rounded-3xl border border-white/15 shadow-2xl max-w-4xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* Category Dropdown */}
              <div className="relative shrink-0 sm:w-48">
                <select
                  value={selectedSearchCat}
                  onChange={(e) => setSelectedSearchCat(e.target.value)}
                  className="w-full h-13 px-4 rounded-2xl bg-white/15 text-white font-bold text-xs border border-white/10 focus:outline-none focus:bg-slate-900 appearance-none cursor-pointer pr-8"
                >
                  <option value="All Categories" className="bg-slate-900 text-white">{t('All Categories')}</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                      {t(c.name)}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal size={14} className="absolute right-3.5 top-4.5 text-white/60 pointer-events-none" />
              </div>

              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-4 text-white/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('Search products, spare parts, containers, real estate...')}
                  className="w-full h-13 pl-11 pr-4 bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/10 focus:border-white text-sm font-semibold placeholder:text-white/60 focus:placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              {/* Search Submit CTA */}
              <button
                type="submit"
                className="h-13 px-7 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <span>{t('Search Global')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Search Recommendations */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold text-slate-400">
            <span className="shrink-0 flex items-center gap-1 text-slate-300 font-bold">
              <TrendingUp size={13} className="text-blue-400" />
              {t('Trending:')}
            </span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearch(tag);
                  router.push(`/products?search=${encodeURIComponent(tag)}`);
                }}
                className="shrink-0 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Statistics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white">12,500+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Verified Exporters')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400">$65M+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Protected Escrow Volume')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-blue-400">180+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Global Shipping Ports')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-cyan-400">99.8%</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('On-Time Delivery Rate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS & SERVICES DOCK */}
      <section className="-mt-8 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/products?category=Machinery"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-blue-50/60 transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Truck size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-blue-600">{t('Global Freight')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Air & Sea Cargo</span>
          </Link>

          <Link
            href="/real-estate"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-indigo-50/60 transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Building size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600">{t('Real Estate')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Commercial Hubs</span>
          </Link>

          <Link
            href="/seller/register"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-emerald-50/60 transition-colors border border-transparent hover:border-emerald-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Store size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-emerald-600">{t('Sell on UBS')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Become Exporter</span>
          </Link>

          <Link
            href="/wishlist"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-rose-50/60 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-rose-600">{t('My Wishlist')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Saved Products</span>
          </Link>

          <Link
            href="/orders"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-amber-50/60 transition-colors border border-transparent hover:border-amber-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Boxes size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-amber-600">{t('Track Orders')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Live Shipments</span>
          </Link>

          <Link
            href="/messages"
            className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-purple-50/60 transition-colors border border-transparent hover:border-purple-100 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Compass size={22} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-purple-600">{t('Supplier Chat')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Instant Inquiries</span>
          </Link>
        </div>
      </section>

      {/* MAIN BODY CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* INTERACTIVE BILLBOARD CAROUSEL */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 group h-80 sm:h-96">
          {banners.map((banner, index) => (
            <div
              key={banner.id || banner._id || index}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                index === activeBanner ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-900/75 to-transparent p-6 sm:p-12 flex flex-col justify-center max-w-2xl text-white space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/80 text-white text-[10px] font-black uppercase tracking-widest w-fit backdrop-blur-md">
                  <Flame size={12} className="text-amber-300" />
                  <span>{banner.tag || banner.subtitle || 'FEATURED SPOTLIGHT'}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {banner.title}
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-lg">
                  {banner.desc || banner.subtitle || 'Direct factory sourcing with competitive pricing and complete trade security.'}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => router.push(banner.linkUrl || '/products')}
                    className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
                  >
                    <span>{banner.btn || t('Explore Now')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Prev/Next Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/20 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/20 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBanner(i)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeBanner === i ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* BROWSE TRADE CATEGORIES */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                <Boxes size={15} />
                <span>{t('EXPLORE GLOBAL SECTORS')}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('Sourcing by Industry Category')}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'industrial', 'tech', 'consumer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab === 'all' && t('All Sectors')}
                  {tab === 'industrial' && t('Industrial & Heavy')}
                  {tab === 'tech' && t('Electronics & Tech')}
                  {tab === 'consumer' && t('Consumer & Property')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCategories.slice(0, 12).map((cat) => (
              <div
                key={cat.id || cat.name}
                onClick={() => {
                  if (cat.name.toLowerCase() === 'real estate') {
                    router.push('/real-estate');
                  } else {
                    router.push(`/products?category=${encodeURIComponent(cat.name)}`);
                  }
                }}
                className="group relative bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 overflow-hidden"
              >
                <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80';
                    }}
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-xs shadow-xs">
                    {cat.icon || '📦'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {t(cat.name)}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {cat.count || t('Verified Suppliers')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED MARKETPLACE PRODUCTS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                <Sparkles size={15} />
                <span>{t('VERIFIED GLOBAL INVENTORY')}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('Featured Wholesale & Retail Products')}
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <span>{t('View All Products')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredProducts.map((product) => {
                const prodId = product._id || product.id;
                const isWishlisted = wishlistIds.includes(prodId);
                const hasSeller = Boolean(product.sellerId?.shopName);

                return (
                  <div
                    key={prodId}
                    onClick={() => router.push(`/product/${prodId}`)}
                    className="group bg-white rounded-3xl border border-slate-200/80 hover:border-blue-400/80 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1 relative"
                  >
                    {/* Image Area */}
                    <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                      <img
                        src={getProductImageUrl(product.images && product.images[0])}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {hasSeller ? (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="truncate max-w-30">{product.sellerId.shopName}</span>
                          </span>
                        ) : (
                          <span />
                        )}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleWishlist(e, prodId)}
                          className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                            isWishlisted
                              ? 'bg-rose-50 text-rose-500 border border-rose-200'
                              : 'bg-white/80 hover:bg-white text-slate-600 border border-white/40'
                          }`}
                        >
                          <Heart
                            size={16}
                            className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''}
                          />
                        </button>
                      </div>

                      {/* Stock Badge */}
                      {product.stock !== undefined && (
                        <div className="absolute bottom-2.5 left-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                              product.stock > 0
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-rose-500/90 text-white'
                            }`}
                          >
                            {product.stock > 0 ? t('Ready to Ship') : t('Backorder')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          {t(product.category?.name || product.category || 'General')}
                        </span>
                        <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.title || product.name}
                        </h3>
                      </div>

                      {/* Ratings & Price */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">
                            ${Number(product.price || 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 block">
                            {t('Direct Factory Rate')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <ShoppingCart size={13} />
                          <span>{t('Add')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Skeletal Loader */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200/80 rounded-3xl p-4 space-y-4">
                  <div className="aspect-square bg-slate-100 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                    <div className="h-4 w-4/5 bg-slate-100 rounded" />
                    <div className="h-5 w-1/2 bg-slate-100 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRUST ARCHITECTURE: ESCROW & GLOBAL FREIGHT INFRASTRUCTURE */}
        <section className="bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>{t('UBS Trade Assurance')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Trade Safely with 100% Escrow & Verified Quality Inspection
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Never risk upfront capital. We hold payment securely in escrow until goods reach port
              and pass statutory quality checks. If an exporter fails to deliver, your funds are refunded immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{t('Escrow Payment Protection')}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{t('Funds released only upon port clearance & bill of lading.')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{t('Verified Factory Audits')}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{t('On-site inspection and verified business licenses.')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECRUITMENT CALLOUT: GROW YOUR EXPORT ENTERPRISE */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
              <Store size={15} />
              <span>{t('FOR MANUFACTURERS & EXPORTERS')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Start Exporting to 50+ Countries on UBS Global
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Join thousands of international verified vendors. Showcase heavy equipment, commodities,
              and consumer products directly to verified overseas buyers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/seller/register"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-center hover:scale-[1.01]"
            >
              <span>{t('Register as a Seller')}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/seller"
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
            >
              <span>{t('Seller Portal')}</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Global Location Setter Dialog */}
      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  );
}
