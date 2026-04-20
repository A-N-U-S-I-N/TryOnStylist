import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserStore() {
  const [products, setProducts] = useState([]);
  const [userImage, setUserImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleTryOn = async (product) => {
    if (!userImage) return alert("Please upload your photo first!");
    
    setLoading(true);
    setResultImage(null);

    const formData = new FormData();
    formData.append('userImage', userImage);
    formData.append('productImageUrl', product.imageUrl);
    formData.append('category', product.category);

    try {
      const response = await axios.post('http://localhost:5000/api/try-on', formData);
      setResultImage(response.data.resultImageUrl);
    } catch (err) {
      console.error(err);
      alert("Try-on failed. The AI might be cold-booting or busy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storefront">
      <h2>Upload Your Photo</h2>
      <input type="file" accept="image/*" onChange={e => setUserImage(e.target.files[0])} />

      <h2>Select a Product to Try On</h2>
      <div className="product-grid" style={{ display: 'flex', gap: '20px' }}>
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.imageUrl} alt={product.name} width="150" />
            <h3>{product.name}</h3>
            <button onClick={() => handleTryOn(product)} disabled={loading}>
              {loading ? 'Generating...' : 'Virtual Try-On'}
            </button>
          </div>
        ))}
      </div>

      {resultImage && (
        <div className="result-section">
          <h2>Your Try-On Result!</h2>
          <img src={resultImage} alt="Virtual Try-On Result" width="300" />
        </div>
      )}
    </div>
  );
}