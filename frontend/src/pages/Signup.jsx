import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return showToast("Passwords do not match.", "warning");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {
        showToast("Registration failed. Try a different email.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-white pt-12 pb-20">
      <div className="w-full max-w-md p-6 mx-4 bg-white border border-gray-100 rounded-lg shadow-xl sm:p-8">
        <h1 className="mb-8 text-4xl font-extrabold tracking-widest text-center text-gray-900 uppercase">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-12 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 hover:text-black">
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 pr-12 leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:ring-2 focus:ring-black" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 hover:text-black">
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-8" loading={loading}>
            Create Account
          </Button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-black hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}