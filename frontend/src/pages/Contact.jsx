import { useState } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import Button from '../components/Button';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/contact', { name, email, message });
      showToast("Your message has been sent!", "success");
      setName(''); setEmail(''); setMessage('');
    } catch (error) {
        showToast("Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-8 lg:p-12 min-h-[80vh] max-w-5xl mx-auto mt-10 border border-gray-100">
      <h1 className="mb-4 text-3xl font-extrabold tracking-widest text-center text-black uppercase">Contact Us</h1>
      <p className="mb-12 text-center text-gray-500">Have a question or feedback? We'd love to hear from you.</p>

      <div className="grid items-start grid-cols-1 gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 transition-colors border border-gray-300 focus:outline-none focus:border-black" required />
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Your Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 transition-colors border border-gray-300 focus:outline-none focus:border-black" required />
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Message</label>
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 transition-colors border border-gray-300 focus:outline-none focus:border-black" required />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Send Message
          </Button>
        </form>

        <div className="p-8 border border-gray-200 bg-gray-50">
          <h3 className="mb-6 text-xl font-bold tracking-wider text-black uppercase">Our Information</h3>
          <div className="space-y-4 text-gray-600">
          <p className="flex items-center"><span className="w-8 font-bold text-black">📍</span> Devprayagam Colony, Jhalwa, Prayagraj, Mubarkpur Kotwa, Uttar Pradesh 211015</p>
          <p className="flex items-center"><span className="w-8 font-bold text-black">📞</span> 081271 00101</p>
          <p className="flex items-center"><span className="w-8 font-bold text-black">✉️</span> support@siet.in</p>
        </div>
        </div>
      </div>
    </div>
  );
}