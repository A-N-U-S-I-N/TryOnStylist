import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      showToast("Login failed. Check your email and password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <div className="w-full max-w-md p-6 mx-4 bg-white border border-gray-100 rounded-lg shadow-xl sm:p-8">
        <h1 className="mb-6 text-4xl font-extrabold tracking-widest text-center text-gray-900 uppercase">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 text-gray-600 top-7">
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="font-semibold text-black hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}