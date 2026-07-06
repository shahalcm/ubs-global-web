'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Navbar } from '../../components/Navbar';
import { Search, Loader2, Home, MapPin, Bed, Maximize, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

export default function RealEstatePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (propertyType) params.propertyType = propertyType;
      if (listingType) params.listingType = listingType;
      if (city.trim()) params.city = city.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (bedrooms) params.bedrooms = bedrooms;
      params.sort = sortBy;

      const res = await api.get('/properties', { params });
      if (res.data?.properties) {
        setProperties(res.data.properties);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyType, listingType, city, minPrice, maxPrice, bedrooms, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleResetFilters = () => {
    setPropertyType('');
    setListingType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSortBy('newest');
  };

  const getPropertyImage = (images: string[]) => {
    return getProductImageUrl(images && images[0]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Home size={24} className="text-primary" />
              <span>{t('Real Estate Portal')}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              {properties.length} {t('properties found')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border font-bold text-xs cursor-pointer transition-colors ${
                showFilters || propertyType || listingType || city || minPrice || maxPrice
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>{t('Search Filters')}</span>
            </button>
          </div>
        </div>

        {/* Collapsible search form panel */}
        {(showFilters || propertyType || listingType || city || minPrice || maxPrice) && (
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* City filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('City')}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('Search city...')}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Property Type')}
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                >
                  <option value="">{t('All Types')}</option>
                  <option value="house">{t('House')}</option>
                  <option value="apartment">{t('Apartment')}</option>
                  <option value="land">{t('Land')}</option>
                  <option value="commercial">{t('Commercial')}</option>
                </select>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Listing Type')}
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                >
                  <option value="">{t('All Listings')}</option>
                  <option value="sale">{t('For Sale')}</option>
                  <option value="rent">{t('For Rent')}</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('Bedrooms')}
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-primary bg-slate-50/50"
                >
                  <option value="">{t('Any')}</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Prices */}
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
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                {t('Reset')}
              </button>
              <button
                onClick={fetchProperties}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                {t('Search Properties')}
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-sm font-semibold text-slate-500">{t('Loading listings...')}</span>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((item) => (
              <div
                key={item._id || item.id}
                onClick={() => router.push(`/property/${item._id || item.id}`)}
                className="group bg-white rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-16/10 w-full bg-slate-50 overflow-hidden">
                  <img
                    src={getPropertyImage(item.images)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${
                      item.listingType === 'sale' ? 'bg-rose-500' : 'bg-primary'
                    }`}
                  >
                    {item.listingType === 'sale' ? t('For Sale') : t('For Rent')}
                  </span>
                  {item.propertyType && (
                    <span className="absolute bottom-4 left-4 px-2 py-0.5 rounded bg-slate-900/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-widest">
                      {t(item.propertyType)}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-extrabold text-primary text-xl">
                      ${item.price}
                      {item.listingType === 'rent' && <span className="text-xs font-semibold text-slate-400">/mo</span>}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {t(item.title)}
                  </h3>

                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                    <MapPin size={14} className="text-accent" />
                    <span className="truncate">
                      {item.address?.city}, {item.address?.state ? item.address.state + ', ' : ''}{item.address?.country}
                    </span>
                  </div>

                  {/* Amenities / Details Strip */}
                  <div className="flex justify-between border-t border-slate-50 pt-4 text-xs font-bold text-slate-500">
                    {item.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed size={15} className="text-slate-400" />
                        <span>
                          {item.bedrooms} {t('BHK')}
                        </span>
                      </div>
                    )}
                    {item.areaSize && (
                      <div className="flex items-center gap-1">
                        <Maximize size={15} className="text-slate-400" />
                        <span>
                          {item.areaSize} {item.areaUnit || 'Sq.Ft'}
                        </span>
                      </div>
                    )}
                  </div>
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
              <h3 className="font-bold text-slate-700 text-base">{t('No properties found')}</h3>
              <p className="text-slate-400 text-xs mt-1">{t('Try adjusting filters or searching for something else.')}</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all"
            >
              {t('Clear Filters')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
