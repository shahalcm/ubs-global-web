'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Search, Loader2, SlidersHorizontal, Heart, ShoppingCart, RefreshCw, Grid } from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

function ProductsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  // Search details from URL
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      params.sort = sortBy;

      const res = await api.get('/products', { params });
      if (res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const getProductImage = (images: string[]) => {
    return getProductImageUrl(images && images[0]);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    router.replace('/products');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Grid size={24} className="text-primary" />
              <span>{t('All Products')}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              {products.length} {t('products found')}
            </p>
          </div>

          {/* Search bar + toggle filters */}
          <div className="flex gap-2">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search products...')}
                className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-slate-200 focus:border-primary focus:outline-none text-xs font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={15} />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border font-bold text-xs cursor-pointer transition-colors ${
                showFilters || selectedCategory || minPrice || maxPrice
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>{t('Filters')}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters Bar */}
        {(showFilters || selectedCategory || minPrice || maxPrice) && (
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                >
                  <option value="">{t('All Categories')}</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat.name}>
                      {t(cat.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filters */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Min Price ($)')}
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Max Price ($)')}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                />
              </div>

              {/* Sort selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Sort By')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                >
                  <option value="newest">{t('Newest')}</option>
                  <option value="oldest">{t('Oldest')}</option>
                  <option value="price_low">{t('Price: Low to High')}</option>
                  <option value="price_high">{t('Price: High to Low')}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                {t('Reset')}
              </button>
              <button
                onClick={fetchProducts}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                {t('Apply Filters')}
              </button>
            </div>
          </div>
        )}

        {/* Listing Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-sm font-semibold text-slate-500">{t('Loading products...')}</span>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
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
                        className="px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all border border-primary/5 cursor-pointer"
                      >
                        {t('Add')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400">
              <RefreshCw size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 text-base">{t('No products found')}</h3>
              <p className="text-slate-400 text-xs mt-1">{t('Try adjusting filters or searching for something else.')}</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer"
            >
              {t('Clear Filters')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
