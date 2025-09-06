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

  const fetchCart = async () => {
    if (!state.user || !state.token) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && !state.user) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (state.user && state.token) {
      fetchCart();
    } else if (!state.user) {
     
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [state.user, state.token]);


  useEffect(() => {
    if (!state.user && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, state.user]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!state.user || !state.token) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/cart', { productId, quantity }, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      
      toast.success(response.data.message || 'Added to cart successfully');
      await fetchCart(); 
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to add item to cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!state.user || !state.token) {
      toast.error('Please login to update cart');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`http://localhost:3001/api/cart/${productId}`, { quantity }, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      
      toast.success(response.data.message || 'Cart updated successfully');
      await fetchCart(); 
    } catch (err) {
      console.error('Error updating cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!state.user || !state.token) {
      toast.error('Please login to remove items from cart');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:3001/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      
      toast.success(response.data.message || 'Removed from cart successfully');
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to remove item from cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!state.user || !state.token) {
      setCart([]);
      localStorage.removeItem('cart');
      toast.success('Cart cleared');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      
      setCart([]);
      toast.success(response.data.message || 'Cart cleared successfully');
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to clear cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    if (!state.user) {
      localStorage.removeItem('cart');
    }
  }, [state.user]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading,
      addToCart, 
      updateCartItem, 
      removeFromCart, 
      clearCart,
      fetchCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
