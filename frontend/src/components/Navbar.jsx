import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react'; 
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    setIsMobileMenuOpen(false); 
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 py-4 text-gray-900 bg-white border-b border-gray-100 shadow-sm lg:py-6">
      <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
        
        <Link to="/" onClick={closeMobileMenu} className="flex items-center transition-opacity hover:opacity-80">
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

        <div className="flex items-center space-x-6 lg:hidden">
          <Link to="/cart" onClick={closeMobileMenu} className="relative text-xs font-bold tracking-widest uppercase transition opacity-80 hover:opacity-100">
            Cart
            {totalCartItems > 0 && (
              <span className="absolute flex items-center justify-center w-4 h-4 text-[10px] text-white bg-black rounded-full -top-2 -right-4">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-2xl transition-opacity focus:outline-none hover:opacity-80"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 w-full px-6 py-6 bg-white border-b border-gray-200 shadow-lg top-full lg:hidden animate-fade-in">
          <div className="flex flex-col space-y-5 text-sm font-bold tracking-widest uppercase">
            <Link to="/" onClick={closeMobileMenu}>Home</Link>
            <Link to="/products" onClick={closeMobileMenu}>Shop</Link>

            {token && (
              <>
                <Link to="/web-tryon" onClick={closeMobileMenu}>Web Try-On</Link>
                <Link to="/regional-styles" onClick={closeMobileMenu}>Regional</Link>
                <Link to="/color-analysis" onClick={closeMobileMenu}>Colors</Link>
                <Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={closeMobileMenu} className="text-purple-600">Admin</Link>
                )}
              </>
            )}

            <Link to="/faq" onClick={closeMobileMenu}>FAQ</Link>
            <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>

            {token ? (
              <button onClick={handleLogout} className="w-full px-3 py-3 mt-2 text-center transition border border-black hover:bg-gray-50">
                Logout
              </button>
            ) : (
              <div className="flex flex-col pt-4 mt-2 space-y-4 border-t border-gray-100">
                <Link to="/login" onClick={closeMobileMenu} className="text-center">Login</Link>
                <Link to="/signup" onClick={closeMobileMenu} className="w-full px-4 py-3 text-center text-white transition duration-300 bg-black border border-black hover:bg-white hover:text-black">
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}