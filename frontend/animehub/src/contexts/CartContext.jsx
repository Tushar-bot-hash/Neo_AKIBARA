import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authService } from '@/services/api'; 

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

  const fetchCart = async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/cart');
      const result = response.data;
      
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

  // UPDATED: Now accepts 'size' from the product object
 const addToCart = async (product) => {
  // Add this log to see what is actually happening
  console.log("Attempting to add product:", product);

  const idToSend = product._id || product.id || product.productId;

  if (!idToSend) {
    console.error("ERROR: No ID found for this product!");
    return;
  }

  try {
    const response = await api.post('/cart', { 
      productId: idToSend, // Ensure this matches your controller's req.body.productId
      quantity: 1,
      size: product.size || null 
    });

    if (response.status === 200 || response.status === 201) {
      await fetchCart();
    }
  } catch (error) {
    // This will tell you if the error is 404 (Path) or 404 (Controller)
    console.error("Cart sync error details:", error.response?.data);
  }
};

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      if (response.status === 200) {
        // Optimistic local update before/after sync
        setCartItems(prev => prev.filter(item => item._id !== itemId));
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
    } catch (err) {
      console.error("Purge failed:", err);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCartItems([]);
  };

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
      logout,
      totalItems,
      totalPrice,
      isAuthenticated: authService.isAuthenticated(),
    }}>
      {children}
    </CartContext.Provider>
  );
};