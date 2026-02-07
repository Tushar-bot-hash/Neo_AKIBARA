import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for Auth Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // 1. Fixed Fetch Logic: Backend uses 'data', not 'items'
  const fetchCart = async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/cart', { headers: getHeaders() });
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setCartItems(result.data);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Uplink Failure:", err);
      setCartItems([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Persistent Add: Saves to MongoDB first
  const addToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          productId: product._id || product.id, 
          quantity: 1 
        })
      });

      if (!response.ok) throw new Error("Sync failed");
      
      // Refresh local state from DB
      await fetchCart();
    } catch (error) {
      console.error("Cart sync error:", error);
    }
  };

  // 3. Database-linked Update: Uses MongoDB _id
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
      });
      if (response.ok) await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  // 4. Database-linked Remove
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        setCartItems(prev => prev.filter(item => item._id !== itemId));
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const clearCart = async () => {
    try {
      await fetch('http://localhost:5000/api/cart', { method: 'DELETE', headers: getHeaders() });
      setCartItems([]);
    } catch (err) {
      console.error("Purge failed:", err);
    }
  };

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    if (result.user) {
      setUser(result.user);
      await fetchCart();
    }
    return { success: !!result.user, ...result };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCartItems([]);
  };

  // 5. Calculations using Populated Data
  const totalItems = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  const totalPrice = (cartItems || []).reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const qty = item.quantity || 0;
    return sum + (price * qty);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems: cartItems || [],
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      user,
      loading,
      login,
      logout,
      totalItems,
      totalPrice,
      isAuthenticated: authService.isAuthenticated(),
    }}>
      {children}
    </CartContext.Provider>
  );
};