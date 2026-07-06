'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Navbar } from '../../components/Navbar';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { getProductImageUrl } from '../../lib/image';

export default function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity } = useCart();

  const getProductImage = (img: string) => {
    return getProductImageUrl(img);
  };

  const shippingCost = items.length > 0 ? 15.0 : 0.0;
  const grandTotal = total + shippingCost;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag size={24} className="text-primary" />
            <span>{t('Shopping Cart')}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            {items.length} {t('items in your cart')}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-4 shadow-sm"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img src={getProductImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm truncate">{t(item.name)}</h3>
                      <span className="text-xs font-extrabold text-primary block mt-1">${item.price}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer"
                        title={t('Remove item')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Column */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                  {t('Order Summary')}
                </h3>

                <div className="space-y-2.5 text-xs font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span className="text-slate-700">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Shipping Fee')}</span>
                    <span className="text-slate-700">${shippingCost.toFixed(2)}</span>
                  </div>
                  <hr className="border-slate-50 my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-800">{t('Total Price')}</span>
                    <span className="text-primary font-black">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 mt-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t('Proceed to Checkout')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 text-base">{t('Your cart is empty')}</h3>
              <p className="text-slate-400 text-xs mt-1">{t('Browse products and add items to your cart to checkout.')}</p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{t('Continue Shopping')}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
