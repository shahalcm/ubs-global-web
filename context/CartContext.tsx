'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  sellerId: string;
  sellerName?: string;
  quantity: number;
  shippingFee?: number;
  freeShipping?: boolean;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addToCart: (
    product: {
      _id: string;
      title: string;
      images: string[];
      price: number;
      sellerId?: any;
      shippingFee?: number;
      freeShipping?: boolean;
    },
    quantity?: number
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          // Sanitize sellerId in stored cart items if any was stored as [object Object]
          const sanitized = (parsed || []).map((item: any) => {
            let sId = item.sellerId;
            if (typeof sId === 'object' && sId !== null) {
              sId = sId._id || sId.id || '';
            } else if (typeof sId === 'string' && sId.includes('[object')) {
              sId = '';
            }
            return {
              ...item,
              sellerId: String(sId || ''),
            };
          });
          setItems(sanitized);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, []);

  const saveCart = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  const addToCart = (
    product: {
      _id: string;
      title: string;
      images: string[];
      price: number;
      sellerId?: any;
      shippingFee?: number;
      freeShipping?: boolean;
    },
    quantity = 1
  ) => {
    const existing = items.find((i) => i.productId === product._id);
    let newItems: CartItem[];

    const rawSeller = product.sellerId;
    let sId = '';
    let sName = '';

    if (typeof rawSeller === 'object' && rawSeller !== null) {
      sId = String(rawSeller._id || rawSeller.id || '');
      sName = String(rawSeller.shopName || rawSeller.ownerName || '');
    } else if (typeof rawSeller === 'string') {
      sId = rawSeller.includes('[object') ? '' : rawSeller;
    }

    if (existing) {
      newItems = items.map((i) =>
        i.productId === product._id
          ? {
              ...i,
              quantity: i.quantity + quantity,
              sellerId: i.sellerId || sId,
              sellerName: i.sellerName || sName,
            }
          : i
      );
    } else {
      newItems = [
        ...items,
        {
          productId: product._id,
          name: product.title,
          image: product.images?.[0] || '',
          price: product.price,
          sellerId: sId,
          sellerName: sName,
          shippingFee: product.shippingFee,
          freeShipping: product.freeShipping,
          quantity,
        },
      ];
    }

    setItems(newItems);
    saveCart(newItems);
  };

  const removeFromCart = (productId: string) => {
    const newItems = items.filter((i) => i.productId !== productId);
    setItems(newItems);
    saveCart(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newItems = items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    setItems(newItems);
    saveCart(newItems);
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
