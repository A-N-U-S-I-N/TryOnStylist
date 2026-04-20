import { useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tops');
  const [image, setImage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('productImage', image);

    try {
      await axios.post('http://localhost:5000/api/admin/products', formData);
      alert('Product uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin: Upload Product</h2>
      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Product Name" onChange={e => setName(e.target.value)} required />
        
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="one-pieces">One-Pieces</option>
        </select>
        
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} required />
        <button type="submit">Upload to Store</button>
      </form>
    </div>
  );
}