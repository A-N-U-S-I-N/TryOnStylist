import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); 
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', description: '', gender: 'women', category: 'tshirt'
  });
  const [image, setImage] = useState(null);

  const menCategories = ['tshirt', 'shirt', 'hoodie', 'jacket', 'pant'];
  const womenCategories = ['tshirt', 'shirt', 'hoodie', 'jacket', 'tops', 'skirt', 'pant', 'one-piece'];
  
  let activeCategories = womenCategories; 
  if (formData.gender === 'men') activeCategories = menCategories;
  if (formData.gender === 'both') {
    activeCategories = [...new Set([...menCategories, ...womenCategories])];
  }

  useEffect(() => {
    fetchUsers();
  }, [token]);

  async function fetchUsers() {
    try {
      const res = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { console.error("Failed to fetch users"); }
  }

  const handleMakeAdmin = async (userId) => {
    try {
      await axios.put(`/api/admin/make-admin/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast('User promoted to Admin!', 'success');
      fetchUsers(); 
    } catch (err) { showToast('Failed to promote user.', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return showToast("Please upload a product image.", "warning");
    setLoading(true);
    
    const uploadProduct = async (targetGender) => {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'gender') data.append(key, formData[key]);
      });
      
      data.append('gender', targetGender);
      data.append('productImage', image);
      
      return axios.post('/api/admin/products', data, { headers: { Authorization: `Bearer ${token}` } });
    };
    
    try {
      if (formData.gender === 'both') {
        await uploadProduct('men');
        await uploadProduct('women');
      } else {
        await uploadProduct(formData.gender);
      }

      showToast('Product Added Successfully!', 'success');
      setFormData({ name: '', price: '', stock: '', description: '', gender: 'women', category: 'tshirt' });
      setImage(null);
      document.getElementById('imageUpload').value = '';
    } catch (err) { 
      showToast('Failed to upload product.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 min-h-[80vh]">
      <h1 className="mb-10 text-3xl font-extrabold tracking-widest text-center text-black uppercase">Admin Control Panel</h1>
      
      <form onSubmit={handleSubmit} className="p-8 mb-12 space-y-8 bg-white border border-gray-200 rounded-sm shadow-xl lg:p-12">
         <h2 className="pb-4 mb-6 text-xl font-bold tracking-wider uppercase border-b border-gray-200">Add New Product</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Product Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 transition-colors border border-gray-300 outline-none focus:border-black" required />
          </div>
          <div>
             <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Image Upload</label>
             <input type="file" id="imageUpload" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full p-2 border border-gray-300 bg-gray-50" required />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Gender</label>
            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value, category: 'tshirt'})} className="w-full p-3 text-sm uppercase border border-gray-300 outline-none focus:border-black">
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="both">Both (Men & Women)</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 text-sm uppercase border border-gray-300 outline-none focus:border-black">
              {activeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Price (Rs.)</label>
            <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-3 border border-gray-300 outline-none focus:border-black" required />
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Stock Availability</label>
            <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-3 border border-gray-300 outline-none focus:border-black" required />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Product Details / Description</label>
          <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border border-gray-300 outline-none resize-none focus:border-black" required />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            <i className="mr-2 fa-solid fa-cloud-arrow-up"></i> Upload Product to Store
          </Button>
        </div>
      </form>

      <div className="p-8 bg-white border border-gray-200 rounded-sm shadow-xl lg:p-12">
        <h2 className="pb-4 mb-6 text-xl font-bold tracking-wider uppercase border-b border-gray-200">User Management</h2>
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-purple-600 uppercase"><i className="mr-2 fa-solid fa-crown"></i>Current Admins</h3>
            <ul className="space-y-3">
              {users.filter(u => u.role === 'admin').map(admin => (
                <li key={admin._id} className="p-3 text-sm font-medium border border-purple-100 rounded-sm bg-purple-50">
                  {admin.email} <span className="ml-2 text-xs text-gray-500">({admin.name})</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-600 uppercase"><i className="mr-2 fa-solid fa-users"></i>Registered Users</h3>
            <ul className="space-y-3">
              {users.filter(u => u.role === 'user').map(user => (
                <li key={user._id} className="flex items-center justify-between p-3 text-sm border border-gray-200 rounded-sm bg-gray-50">
                  <div>
                    <p className="font-medium text-black">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.name}</p>
                  </div>
                  <button onClick={() => handleMakeAdmin(user._id)} className="px-3 py-1 text-xs font-bold text-white uppercase transition bg-black rounded-sm hover:bg-gray-800">
                    Make Admin
                  </button>
                </li>
              ))}
              {users.filter(u => u.role === 'user').length === 0 && (
                <p className="text-sm text-gray-500">No regular users found.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}