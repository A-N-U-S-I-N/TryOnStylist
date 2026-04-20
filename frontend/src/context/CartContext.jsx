import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('guestCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCartItems(res.data))
      .catch(err => console.error("Error fetching cart", err));
    }
  }, [token]);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotalPrice(total);
    
    if (!token) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      try {
        const res = await axios.post('/api/cart', {
          productId: product._id, quantity
        }, { headers: { Authorization: `Bearer ${token}` } });
        setCartItems(res.data);
        showToast(`${product.name} added to cart!`, "success");
      } catch (err) {
        showToast("Failed to add to cart.", "error");
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.product._id === product._id);
        if (existing) {
          return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...prev, { product, quantity }];
      });
      showToast(`${product.name} added to guest cart!`, "success");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    if (token) {
      try {
        const res = await axios.put(`/api/cart/${productId}`, { quantity }, { headers: { Authorization: `Bearer ${token}` } });
        setCartItems(res.data);
      } catch (err) { console.error(err); }
    } else {
      setCartItems(prev => prev.map(item => item.product._id === productId ? { ...item, quantity } : item));
    }
  };

  const removeItem = async (productId) => {
    if (token) {
      try {
        const res = await axios.delete(`/api/cart/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
        setCartItems(res.data);
      } catch (err) { console.error(err); }
    } else {
      setCartItems(prev => prev.filter(item => item.product._id !== productId));
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await axios.delete('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
        setCartItems([]);
      } catch (err) { console.error(err); }
    } else {
      setCartItems([]);
      localStorage.removeItem('guestCart');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, totalPrice, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}