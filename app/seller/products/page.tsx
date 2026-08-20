'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Filter
} from 'lucide-react';
import api from '@/lib/api';
import { useSeller } from '@/context/SellerContext';

export default function SellerProductsPage() {
  const { seller } = useSeller();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '10',
    status: 'active',
    isFeatured: false,
    brand: '',
    sku: '',
  });

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (actionParam === 'add') {
      openAddModal();
    }
  }, [actionParam]);

  const loadProductsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/seller/my-products'),
        api.get('/categories'),
      ]);

      if (prodRes.data?.success) {
        setProducts(prodRes.data.products || []);
      }
      if (catRes.data?.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching seller products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductsAndCategories();
  }, [loadProductsAndCategories]);

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '',
      stock: '10',
      status: 'active',
      isFeatured: false,
      brand: '',
      sku: '',
    });
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProductId(prod._id || prod.id);
    setProductForm({
      title: prod.title || prod.name || '',
      description: prod.description || '',
      category: prod.category?._id || prod.category || '',
      price: prod.price?.toString() || '',
      discountPrice: prod.discountPrice?.toString() || '',
      stock: prod.stock?.toString() || '0',
      status: prod.status || 'active',
      isFeatured: prod.isFeatured || false,
      brand: prod.brand || '',
      sku: prod.sku || '',
    });
    setSelectedImageFiles([]);
    setImagePreviews(prod.images || []);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.category) {
      setModalError('Please fill in Title, Price, and Category.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      formData.append('discountPrice', productForm.discountPrice);
      formData.append('stock', productForm.stock);
      formData.append('status', productForm.status);
      formData.append('isFeatured', String(productForm.isFeatured));
      formData.append('brand', productForm.brand);
      formData.append('sku', productForm.sku);

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
    } catch (err) {
      console.error('Error deleting product:', err);
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
                        {stock > 0 ? `${stock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isApproved ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {p.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase text-[#1DA1FF] tracking-wider block mb-1">
                      {p.category?.name || 'General'}
                    </span>
                    <h4 className="text-sm font-bold text-[#0A1A44] line-clamp-1">{p.title || p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#0A1A44]">${price.toFixed(2)}</span>
                      {p.discountPrice && (
                        <span className="text-xs text-slate-400 line-through">${p.discountPrice.toFixed(2)}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0A1A44] mb-1">
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">Fill in details to list items on UBS Global store</p>

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B4DFF]/30 focus:border-[#0B4DFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. Sony / Apple"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed specifications, features and warranty info..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="h-20 border-2 border-dashed border-slate-200 hover:border-[#0B4DFF] rounded-xl flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#0B4DFF] transition-colors">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">Add Image</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0B4DFF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#093ecf] flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
