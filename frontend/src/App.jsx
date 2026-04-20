import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import axios from 'axios'; 
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

import { AuthContext } from './context/AuthContext';import { CartProvider } from './context/CartContext'; 

import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import Home from './pages/Home';
import Chatbot from './components/Chatbot';
import { ToastContainer } from './components/Toast';
import Shop from './pages/Shop';
import WebTryOn from './pages/WebTryOn';
import Signup from './pages/Signup';
import RegionalStyles from './pages/RegionalStyles';
import Checkout from './pages/Checkout';
import ColorAnalysis from './pages/ColorAnalysis';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TryOn from './pages/TryOn';
import Contact from './pages/Contact'; 
import ProductDetail from './pages/ProductDetail'; 
import Cart from './pages/Cart'; 
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { token, user } = useContext(AuthContext); 
  if (!token) return <Navigate to="/login" />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" />; 
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop/>
      <CartProvider>
        <div className="flex flex-col min-h-screen font-sans antialiased text-gray-900 bg-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} /> 
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              <Route path="/cart" element={<Cart />} />
              <Route path="/web-tryon" element={<ProtectedRoute><WebTryOn /></ProtectedRoute>} />
              <Route path="/regional-styles" element={<ProtectedRoute><RegionalStyles /></ProtectedRoute>} />
              <Route path="/color-analysis" element={<ProtectedRoute><ColorAnalysis /></ProtectedRoute>} />
              <Route path="/products" element={<Shop />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/try-on/:id" element={<ProtectedRoute><TryOn /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
          <ToastContainer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}