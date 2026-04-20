import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast("Please enter a valid email address.", "warning");
    
    try {
      await axios.post('/api/subscribe', { email });
      showToast("Thank you for subscribing!", "success");
      setEmail('');
    } catch (error) {
        showToast("You are already subscribed to our newsletter.", "info");
    }
  };

  return (
    <footer className="mt-20 text-gray-700 bg-white border-t border-gray-200">
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          
        <div className="md:w-1/3">
            <Link to="/" className="inline-block mb-4 transition-opacity hover:opacity-80">
              <img src="/full-logo.png" alt="TryOnStylist Logo" className="object-contain w-auto h-10" />
            </Link>
            <p className="text-sm text-gray-600">Modern fashion — powered by AI.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex max-w-sm mt-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-l-sm focus:outline-none focus:border-black"
                required
              />
              <button type="submit" className="px-4 py-2 text-sm tracking-wide text-white uppercase transition-opacity bg-black hover:opacity-90">
                Subscribe
              </button>
            </form>
          </div>

          <div className="flex justify-between md:w-1/3">
            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="transition-colors hover:text-black">Store</Link></li>
                <li><Link to="/dashboard" className="transition-colors hover:text-black">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="transition-colors hover:text-black">FAQ</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-black">Contact Us</Link></li>
              </ul>
            </div>
          </div>

        </div>
        <div className="pt-6 mt-12 text-sm text-center text-gray-400 border-t border-gray-100">
          <p>&copy; {new Date().getFullYear()} TryOnStylist Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}