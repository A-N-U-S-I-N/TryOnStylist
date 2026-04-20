import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setOrder(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id, token]);

  if (loading) return <div className="py-20 font-bold tracking-widest text-center uppercase">Generating Receipt...</div>;
  if (!order) return <div className="py-20 font-bold tracking-widest text-center text-red-600 uppercase">Order Not Found</div>;

  return (
    <div className="bg-white rounded-sm shadow-sm p-8 lg:p-12 min-h-[70vh] max-w-4xl mx-auto mt-10 border border-gray-100 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="mb-4 text-4xl font-extrabold tracking-widest text-black uppercase">Order Confirmed</h1>
      <p className="mb-10 text-gray-500">Thank you for shopping with FitAI Studio. Your style is on the way!</p>

      <div className="max-w-2xl p-8 mx-auto text-left border border-gray-200 bg-gray-50">
        <h2 className="pb-2 mb-4 text-xl font-bold tracking-wide text-black uppercase border-b border-gray-300">Order Details</h2>
        <p className="mb-2 text-sm text-gray-600"><span className="font-bold">Order ID:</span> {order._id}</p>
        <p className="mb-6 text-sm text-gray-600"><span className="font-bold">Total Paid:</span> Rs. {order.totalPrice}</p>

        <h3 className="mb-3 font-bold tracking-wide text-black uppercase text-md">Items</h3>
        <ul className="pb-6 mb-6 space-y-2 border-b border-gray-200">
          {order.items.map(item => (
            <li key={item._id} className="flex justify-between text-sm text-gray-700">
              <span className="uppercase">{item.product?.name || "Product"} x {item.quantity}</span>
              <span>Rs. {item.price * item.quantity}</span>
            </li>
          ))}
        </ul>

        <h3 className="mb-3 font-bold tracking-wide text-black uppercase text-md">Shipping To</h3>
        <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
      </div>

      <div className="mt-12">
        <Link to="/">
          <Button variant="secondary" size="lg">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}