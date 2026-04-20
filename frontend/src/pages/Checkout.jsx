import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '', city: '', postalCode: '', country: ''
  });

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return showToast("Please fill in all shipping details before paying.", "warning");
    }

    if (cartItems.length === 0) return;
    setLoading(true);

    const formattedItems = cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    try {
      const res = await axios.post('/api/orders', {
        shippingAddress,
        items: formattedItems,
        totalPrice
      }, { headers: { Authorization: `Bearer ${token}` } });

      await clearCart(); 
      navigate(`/order-confirmation/${res.data._id}`); 
      
    } catch (error) {
      showToast("Failed to place order. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-8 lg:p-12 min-h-[80vh] max-w-6xl mx-auto mt-10 border border-gray-100">
      <h1 className="mb-12 text-4xl font-extrabold tracking-widest text-center text-black uppercase">Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h2 className="pb-3 mb-6 text-xl font-bold tracking-wider text-gray-800 uppercase border-b">Shipping Info</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Address</label>
              <input type="text" name="address" value={shippingAddress.address} onChange={handleChange} className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">City</label>
                <input type="text" name="city" value={shippingAddress.city} onChange={handleChange} className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black" required />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Postal Code</label>
                <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black" required />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Country</label>
              <input type="text" name="country" value={shippingAddress.country} onChange={handleChange} className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black" required />
            </div>
          </form>
        </div>

        <div className="p-8 border border-gray-200 bg-gray-50 h-fit">
          <h2 className="pb-4 mb-6 text-xl font-bold tracking-wider text-black uppercase border-b border-gray-300">Order Summary</h2>
          <div className="mb-6 space-y-4">
            {cartItems.map(item => (
              <div key={item.product._id} className="flex justify-between text-sm text-gray-600">
                <span className="uppercase">{item.product.name} x {item.quantity}</span>
                <span>Rs. {item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 mb-8 text-xl text-black border-t border-gray-300">
            <span className="font-extrabold tracking-wide uppercase">Grand Total</span>
            <span className="font-extrabold">Rs. {totalPrice}</span>
          </div>
          <Button onClick={handleSubmit} variant="primary" size="lg" className="w-full" loading={loading}>
            Confirm & Pay
          </Button>
        </div>
      </div>
    </div>
  );
}