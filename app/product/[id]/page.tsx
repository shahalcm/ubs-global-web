'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import api from '../../../lib/api';
import { Navbar } from '../../../components/Navbar';
import {
  Loader2,
  ArrowLeft,
  Heart,
  Star,
  ShoppingCart,
  MessageSquare,
  Building,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  Upload,
  Send
} from 'lucide-react';
import { getProductImageUrl, getSellerImageUrl } from '../../../lib/image';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);

  const { t, language } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Tabs
  const [activeTab, setActiveTab] = useState<'Description' | 'Reviews'>('Description');

  // Review states
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Job application states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyExperience, setApplyExperience] = useState('');
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const loadProductData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [prodRes, reviewsRes, wishlistRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`).catch(() => null),
        isAuthenticated ? api.get('/wishlist').catch(() => null) : Promise.resolve(null),
      ]);

      if (prodRes.data?.product) {
        setProduct(prodRes.data.product);
      }

      if (reviewsRes?.data?.reviews) {
        setReviews(reviewsRes.data.reviews);
      }

      if (wishlistRes) {
        const wishlistItems = wishlistRes?.data?.products || wishlistRes?.data?.wishlist;
        if (Array.isArray(wishlistItems)) {
          const wishIds = wishlistItems.map((w: any) => w?.productId?._id || w?.productId || w?._id || w?.id);
          setIsWishlisted(wishIds.includes(id));
        }
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // Sync inputs if user changes
  useEffect(() => {
    if (user && applyModalOpen) {
      setApplyName(user.name || '');
      setApplyEmail(user.email || '');
      setApplyPhone(user.phone || '');
    }
  }, [user, applyModalOpen]);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/toggle/${id}`);
      if (res.data) {
        setIsWishlisted(Boolean(res.data.isWishlisted));
        alert(res.data.message || (res.data.isWishlisted ? t('Added to wishlist') : t('Removed from wishlist')));
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!product) return;
    addToCart(product, quantity);
    alert(t('Added to cart!'));
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!product) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setChatLoading(true);
    try {
      const res = await api.post(`/products/${product._id}/chat`);
      if (res.data?.success && res.data?.chatRoomId) {
        router.push(`/messages?roomId=${res.data.chatRoomId}`);
      }
    } catch (err) {
      console.error(err);
      alert(t('Could not start chat with seller.'));
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingInput === 0) {
      alert(t('Please select a star rating'));
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: ratingInput,
        comment: commentInput,
      });

      if (res.data?.success) {
        alert(t('Thank you for your review!'));
        setCommentInput('');
        setRatingInput(0);
        loadProductData();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName.trim() || !applyEmail.trim() || !applyPhone.trim() || !applyExperience.trim()) {
      alert(t('Please fill all required fields'));
      return;
    }

    setSubmittingApplication(true);
    try {
      const formData = new FormData();
      formData.append('jobId', product._id);
      formData.append('name', applyName.trim());
      formData.append('email', applyEmail.trim());
      formData.append('phone', applyPhone.trim());
      formData.append('experience', applyExperience.trim());
      formData.append('coverLetter', applyCoverLetter.trim());

      if (selectedCV) {
        formData.append('resume', selectedCV);
      }

      const res = await api.post('/job-applications/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        alert(t('Your job application has been submitted successfully!'));
        setApplyModalOpen(false);
        setApplyExperience('');
        setApplyCoverLetter('');
        setSelectedCV(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('Failed to submit job application'));
    } finally {
      setSubmittingApplication(false);
    }
  };

  const getProductImage = (img: string) => {
    return getProductImageUrl(img);
  };

  const getSellerImage = (img: string) => {
    return getSellerImageUrl(img);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="font-semibold text-slate-600">{t('Product not found.')}</p>
        <button
          onClick={() => router.push('/home')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          {t('Go Home')}
        </button>
      </div>
    );
  }

  const categoryName = product.category?.name?.toLowerCase().trim() || '';
  const isJobPortal = categoryName === 'job portal';
  const isServicePortal = categoryName === 'service portal';
  const isJobOrService = isJobPortal || isServicePortal;
  const images = product.images && product.images.length > 0 ? product.images : [''];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('Back')}</span>
        </button>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden group">
              <img
                src={getProductImage(images[selectedImage])}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-rose-500 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white border cursor-pointer shrink-0 transition-all ${
                      selectedImage === idx ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'
                    }`}
                  >
                    <img src={getProductImage(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider block w-fit border border-primary/5">
                {t(product.category?.name || product.category)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {product.translations?.[language]?.title || t(product.title) || product.title}
              </h1>

              {/* Rating and Sales details */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-slate-700">{product.rating || 0}</span>
                </div>
                <span>•</span>
                <span>
                  {product.totalReviews || 0} {t('Reviews')}
                </span>
                <span>•</span>
                <span>
                  {product.totalSales || 0} {t('Sold')}
                </span>
              </div>
            </div>

            {/* Price section */}
            {!isJobOrService && (
              <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">${product.price}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-slate-400 line-through text-sm font-semibold">${product.comparePrice}</span>
                )}
              </div>
            )}

            {/* Description Preview */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-b border-slate-100 py-4">
              {product.translations?.[language]?.description || t(product.description) || product.description}
            </p>

            {/* Quantity selector */}
            {!isJobOrService && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">{t('Quantity')}</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Out of Stock Banner */}
            {!isJobOrService && Number(product.stock ?? 0) <= 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 font-bold text-xs">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{t('This item is currently Out of Stock and cannot be purchased.')}</span>
              </div>
            )}

            {/* Product Actions */}
            {!isJobOrService ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={Number(product.stock ?? 0) <= 0}
                  className={`py-3.5 rounded-2xl border-2 border-primary bg-white text-primary font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    Number(product.stock ?? 0) <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' : 'hover:bg-primary/5 cursor-pointer'
                  }`}
                >
                  <ShoppingCart size={18} />
                  <span>{Number(product.stock ?? 0) <= 0 ? t('Out of Stock') : t('Add to Cart')}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={Number(product.stock ?? 0) <= 0}
                  className={`py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                    Number(product.stock ?? 0) <= 0 ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20 cursor-pointer'
                  }`}
                >
                  <span>{Number(product.stock ?? 0) <= 0 ? t('Out of Stock') : t('Buy Now')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/login');
                  } else {
                    setApplyModalOpen(true);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Building size={18} />
                <span>{isJobPortal ? t('Apply for Job') : t('Book Service')}</span>
              </button>
            )}

            {/* Seller profile card */}
            {!isJobOrService && product.sellerId && (
              <div className="p-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 shadow-sm relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                  <img
                    src={getSellerImage(product.sellerId.shopLogo)}
                    alt={product.sellerId.shopName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{product.sellerId.shopName}</h3>
                    {product.sellerId.isVerified && <ShieldCheck size={14} className="text-teal-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {product.sellerId.businessType || 'Exporter'} • {product.sellerId.responseRate || 100}% Response
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={handleStartChat}
                    disabled={chatLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {chatLoading ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                    <span>{t('Contact')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab section: description / reviews */}
        <section className="space-y-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('Description')}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'Description' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
              }`}
            >
              {t('Description')}
            </button>
            <button
              onClick={() => setActiveTab('Reviews')}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'Reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
              }`}
            >
              {t('Reviews')} ({reviews.length})
            </button>
          </div>

          {activeTab === 'Description' ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-bold text-slate-800 text-base">{t('Product Specifications')}</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submit Review */}
              {isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">{t('Write a Review')}</h3>

                  {/* Stars selectors */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRatingInput(i + 1)}
                        className={`text-2xl cursor-pointer transition-colors ${
                          ratingInput > i ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={t('Share details of your experience...')}
                      rows={3}
                      className="w-full p-4 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary bg-slate-50/50 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark shadow-md shadow-primary/10 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-55"
                  >
                    {submittingReview ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>{t('Submit Review')}</span>
                  </button>
                </form>
              )}

              {/* Reviews Directory List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id || rev.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center uppercase">
                            {rev.userId?.name ? rev.userId.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{rev.userId?.name || t('Buyer')}</h4>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5 text-amber-400 text-sm">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx}>{rev.rating > idx ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">{t('No reviews yet for this product.')}</div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Application Overlay Dialog */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
              {isJobPortal ? t('Apply for Job') : t('Book Service')}
            </h3>

            <form onSubmit={handleApplyJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('Full Name')}</label>
                <input
                  type="text"
                  value={applyName}
                  onChange={(e) => setApplyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('Email')}</label>
                <input
                  type="email"
                  value={applyEmail}
                  onChange={(e) => setApplyEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('Phone')}</label>
                <input
                  type="text"
                  value={applyPhone}
                  onChange={(e) => setApplyPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isJobPortal ? t('Years of Experience') : t('Service Details')}
                </label>
                <input
                  type="text"
                  value={applyExperience}
                  onChange={(e) => setApplyExperience(e.target.value)}
                  placeholder={isJobPortal ? 'e.g. 3 years' : 'e.g. Booking date/requirements'}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('Cover Letter')}</label>
                <textarea
                  value={applyCoverLetter}
                  onChange={(e) => setApplyCoverLetter(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm resize-none"
                  rows={3}
                />
              </div>

              {isJobPortal && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('Upload CV (PDF)')}</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedCV(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-xs text-slate-600 font-bold">
                      {selectedCV ? selectedCV.name : t('Select CV File')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 border-t border-slate-50 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingApplication}
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md cursor-pointer disabled:opacity-75 flex items-center justify-center gap-1.5"
                >
                  {submittingApplication ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{t('Submit')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
