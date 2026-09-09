'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  Tag,
  Layers,
  Filter,
  DollarSign,
  Truck,
  Box,
  Sliders,
  FileText,
  Check,
  Globe,
  ShieldCheck,
  Info
} from 'lucide-react';
import api from '@/lib/api';
import { useSeller } from '@/context/SellerContext';

const PRESET_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Navy', 'Gray', 'Beige', 'Gold', 'Silver'];
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', 'Free Size'];

const PRESET_CATEGORIES = [
  { label: 'Fashion', value: 'fashion' },
  { label: 'Mobiles', value: 'mobiles' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Cosmetics', value: 'cosmetics' },
  { label: 'Grocery', value: 'grocery' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Medicines', value: 'medicines' },
  { label: 'Home & Kitchen', value: 'home-kitchen' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Building Materials', value: 'building-materials' },
  { label: 'Machinery', value: 'machinery' },
  { label: 'Oils', value: 'oils' },
];

const SUBCATEGORIES_MAP: Record<string, { label: string; value: string }[]> = {
  fashion: [
    { label: "Men's Wear", value: 'mens-wear' },
    { label: "Women's Wear", value: 'womens-wear' },
    { label: 'Kids Wear', value: 'kids-wear' },
    { label: 'Footwear', value: 'footwear' },
    { label: 'Accessories', value: 'accessories' }
  ],
  mobiles: [
    { label: 'Smartphones', value: 'smartphones' },
    { label: 'Feature Phones', value: 'feature-phones' },
    { label: 'Tablets', value: 'tablets' },
    { label: 'Mobile Accessories', value: 'mobile-accessories' }
  ],
  furniture: [
    { label: 'Living Room Furniture', value: 'living-room' },
    { label: 'Bedroom Furniture', value: 'bedroom' },
    { label: 'Office Furniture', value: 'office-furniture' },
    { label: 'Outdoor Furniture', value: 'outdoor-furniture' }
  ],
  cosmetics: [
    { label: 'Skincare', value: 'skincare' },
    { label: 'Haircare', value: 'haircare' },
    { label: 'Makeup', value: 'makeup' },
    { label: 'Fragrances', value: 'fragrances' },
    { label: 'Personal Care', value: 'personal-care' }
  ],
  grocery: [
    { label: 'Fruits & Vegetables', value: 'fruits-vegetables' },
    { label: 'Dairy & Eggs', value: 'dairy-eggs' },
    { label: 'Beverages', value: 'beverages' },
    { label: 'Packaged Food', value: 'packaged-food' },
    { label: 'Spices & Grains', value: 'spices-grains' }
  ],
  electronics: [
    { label: 'Laptops & Computers', value: 'laptops-computers' },
    { label: 'Cameras & Optics', value: 'cameras-optics' },
    { label: 'Audio & Headphones', value: 'audio-headphones' },
    { label: 'Smart Home Devices', value: 'smart-home' },
    { label: 'Televisions & Media Players', value: 'televisions-media' }
  ],
  medicines: [
    { label: 'Prescription Drugs', value: 'prescription' },
    { label: 'OTC Medicines', value: 'otc' },
    { label: 'Vitamins & Supplements', value: 'vitamins-supplements' },
    { label: 'First Aid & Medical Supplies', value: 'first-aid' }
  ],
  'home-kitchen': [
    { label: 'Cookware & Tableware', value: 'cookware-tableware' },
    { label: 'Home Decor & Lighting', value: 'home-decor' },
    { label: 'Kitchen Appliances', value: 'kitchen-appliances' },
    { label: 'Bedding & Bath Linens', value: 'bedding-bath' }
  ],
  'real-estate': [
    { label: 'Residential Properties', value: 'residential' },
    { label: 'Commercial Properties', value: 'commercial' },
    { label: 'Rentals & Leases', value: 'rentals' },
    { label: 'Land & Plots', value: 'land-plots' }
  ],
  'building-materials': [
    { label: 'Cement & Concrete', value: 'cement-concrete' },
    { label: 'Steel & Metal Rebar', value: 'steel-rebar' },
    { label: 'Pipes & Sanitary Fittings', value: 'pipes-fittings' },
    { label: 'Electrical Wires & Switches', value: 'electrical-switches' },
    { label: 'Paints & Wall Finishes', value: 'paints-finishes' }
  ],
  machinery: [
    { label: 'Agricultural Machinery', value: 'agricultural' },
    { label: 'Industrial Machinery', value: 'industrial' },
    { label: 'Construction Equipment', value: 'construction' },
    { label: 'Tools & Hardware Instruments', value: 'tools-hardware' }
  ],
  oils: [
    { label: 'Edible cooking Oils', value: 'edible-cooking' },
    { label: 'Industrial Lubricants', value: 'lubricants' },
    { label: 'Essential / Aroma Oils', value: 'essential-aroma' },
    { label: 'Hair & Cosmetic Oils', value: 'hair-cosmetic' }
  ]
};

const initialForm = {
  title: '',
  description: '',
  sku: '',
  category: '',
  subcategory: '',
  customSubcategory: '',
  price: '',
  comparePrice: '',
  costPerItem: '',
  priceUnit: '',
  stock: '10',
  stockUnit: 'pcs',
  lowStockAlert: '5',
  inStock: true,
  status: 'active',
  isFeatured: false,
  brand: '',
  selectedColors: [] as string[],
  customColor: '',
  selectedSizes: [] as string[],
  customSize: '',
  countryOfOrigin: '',
  warranty: '',
  material: '',
  fit: '',
  sleeve: '',
  neck: '',
  refundPolicy: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  freeShipping: false,
  shippingFee: '',
};

export default function SellerProductsPage() {
  const { seller } = useSeller();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerAccessError, setSellerAccessError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [productForm, setProductForm] = useState(initialForm);

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (actionParam === 'add') {
      openAddModal();
    }
  }, [actionParam]);

  const loadProductsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      setSellerAccessError(null);

      const [prodRes, catRes] = await Promise.all([
        api.get('/products/seller/my-products').catch((err) => {
          console.warn('Seller products fetch notice:', err?.response?.data?.message || err?.message);
          if (err?.response?.status === 403) {
            setSellerAccessError('Seller account required. Please register or switch to an approved seller profile.');
          }
          return { data: { success: false, products: [] } };
        }),
        api.get('/categories').catch((err) => {
          console.warn('Categories fetch notice:', err?.response?.data?.message || err?.message);
          return { data: { success: false, categories: [] } };
        }),
      ]);

      if (prodRes?.data?.success) {
        setProducts(prodRes.data.products || []);
      }
      if (catRes?.data?.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err: any) {
      console.warn('Error fetching seller products:', err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductsAndCategories();
  }, [loadProductsAndCategories]);

  const openAddModal = () => {
    setEditingProductId(null);
    const defaultCat = categories[0]?._id || PRESET_CATEGORIES[0].value;
    setProductForm({
      ...initialForm,
      category: defaultCat,
    });
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProductId(prod._id || prod.id);

    const colorsArr = Array.isArray(prod.colors)
      ? prod.colors
      : prod.color
      ? [prod.color]
      : [];
    const sizesArr = Array.isArray(prod.sizes) ? prod.sizes : [];

    setProductForm({
      title: prod.title || prod.name || '',
      description: prod.description || '',
      sku: prod.sku || '',
      category: prod.category?._id || prod.category?.slug || prod.category || '',
      subcategory: prod.subcategory || '',
      customSubcategory: '',
      price: prod.price?.toString() || '',
      comparePrice: prod.comparePrice?.toString() || prod.discountPrice?.toString() || '',
      costPerItem: prod.costPerItem?.toString() || '',
      priceUnit: prod.priceUnit || '',
      stock: prod.stock?.toString() || '0',
      stockUnit: prod.stockUnit || 'pcs',
      lowStockAlert: prod.lowStockAlert?.toString() || '5',
      inStock: prod.inStock !== undefined ? prod.inStock : (Number(prod.stock || 0) > 0),
      status: prod.status || 'active',
      isFeatured: prod.isFeatured || false,
      brand: prod.brand || '',
      selectedColors: colorsArr,
      customColor: '',
      selectedSizes: sizesArr,
      customSize: '',
      countryOfOrigin: prod.countryOfOrigin || '',
      warranty: prod.warranty || '',
      material: prod.material || '',
      fit: prod.fit || '',
      sleeve: prod.sleeve || '',
      neck: prod.neck || '',
      refundPolicy: prod.refundPolicy || '',
      weight: prod.weight?.toString() || '',
      length: prod.dimensions?.length?.toString() || '',
      width: prod.dimensions?.width?.toString() || '',
      height: prod.dimensions?.height?.toString() || '',
      freeShipping: prod.freeShipping || false,
      shippingFee: prod.shippingFee?.toString() || '',
    });

    const imgs = prod.images || [];
    setExistingImages(imgs);
    setImagePreviews(imgs);
    setSelectedImageFiles([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const availableSlots = 5 - imagePreviews.length;
      const filesToTake = files.slice(0, availableSlots);

      setSelectedImageFiles((prev) => [...prev, ...filesToTake]);
      const newPreviews = filesToTake.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    // If index belongs to existing images vs new files
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setSelectedImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const toggleColor = (color: string) => {
    setProductForm((prev) => {
      const exists = prev.selectedColors.includes(color);
      return {
        ...prev,
        selectedColors: exists
          ? prev.selectedColors.filter((c) => c !== color)
          : [...prev.selectedColors, color],
      };
    });
  };

  const addCustomColor = () => {
    const trimmed = productForm.customColor.trim();
    if (trimmed && !productForm.selectedColors.includes(trimmed)) {
      setProductForm((prev) => ({
        ...prev,
        selectedColors: [...prev.selectedColors, trimmed],
        customColor: '',
      }));
    }
  };

  const toggleSize = (size: string) => {
    setProductForm((prev) => {
      const exists = prev.selectedSizes.includes(size);
      return {
        ...prev,
        selectedSizes: exists
          ? prev.selectedSizes.filter((s) => s !== size)
          : [...prev.selectedSizes, size],
      };
    });
  };

  const addCustomSize = () => {
    const trimmed = productForm.customSize.trim();
    if (trimmed && !productForm.selectedSizes.includes(trimmed)) {
      setProductForm((prev) => ({
        ...prev,
        selectedSizes: [...prev.selectedSizes, trimmed],
        customSize: '',
      }));
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      setModalError('Product title is required.');
      return;
    }
    if (!productForm.description.trim()) {
      setModalError('Product description is required.');
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      setModalError('Valid price is required.');
      return;
    }
    if (!productForm.category) {
      setModalError('Category is required.');
      return;
    }
    if (imagePreviews.length === 0) {
      setModalError('At least one product image is required.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const formData = new FormData();
      formData.append('title', productForm.title.trim());
      formData.append('description', productForm.description.trim());
      formData.append('sku', productForm.sku.trim() || `UBS-${Date.now()}`);
      formData.append('category', productForm.category);
      formData.append(
        'subcategory',
        productForm.subcategory === 'custom'
          ? productForm.customSubcategory.trim()
          : productForm.subcategory
      );
      formData.append('price', productForm.price);
      formData.append('comparePrice', productForm.comparePrice || '0');
      formData.append('costPerItem', productForm.costPerItem || '0');
      formData.append('priceUnit', productForm.priceUnit || '');
      
      const finalStock = productForm.inStock
        ? Number(productForm.stock) > 0
          ? productForm.stock
          : '10'
        : '0';
      formData.append('stock', finalStock);
      formData.append('inStock', String(productForm.inStock));
      formData.append('stockUnit', productForm.stockUnit || 'pcs');
      formData.append('lowStockAlert', productForm.lowStockAlert || '5');

      formData.append('status', productForm.status);
      formData.append('isFeatured', String(productForm.isFeatured));
      formData.append('brand', productForm.brand.trim());

      formData.append('color', productForm.selectedColors[0] || '');
      formData.append('colors', JSON.stringify(productForm.selectedColors));
      formData.append('sizes', JSON.stringify(productForm.selectedSizes));
      formData.append('countryOfOrigin', productForm.countryOfOrigin.trim());
      formData.append('warranty', productForm.warranty.trim());
      formData.append('material', productForm.material.trim());
      formData.append('fit', productForm.fit.trim());
      formData.append('sleeve', productForm.sleeve.trim());
      formData.append('neck', productForm.neck.trim());
      formData.append('refundPolicy', productForm.refundPolicy.trim());

      formData.append('weight', productForm.weight || '0');
      formData.append('length', productForm.length || '0');
      formData.append('width', productForm.width || '0');
      formData.append('height', productForm.height || '0');
      formData.append('freeShipping', String(productForm.freeShipping));
      formData.append('shippingFee', productForm.shippingFee || '0');

      // Add uploaded files
      selectedImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      let res;
      if (editingProductId) {
        res = await api.put(`/products/${editingProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data?.success) {
        setIsModalOpen(false);
        await loadProductsAndCategories();
      } else {
        setModalError(res.data?.message || 'Failed to save product.');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Server error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        await loadProductsAndCategories();
      }
    } catch (err: any) {
      console.warn('Error deleting product notice:', err?.response?.data?.message || err?.message);
    }
  };

  const filters = ['All', 'Active', 'Out of Stock', 'Draft', 'Featured'];

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeFilter === 'Active') list = list.filter((p) => p.status === 'active' && (p.stock || 0) > 0);
    if (activeFilter === 'Out of Stock') list = list.filter((p) => (p.stock || 0) === 0);
    if (activeFilter === 'Draft') list = list.filter((p) => p.status === 'draft');
    if (activeFilter === 'Featured') list = list.filter((p) => p.isFeatured === true);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => (p.title || p.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, activeFilter, searchQuery]);

  // Derived subcategories list based on category selected
  const activeCategoryKey = useMemo(() => {
    if (!productForm.category) return '';
    const catObj = categories.find((c) => c._id === productForm.category);
    const catNameOrSlug = (catObj?.slug || catObj?.name || productForm.category).toLowerCase();
    return catNameOrSlug;
  }, [productForm.category, categories]);

  const availableSubcategories = useMemo(() => {
    if (!activeCategoryKey) return [];
    for (const key in SUBCATEGORIES_MAP) {
      if (activeCategoryKey.includes(key) || key.includes(activeCategoryKey)) {
        return SUBCATEGORIES_MAP[key];
      }
    }
    return [];
  }, [activeCategoryKey]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A1A44]">Product Inventory Management</h2>
          <p className="text-xs text-slate-500">Manage catalog, pricing, variants, stock, and approval status</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B4DFF] hover:bg-[#093ecf] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Seller Access Notice if 403 */}
      {sellerAccessError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold">{sellerAccessError}</span>
          </div>
          <Link
            href="/seller/register"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs"
          >
            Register as Seller →
          </Link>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? 'bg-[#0B4DFF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
          />
        </div>
      </div>

      {/* Products Grid / Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#0B4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium mt-3">Loading product inventory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#0A1A44]">No Products Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any products matching the current filter. Add a new product to populate your catalog.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const img = p.images?.[0] || '/placeholder.png';
            const price = p.price || 0;
            const stock = p.stock || 0;

            return (
              <div
                key={p._id || p.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stock > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {stock > 0 ? `${stock} ${p.stockUnit || 'In Stock'}` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.approvalStatus === 'approved' || p.isApproved ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {p.approvalStatus === 'approved' || p.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase text-[#1DA1FF] tracking-wider block mb-1">
                      {p.category?.name || p.category || 'General'}
                    </span>
                    <h4 className="text-sm font-bold text-[#0A1A44] line-clamp-1">{p.title || p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#0A1A44]">
                        ${price.toFixed(2)} {p.priceUnit ? <span className="text-xs text-slate-500 font-normal">{p.priceUnit}</span> : ''}
                      </span>
                      {p.comparePrice && (
                        <span className="text-xs text-slate-400 line-through">${Number(p.comparePrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#0B4DFF]"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p._id || p.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[#0A1A44]">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Fill in complete details to list items on UBS Global store</p>
            </div>

            {modalError && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-8">
              {/* SECTION 1: MEDIA UPLOAD */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0B4DFF]" /> Product Images (Max 5) *
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {imagePreviews.length}/5 photos
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 group bg-white shadow-xs">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {imagePreviews.length < 5 && (
                    <label className="h-28 border-2 border-dashed border-slate-300 hover:border-[#0B4DFF] bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#0B4DFF] transition-all hover:bg-blue-50/20">
                      <Upload className="w-6 h-6 mb-1 text-[#0B4DFF]" />
                      <span className="text-xs font-bold text-slate-700">Upload Image</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* SECTION 2: BASIC INFO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-[#0B4DFF]" /> Basic Info
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Detailed specifications, features and warranty info..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Product Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. UBS-2024-PRD"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* SECTION 3: CATEGORY & SUBCATEGORY */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-4 h-4 text-[#0B4DFF]" /> Category & Subcategory
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value, subcategory: '' })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="">Select Category</option>
                      {/* API fetched categories */}
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                      {/* Preset fallback categories */}
                      {PRESET_CATEGORIES.filter(
                        (preset) => !categories.some((c) => c.slug === preset.value || c.name?.toLowerCase() === preset.value)
                      ).map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
                    <select
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                      <option value="custom">Other / Custom Subcategory</option>
                    </select>
                  </div>
                </div>

                {productForm.subcategory === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Subcategory Name</label>
                    <input
                      type="text"
                      value={productForm.customSubcategory}
                      onChange={(e) => setProductForm({ ...productForm, customSubcategory: e.target.value })}
                      placeholder="e.g. Handmade Crafts, Sports Equipment"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: PRODUCT SPECIFICATIONS & ATTRIBUTES */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sliders className="w-4 h-4 text-[#0B4DFF]" /> Product Specifications & Details
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. Nike, Samsung, Zara, UBS Exclusive..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* COLORS CHIPS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Colors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_COLORS.map((c) => {
                      const selected = productForm.selectedColors.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleColor(c)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                            selected
                              ? 'bg-[#0B4DFF] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={productForm.customColor}
                      onChange={(e) => setProductForm({ ...productForm, customColor: e.target.value })}
                      placeholder="Add custom color (e.g. Olive Green)"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-3.5 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* SIZES CHIPS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_SIZES.map((s) => {
                      const selected = productForm.selectedSizes.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                            selected
                              ? 'bg-[#0B4DFF] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={productForm.customSize}
                      onChange={(e) => setProductForm({ ...productForm, customSize: e.target.value })}
                      placeholder="Add custom size (e.g. 42 EU, Custom)"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="px-3.5 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Country of Origin</label>
                    <input
                      type="text"
                      value={productForm.countryOfOrigin}
                      onChange={(e) => setProductForm({ ...productForm, countryOfOrigin: e.target.value })}
                      placeholder="e.g. India, USA, Italy, China..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warranty / Guarantee</label>
                    <input
                      type="text"
                      value={productForm.warranty}
                      onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                      placeholder="e.g. 1 Year Manufacturer Warranty"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Material / Fabric</label>
                    <input
                      type="text"
                      value={productForm.material}
                      onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                      placeholder="e.g. 100% Pure Cotton"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fit Type</label>
                    <input
                      type="text"
                      value={productForm.fit}
                      onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })}
                      placeholder="e.g. Slim, Regular"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sleeve Type</label>
                    <input
                      type="text"
                      value={productForm.sleeve}
                      onChange={(e) => setProductForm({ ...productForm, sleeve: e.target.value })}
                      placeholder="e.g. Full, Short, 3/4"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Neck / Collar Type</label>
                    <input
                      type="text"
                      value={productForm.neck}
                      onChange={(e) => setProductForm({ ...productForm, neck: e.target.value })}
                      placeholder="e.g. Round Neck, V-Neck, Polo Collar..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Return & Refund Policy</label>
                    <input
                      type="text"
                      value={productForm.refundPolicy}
                      onChange={(e) => setProductForm({ ...productForm, refundPolicy: e.target.value })}
                      placeholder="e.g. 7 Days Easy Return & Replacement"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PRICING */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <DollarSign className="w-4 h-4 text-[#0B4DFF]" /> Pricing & Unit
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="99.99"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Compare Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.comparePrice}
                      onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })}
                      placeholder="129.99"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cost Per Item ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.costPerItem}
                      onChange={(e) => setProductForm({ ...productForm, costPerItem: e.target.value })}
                      placeholder="50.00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Customers won't see this</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit (Optional)</label>
                  <input
                    type="text"
                    value={productForm.priceUnit}
                    onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                    placeholder="e.g. /kg, /gm, /liter, /pcs"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {['/kg', '/gm', '/liter', '/pcs', '/box'].map((unit) => (
                      <button
                        type="button"
                        key={unit}
                        onClick={() => setProductForm({ ...productForm, priceUnit: unit })}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          productForm.priceUnit === unit
                            ? 'bg-[#0B4DFF] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                    {productForm.priceUnit && (
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, priceUnit: '' })}
                        className="px-3 py-1 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 6: INVENTORY & STOCK */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#0B4DFF]" /> Inventory & Stock
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">In Stock</span>
                    <input
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          inStock: e.target.checked,
                          stock: e.target.checked ? (Number(productForm.stock) > 0 ? productForm.stock : '10') : '0',
                        })
                      }
                      className="w-4 h-4 rounded text-[#0B4DFF] focus:ring-[#0B4DFF]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                          inStock: Number(e.target.value) > 0,
                        })
                      }
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      value={productForm.lowStockAlert}
                      onChange={(e) => setProductForm({ ...productForm, lowStockAlert: e.target.value })}
                      placeholder="5"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Unit (Optional)</label>
                  <input
                    type="text"
                    value={productForm.stockUnit}
                    onChange={(e) => setProductForm({ ...productForm, stockUnit: e.target.value })}
                    placeholder="e.g. kg, gm, liter, pcs, box"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {['kg', 'gm', 'liter', 'pcs', 'box'].map((unit) => (
                      <button
                        type="button"
                        key={unit}
                        onClick={() => setProductForm({ ...productForm, stockUnit: unit })}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          productForm.stockUnit === unit
                            ? 'bg-[#0B4DFF] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 7: SHIPPING */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-[#0A1A44] uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0B4DFF]" /> Shipping & Logistics
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Free Shipping</span>
                    <input
                      type="checkbox"
                      checked={productForm.freeShipping}
                      onChange={(e) => setProductForm({ ...productForm, freeShipping: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0B4DFF] focus:ring-[#0B4DFF]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="0.5"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {!productForm.freeShipping && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Fee ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.shippingFee}
                        onChange={(e) => setProductForm({ ...productForm, shippingFee: e.target.value })}
                        placeholder="5.00"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dimensions (L x W x H) in CM</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.length}
                      onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                      placeholder="Length (L)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.width}
                      onChange={(e) => setProductForm({ ...productForm, width: e.target.value })}
                      placeholder="Width (W)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.height}
                      onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                      placeholder="Height (H)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3 border-b-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#093ecf] flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving Product...' : editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

