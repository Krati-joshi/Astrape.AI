import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt?: string;
  product?: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const fetchCart = async () => {
    if (!state.user || !state.token) return;
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      setCart(data);
      localStorage.setItem('cart', JSON.stringify(data));
    } catch (err: any) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user && state.token) fetchCart();
  }, [state.user]);

  const addToCart = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      if (state.user && state.token) {
        await axios.post('http://localhost:3001/api/cart', { productId, quantity }, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        await fetchCart();
        toast.success('Added to cart successfully');
      } else {
        const existing = cart.find(i => i.productId === productId);
        if (existing) existing.quantity += quantity;
        else {
          const res = await axios.get('http://localhost:3001/api/products');
          const product = res.data.find((p: any) => p._id === productId);
          if (product) cart.push({ productId, quantity, product });
        }
        setCart([...cart]);
        toast.success('Added to cart successfully');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.error || 'Network or server error while adding to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setLoading(true);
    try {
      if (state.user && state.token) {
        await axios.patch(`http://localhost:3001/api/cart/${productId}`, { quantity }, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        await fetchCart();
      } else {
        setCart(cart.map(i => i.productId === productId ? { ...i, quantity } : i));
      }
      toast.success('Cart updated successfully');
    } catch (err: any) {
      console.error('Error updating cart:', err);
      toast.error(err.response?.data?.error || 'Network or server error while updating cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setLoading(true);
    try {
      if (state.user && state.token) {
        await axios.delete(`http://localhost:3001/api/cart/${productId}`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        await fetchCart();
      } else {
        setCart(cart.filter(i => i.productId !== productId));
      }
      toast.success('Removed from cart successfully');
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      toast.error(err.response?.data?.error || 'Network or server error while removing item');
    } finally {
      setLoading(false);
    }
  };

 const clearCart = async () => {
  setLoading(true);
  try {
    if (state.user && state.token) {
      await axios.delete('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
    }
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared successfully');
  } catch (err: any) {
    console.error('Error clearing cart:', err);
    toast.error(err.response?.data?.error || 'Network or server error while clearing cart');
  } finally {
    setLoading(false);
  }
};


  const getCartTotal = () => cart.reduce((total, i) => total + ((i.product?.price || 0) * i.quantity), 0);
  const getCartItemsCount = () => cart.reduce((total, i) => total + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart, getCartTotal, getCartItemsCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
