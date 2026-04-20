import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 py-6 text-gray-900 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
        <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
          <img src="/full-logo.png" alt="TryOnStylist Logo" className="object-contain w-auto h-8 sm:h-10" />
        </Link>

        <div className="items-center hidden space-x-5 text-xs font-bold tracking-widest uppercase lg:flex">
          <Link to="/" className="transition opacity-80 hover:opacity-100">Home</Link>
          <Link to="/products" className="transition opacity-80 hover:opacity-100">Shop</Link>

          {token && (
            <>
              <Link to="/web-tryon" className="transition opacity-80 hover:opacity-100">Web Try-On</Link>
              <Link to="/regional-styles" className="transition opacity-80 hover:opacity-100">Regional</Link>
              <Link to="/color-analysis" className="transition opacity-80 hover:opacity-100">Colors</Link>
              <Link to="/dashboard" className="transition opacity-80 hover:opacity-100">Dashboard</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-purple-600 transition hover:text-purple-800">Admin</Link>
              )}
            </>
          )}

          <Link to="/cart" className="relative transition opacity-80 hover:opacity-100">
            Cart
            {totalCartItems > 0 && (
              <span className="absolute flex items-center justify-center w-4 h-4 text-[10px] text-white bg-black rounded-full -top-2 -right-3">
                {totalCartItems}
              </span>
            )}
          </Link>
          <Link to="/faq" className="transition opacity-80 hover:opacity-100">FAQ</Link>
          <Link to="/contact" className="transition opacity-80 hover:opacity-100">Contact</Link>

          {token ? (
            <button onClick={handleLogout} className="px-3 py-2 transition border border-black hover:bg-gray-50">
              Logout
            </button>
          ) : (
            <div className="flex items-center pl-4 space-x-3 border-l border-gray-200">
              <Link to="/login" className="transition opacity-80 hover:opacity-100">Login</Link>
              <Link to="/signup" className="px-4 py-2 text-white transition duration-300 bg-black border border-black hover:bg-white hover:text-black">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}