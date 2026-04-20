import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function Cart() {
  const { cartItems, totalPrice, clearCart, updateQuantity, removeItem } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!token) {
      showToast("Please log in or sign up to proceed to checkout.", "info");
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="mb-4 text-3xl font-bold tracking-widest uppercase">Your Cart is Empty</h2>
      <Link to="/products"><Button variant="primary">Start Shopping</Button></Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 min-h-[70vh]">
      <h1 className="mb-8 text-3xl font-extrabold tracking-widest text-center text-black uppercase">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {cartItems.map((item) => (
            <div key={item.product._id} className="relative flex items-center gap-6 p-4 border border-gray-200 bg-gray-50">
              <img src={item.product.imageUrl} alt={item.product.name} className="object-contain w-24 h-24 p-2 bg-white border border-gray-100" />
              <div className="flex-grow">
                <Link to={`/product/${item.product._id}`} className="text-lg font-bold tracking-wide uppercase hover:underline">{item.product.name}</Link>
                
                <p className="mt-1 text-sm font-bold text-gray-500">Price: Rs. {item.product.price}</p>
                
                <div className="flex items-center mt-3 bg-white border border-gray-300 w-fit">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                  <span className="px-3 py-1 text-sm border-l border-r border-gray-300">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 text-right">
                <p className="text-lg font-bold">Rs. {item.product.price * item.quantity}</p>
                <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-700">
                  <i className="text-xl fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
          <Button variant="danger" onClick={clearCart} className="mt-4">Clear Cart</Button>
        </div>

        <div className="p-8 border border-gray-200 lg:col-span-1 bg-gray-50 h-fit">
          <h2 className="pb-4 mb-6 text-xl font-bold tracking-wider text-black uppercase border-b border-gray-300">Order Summary</h2>
          
          <div className="flex items-center justify-between mb-4 text-gray-700">
            <span>Subtotal</span>
            <span className="font-bold">Rs. {totalPrice}</span>
          </div>
          <div className="flex items-center justify-between mb-6 text-gray-700">
            <span>Shipping</span>
            <span className="font-bold text-green-600">FREE</span>
          </div>
          
          <div className="flex items-center justify-between pt-4 mb-8 text-xl text-black border-t border-gray-300">
            <span className="font-extrabold tracking-wide uppercase">Grand Total</span>
            <span className="font-extrabold">Rs. {totalPrice}</span>
          </div>
          
          <Button variant="primary" size="lg" className="w-full" onClick={handleCheckoutClick}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}