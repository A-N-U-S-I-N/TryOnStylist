import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { showToast } from '../components/Toast';
import Button from '../components/Button';

export default function TryOn() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(res => setProduct(res.data));
    
    if (token) {
      axios.get('/api/user/latest-image', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.imageUrl) {
            setPreviewUrl(res.data.imageUrl);
            setExistingImage(res.data.imageUrl);
          }
        }).catch(err => console.error(err));
    }
  }, [id, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("File too large! Maximum size is 5MB.", "warning");
      setImage(file);
      setExistingImage(null); 
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTryOn = async () => {
    if (!image && !existingImage) return showToast("Please upload your photo first.", "warning");
    setLoading(true);

    const formData = new FormData();
    if (image) formData.append('userImage', image);
    if (existingImage) formData.append('existingUserImageUrl', existingImage);
    formData.append('productId', product._id);
    formData.append('productImageUrl', product.imageUrl);
    formData.append('category', product.category);

    let success = false;
    const TOTAL_MODELS = 5; 

    for (let i = 0; i < TOTAL_MODELS; i++) {
      if (i > 0) {
        showToast(`Server busy. Switching to AI Model ${i + 1}... please wait.`, 'info');
      }
      
      formData.set('modelIndex', i);

      try {
        await axios.post('/api/try-on', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        success = true;
        showToast("AI Fit Generated successfully!", "success");
        navigate('/dashboard');
        break; 
      } catch (err) {
        console.error(`Model ${i} failed. Trying next...`);
      }
    }

    if (!success) {
      showToast("All AI servers are currently busy or at quota. Please try again later.", "error");
    }
    setLoading(false);
  };

  if (!product) return <div className="mt-20 font-bold text-center uppercase">Loading Product...</div>;

  return (
    <div className="max-w-6xl px-4 py-12 mx-auto sm:px-6">
      <h1 className="mb-12 text-3xl font-extrabold tracking-widest text-center text-gray-900 uppercase">Virtual Try-On</h1>

      <div className="grid grid-cols-1 gap-12 mb-12 lg:grid-cols-2">
        <div className="flex flex-col items-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">The Garment</h2>
          <div className="w-full bg-gray-50 p-4 border border-gray-200 flex items-center justify-center h-[500px]">
            <img src={product.imageUrl} alt={product.name} className="object-contain max-h-full" />
          </div>
          <p className="mt-4 text-lg font-bold">{product.name}</p>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">Your Photo</h2>
          <div className="w-full bg-gray-50 p-4 border border-gray-200 flex flex-col items-center justify-center h-[500px] relative group">
          {previewUrl ? (
              <img src={previewUrl} alt="You" className="object-contain max-h-full" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 transition-colors duration-300 group-hover:text-black">
                <i className="mb-3 text-4xl transition-transform duration-300 fa-solid fa-cloud-arrow-up group-hover:-translate-y-1"></i>
                <p className="text-sm font-bold tracking-widest uppercase">Click to Upload Photo</p>
                <p className="mt-1 text-xs text-gray-400">Max size 5MB</p>
              </div>
            )}
            
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <p className="mt-4 text-sm text-gray-500">Tap the box to change image</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleTryOn} variant="primary" size="lg" loading={loading} className="w-full max-w-md">
          Generate AI Fit
        </Button>
      </div>
    </div>
  );
}