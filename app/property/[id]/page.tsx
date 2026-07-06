'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { Navbar } from '../../../components/Navbar';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Bed,
  Maximize,
  Calendar,
  Eye,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';
import { getProductImageUrl } from '../../../lib/image';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);

  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Load property details & increment views
  const loadProperty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/properties/${id}`);
      if (res.data?.property) {
        setProperty(res.data.property);
        // Increment views
        api.patch(`/properties/${id}/views`).catch(() => null);
      }
    } catch (err) {
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const handleStartChat = async () => {
    setChatLoading(true);
    try {
      const res = await api.post(`/properties/${property._id}/chat`);
      if (res.data?.success && res.data?.chatRoomId) {
        router.push(`/messages?roomId=${res.data.chatRoomId}`);
      }
    } catch (err) {
      console.error(err);
      alert(t('Could not start chat with property listing owner.'));
    } finally {
      setChatLoading(false);
    }
  };

  const getPropertyImage = (img: string) => {
    return getProductImageUrl(img);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="font-semibold text-slate-600">{t('Property not found.')}</p>
        <button
          onClick={() => router.push('/real-estate')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          {t('Go to Real Estate')}
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [''];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('Back')}</span>
        </button>

        {/* Info Header details */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${
                  property.listingType === 'sale' ? 'bg-rose-500' : 'bg-primary'
                }`}
              >
                {property.listingType === 'sale' ? t('For Sale') : t('For Rent')}
              </span>
              {property.propertyType && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                  {t(property.propertyType)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin size={15} className="text-accent" />
                <span>
                  {property.address?.city}, {property.address?.state ? property.address.state + ', ' : ''}
                  {property.address?.country}
                </span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Eye size={15} />
                <span>
                  {property.views || 0} {t('Views')}
                </span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Calendar size={15} />
                <span>{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-3xl shrink-0 flex flex-col items-start lg:items-end justify-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Price')}</span>
            <span className="text-3xl font-black text-primary mt-1">
              ${property.price}
              {property.listingType === 'rent' && <span className="text-xs font-bold text-slate-400">/mo</span>}
            </span>
          </div>
        </div>

        {/* Gallery & Details section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Columns (Gallery + Specifications) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image display */}
            <div className="space-y-4">
              <div className="relative aspect-16/10 w-full rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <img
                  src={getPropertyImage(images[selectedImage])}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden bg-white border cursor-pointer shrink-0 transition-all ${
                        selectedImage === idx ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'
                      }`}
                    >
                      <img src={getPropertyImage(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities details box */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3">
                {t('Property Specifications')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-slate-600 text-sm font-semibold">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="text-slate-400" size={18} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">{t('Bedrooms')}</span>
                      <span className="text-slate-700 text-xs sm:text-sm font-bold">{property.bedrooms} {t('BHK')}</span>
                    </div>
                  </div>
                )}
                {property.areaSize && (
                  <div className="flex items-center gap-2">
                    <Maximize className="text-slate-400" size={18} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">{t('Area')}</span>
                      <span className="text-slate-700 text-xs sm:text-sm font-bold">
                        {property.areaSize} {property.areaUnit || 'Sq.Ft'}
                      </span>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Building className="text-slate-400" size={18} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">{t('Bathrooms')}</span>
                      <span className="text-slate-700 text-xs sm:text-sm font-bold">{property.bathrooms}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('About the Property')}
                </span>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base">{t('Amenities')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((am: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>{t(am)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Agent contact panel) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3">
                {t('Contact Exporter / Agent')}
              </h3>

              {property.ownerId && (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center uppercase">
                    {property.ownerId.name ? property.ownerId.name.charAt(0) : 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{property.ownerId.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {property.ownerId.role || 'Listing Agent'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                  <span>{t('Contact Seller / Start Chat')}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex items-start gap-2.5">
                <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t('Admin will review and connect you with seller within 24 hours.') ||
                    'UBS Global verifies all properties. Upon initiation of chat, the trade agent will attach shipping documentation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
