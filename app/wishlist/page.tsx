'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { getProductImageUrl } from '../../lib/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Star,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertCircle,
  LogIn
} from 'lucide-react';

interface Seller {
  _id?: string;
  shopName?: string;
  isVerified?: boolean;
}

interface Product {
  _id: string;
  title: string;
  images?: string[];
  image?: string;
  price: number;
  rating?: number;
  stock?: number;
  category?: string | { name?: string };
  sellerId?: Seller;
}

interface WishlistItem {
  _id?: string;
  productId: Product;
  addedAt?: string;
}

export default function WishlistPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cartAddingId, setCartAddingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const loadWishlist = useCallback(async (showSkeleton = true) => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (showSkeleton) setLoading(true);
      const res = await api.get('/wishlist');

      const rawProducts: any[] = res.data?.products || res.data?.wishlist || [];
      // Filter out any corrupted or null items
      const validItems: WishlistItem[] = rawProducts
        .filter((item) => item && item.productId && (item.productId._id || typeof item.productId === 'string'))
        .map((item) => {
          // If productId is somehow just an id string, normalize to object
          if (typeof item.productId === 'string') {
            return {
              ...item,
              productId: { _id: item.productId, title: t('Product'), price: 0 } as Product,
            };
          }
          return item;
        });

      setItems(validItems);
    } catch (err: any) {
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    if (!authLoading) {
      loadWishlist(true);
    }
  }, [authLoading, loadWishlist]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWishlist(false);
  };

  const handleRemove = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI removal
    const previousItems = [...items];
    setItems((prev) => prev.filter((item) => item.productId?._id !== productId));
    setRemovingId(productId);

    try {
      await api.post(`/wishlist/toggle/${productId}`);
      showToast(t('Item removed from wishlist'));
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
      // Revert if request failed
      setItems(previousItems);
      showToast(t('Failed to remove item. Please try again.'), 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isOutOfStock = Number(product.stock ?? 0) <= 0;
    if (isOutOfStock) {
      showToast(t('This item is currently out of stock.'), 'error');
      return;
    }

    setCartAddingId(product._id);
    try {
      const sellerIdStr =
        typeof product.sellerId === 'object' && product.sellerId?._id
          ? product.sellerId._id
          : typeof product.sellerId === 'string'
          ? product.sellerId
          : '';

      const imagesArray = product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

      addToCart(
        {
          _id: product._id,
          title: product.title,
          images: imagesArray,
          price: Number(product.price || 0),
          sellerId: sellerIdStr,
        },
        1
      );

      showToast(t('Added to cart! 🛒'), 'success');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showToast(t('Failed to add to cart.'), 'error');
    } finally {
      setTimeout(() => setCartAddingId(null), 400);
    }
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => Number(item.productId?.stock ?? 0) > 0);
    if (inStockItems.length === 0) {
      showToast(t('No in-stock items to add to cart.'), 'error');
      return;
    }

    let addedCount = 0;
    inStockItems.forEach((item) => {
      const product = item.productId;
      const sellerIdStr =
        typeof product.sellerId === 'object' && product.sellerId?._id
          ? product.sellerId._id
          : typeof product.sellerId === 'string'
          ? product.sellerId
          : '';

      const imagesArray = product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

      addToCart(
        {
          _id: product._id,
          title: product.title,
          images: imagesArray,
          price: Number(product.price || 0),
          sellerId: sellerIdStr,
        },
        1
      );
      addedCount++;
    });

    showToast(`${addedCount} ${t('items added to cart! 🛒')}`, 'success');
  };

  const handleClearWishlist = async () => {
    if (!window.confirm(t('Are you sure you want to clear your wishlist?'))) return;

    const previousItems = [...items];
    setItems([]);

    try {
      // Toggle each item to clear
      await Promise.all(
        previousItems.map((item) => api.post(`/wishlist/toggle/${item.productId._id}`).catch(() => null))
      );
      showToast(t('Wishlist cleared'));
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      setItems(previousItems);
      showToast(t('Failed to clear wishlist'), 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60">
      <Navbar />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white border ${
              notification.type === 'success'
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-rose-600 border-rose-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header navigation and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft size={14} />
              <span>{t('Back')}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-xs">
                <Heart size={20} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                  <span>{t('My Wishlist')}</span>
                  {isAuthenticated && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {items.length}
                    </span>
                  )}
                </h1>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  {t('Manage your saved favorites, monitor prices, and move to cart easily.')}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons (when authenticated & has items) */}
          {isAuthenticated && items.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title={t('Refresh wishlist')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary' : ''} />
              </button>

              <button
                onClick={handleClearWishlist}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{t('Clear All')}</span>
              </button>

              <button
                onClick={handleAddAllToCart}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
              >
                <ShoppingCart size={15} />
                <span>{t('Add All to Cart')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {authLoading || loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 shadow-sm animate-pulse"
              >
                <div className="aspect-square w-full rounded-2xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-3 w-1/3 bg-slate-100 rounded-md" />
                  <div className="h-4 w-4/5 bg-slate-100 rounded-md" />
                  <div className="h-4 w-1/4 bg-slate-100 rounded-md mt-2" />
                </div>
                <div className="h-10 w-full bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : !isAuthenticated ? (
          /* Unauthenticated State */
          <div className="max-w-md mx-auto py-16 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-linear-to-tr from-rose-50 to-rose-100/50 border border-rose-200/60 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-100">
              <Heart size={36} className="stroke-[2.2]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {t('Sign in to view your wishlist')}
              </h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                {t('Keep track of your favorite products across all devices and get immediate access when you sign in.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn size={15} />
                <span>{t('Sign In / Register')}</span>
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>{t('Explore Products')}</span>
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Wishlist State */
          <div className="max-w-lg mx-auto py-16 text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-linear-to-tr from-slate-100 to-rose-50 border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-inner">
              <Heart size={44} className="text-rose-400 stroke-[1.8]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {t('Your Wishlist is Empty')}
              </h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                {t('Explore our vast international market and save your favorite items!')}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>{t('Explore Products')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const isOutOfStock = Number(product.stock ?? 0) <= 0;
              const imageUrl = getProductImageUrl(product.images?.[0] || product.image);
              const isRemoving = removingId === product._id;
              const isAddingCart = cartAddingId === product._id;

              const categoryName =
                typeof product.category === 'object' && product.category?.name
                  ? product.category.name
                  : typeof product.category === 'string'
                  ? product.category
                  : '';

              const sellerName = product.sellerId?.shopName || t('Verified Seller');

              return (
                <div
                  key={item._id || product._id}
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="group bg-white rounded-3xl border border-slate-200/70 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer relative"
                >
                  {/* Top Image Section */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Out of Stock Overlay / Badge */}
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-rose-600/95 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-md backdrop-blur-xs">
                        {t('Out of Stock')}
                      </span>
                    )}

                    {/* Seller Badge */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Store size={11} className="text-primary-light" />
                      <span className="truncate max-w-32">{sellerName}</span>
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      onClick={(e) => handleRemove(product._id, e)}
                      disabled={isRemoving}
                      title={t('Remove from wishlist')}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-rose-500 hover:text-rose-600 shadow-md hover:scale-110 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-rose-100 z-10"
                    >
                      {isRemoving ? (
                        <Loader2 size={16} className="animate-spin text-rose-500" />
                      ) : (
                        <Heart size={18} fill="currentColor" />
                      )}
                    </button>
                  </div>

                  {/* Product Details Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      {categoryName && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                          {t(categoryName)}
                        </span>
                      )}
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {t(product.title)}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs text-amber-500 pt-0.5">
                        <Star size={13} fill="currentColor" />
                        <span className="font-bold text-slate-700">
                          {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
                        </span>
                      </div>
                    </div>

                    {/* Price and Add to Cart Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t('Price')}
                        </span>
                        <span className="font-black text-primary text-lg tracking-tight">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isOutOfStock || isAddingCart}
                        className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 active:scale-95'
                        }`}
                      >
                        {isAddingCart ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                        <span>{isOutOfStock ? t('Out of Stock') : t('Add to Cart')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
