import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../components/Toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const [colorProfile, setColorProfile] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    if (token) {
      axios.get('/api/color-analysis', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data && res.data.length > 0) {
            setColorProfile(res.data[0]); 
          }
        })
        .catch(err => console.error("Could not fetch color profile"));
    }
  }, [id, token]);

  const handleCheckMatch = async () => {
    if (!colorProfile) return showToast("Please complete your Color Analysis first!", "warning");
    if (!window.EyeDropper) return showToast("Your browser doesn't support the EyeDropper tool.", "error");
    
    showToast("Click on the garment color in the image!", "info");

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const pickedHex = result.sRGBHex;
      
      calculateMatch(pickedHex);
    } catch (e) {  }
  };

  const calculateMatch = (pickedHex) => {
    const hexToRgb = (hex) => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
    const colorDistance = (hex1, hex2) => {
      const [r1, g1, b1] = hexToRgb(hex1);
      const [r2, g2, b2] = hexToRgb(hex2);
      return Math.sqrt(Math.pow(r1-r2,2) + Math.pow(g1-g2,2) + Math.pow(b1-b2,2));
    };

    let minBest = Infinity;
    colorProfile.bestColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if(d < minBest) minBest = d;
    });

    let minAvoid = Infinity;
    colorProfile.avoidColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if(d < minAvoid) minAvoid = d;
    });

    if (minBest < 60) setMatchResult({ title: "Perfect Match! 🌟", text: "This color aligns beautifully with your palette.", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" });
    else if (minAvoid < 60) setMatchResult({ title: "Proceed With Caution ⚠️", text: "This shade is very close to colors that might wash you out.", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" });
    else if (minBest < minAvoid) setMatchResult({ title: "Good Match 👍", text: "A safe, flattering choice for your season.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" });
    else setMatchResult({ title: "Neutral Choice 🤔", text: "This isn't strongly in your best or worst colors. If you love the dress, go for it!", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" });
  };

  if (loading) return <div className="py-20 font-bold tracking-widest text-center uppercase">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 min-h-[70vh]">
      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="relative flex flex-col items-center justify-center p-8 border border-gray-100 lg:w-1/2 bg-gray-50">
          <img id="productImage" src={product.imageUrl} alt={product.name} className="w-full max-h-[600px] object-contain" />
        </div>

        <div className="flex flex-col justify-center lg:w-1/2">
          <p className="mb-2 text-sm tracking-widest text-gray-500 uppercase">{product.gender} • {product.category}</p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-black">{product.name}</h1>
          <p className="mb-2 text-2xl font-bold text-gray-800">Rs. {product.price}</p>
          
          <p className={`text-sm font-bold uppercase tracking-wider mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </p>
          
          <div className="py-6 mb-8 border-t border-b border-gray-200">
            <p className="leading-relaxed text-gray-600">{product.description}</p>
          </div>

          <div className="flex items-center mb-8 space-x-4">
            <label className="text-sm font-bold tracking-wide uppercase">Quantity:</label>
            <input 
              type="number" min="1" max={product.stock} value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              className="w-20 p-2 text-center border border-gray-300 focus:outline-none focus:border-black"
              disabled={product.stock === 0}
            />
          </div>

          {matchResult && (
             <div className={`w-full p-4 mb-6 border ${matchResult.border} ${matchResult.bg} animate-fade-in`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-widest mb-1 ${matchResult.color}`}>{matchResult.title}</h3>
                <p className="text-xs text-gray-700">{matchResult.text}</p>
             </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to={`/try-on/${product._id}`} className="w-full sm:w-1/2">
                <Button variant="primary" size="lg" className="flex items-center justify-center w-full h-full gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Try On Me
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="w-full sm:w-1/2" disabled={product.stock === 0} onClick={() => addToCart(product, quantity)}>
                Add to Cart
              </Button>
            </div>
            
            {colorProfile ? (
               <Button variant="secondary" className="w-full border-dashed" onClick={handleCheckMatch}>
                 <i className="mr-2 fa-solid fa-eye-dropper"></i> Pick color from image to check match
               </Button>
            ) : (
               <Link to="/color-analysis">
                 <Button variant="secondary" className="w-full text-gray-500 border-dashed">
                   <i className="mr-2 fa-solid fa-palette"></i> Find your colors to unlock matching
                 </Button>
               </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}