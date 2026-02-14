import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { authService } from '@/services/api'; 

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. MEMOIZED FETCH: Prevents unnecessary re-renders
  const fetchCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/cart');
      const result = response.data;
      
      // Ensure we are setting an array even if the backend returns null
      setCartItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("🛒 Cart Sync Error:", err.response?.data || err.message);
      // If 401 occurs, the Interceptor handles the refresh; 
      // if it still fails, we clear the cart locally.
      if (err.response?.status === 401) setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. SYNC WITH AUTH STATE
  useEffect(() => {
    fetchCart();
    
    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleAuthChange = () => fetchCart();
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [fetchCart]);

  // 3. ADD TO CART
  const addToCart = async (product) => {
    // Robust ID detection for various data structures
    const productId = product._id || product.id || product.productId;

    if (!productId) {
      console.error("❌ Cart Error: Missing Product ID", product);
      return;
    }

    try {
      const response = await api.post('/cart', { 
        productId, 
        quantity: 1,
        size: product.selectedSize || product.size || null 
      });

      if (response.data.success) {
        await fetchCart(); // Re-sync with server
      }
    } catch (error) {
      console.error("❌ Add to Cart Failed:", error.response?.data);
    }
  };

  // 4. UPDATE QUANTITY
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      // Optimistic Update: Update UI immediately while server syncs
      setCartItems(prev => prev.map(item => 
        item._id === itemId ? { ...item, quantity } : item
      ));
    } catch (err) {
      console.error("❌ Quantity Update Failed:", err);
      fetchCart(); // Rollback to server state on error
    }
  };

  // 5. REMOVE FROM CART
  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      if (response.status === 200) {
        setCartItems(prev => prev.filter(item => item._id !== itemId));
      }
    } catch (err) {
      console.error("❌ Removal Failed:", err);
    }
  };

  // 6. CLEAR CART (Purge)
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
    } catch (err) {
      console.error("❌ Purge Failed:", err);
    }
  };

  // --- CALCULATIONS ---
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const qty = item.quantity || 0;
    return sum + (price * qty);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      loading,
      totalItems,
      totalPrice,
      refreshCart: fetchCart, // Exposed so you can trigger manual refreshes
    }}>
      {children}
    </CartContext.Provider>
  );
};