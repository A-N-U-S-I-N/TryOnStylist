import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function WebTryOn() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const [url, setUrl] = useState(location.state?.url || searchParams.get('url') || ''); const [extracting, setExtracting] = useState(false);
  const [extractedImageUrl, setExtractedImageUrl] = useState(location.state?.imageUrl || null);

  const [userImage, setUserImage] = useState(null);
  const [existingUserImage, setExistingUserImage] = useState(null);
  const [userPreview, setUserPreview] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [colorProfile, setColorProfile] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('/api/color-analysis', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data && res.data.length > 0) setColorProfile(res.data[0]);
        }).catch(err => console.error(err));

      axios.get('/api/user/latest-image', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.imageUrl) {
            setUserPreview(res.data.imageUrl);
            setExistingUserImage(res.data.imageUrl);
          }
        }).catch(err => console.error(err));
    }
  }, [token]);

  const handleExtract = async () => {
    if (!url) return showToast('Please paste a product link first.', 'warning');
    if (!url.startsWith('http')) return showToast('Please enter a valid URL starting with http:// or https://', 'warning');

    setExtracting(true);
    try {
      const res = await axios.post('/api/extract-image', { url }, { headers: { Authorization: `Bearer ${token}` } });
      setExtractedImageUrl(res.data.imageUrl);
      setMatchResult(null);
      showToast('Product image extracted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to extract image. The site may be blocking access.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const handleCheckMatch = async () => {
    if (!colorProfile) return showToast("Please complete your Color Analysis first!", "warning");
    if (!window.EyeDropper) return showToast("Your browser doesn't support the EyeDropper tool.", "error");

    showToast("Click on the garment color in the image!", "info");

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      calculateMatch(result.sRGBHex);
    } catch (e) { }
  };

  const calculateMatch = (pickedHex) => {
    const hexToRgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const colorDistance = (hex1, hex2) => {
      const [r1, g1, b1] = hexToRgb(hex1);
      const [r2, g2, b2] = hexToRgb(hex2);
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    };

    let minBest = Infinity;
    colorProfile.bestColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if (d < minBest) minBest = d;
    });

    let minAvoid = Infinity;
    colorProfile.avoidColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if (d < minAvoid) minAvoid = d;
    });

    if (minBest < 60) setMatchResult({ title: "Perfect Match! 🌟", text: "Beautifully aligns with your palette.", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" });
    else if (minAvoid < 60) setMatchResult({ title: "Proceed With Caution ⚠️", text: "This shade might wash you out.", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" });
    else if (minBest < minAvoid) setMatchResult({ title: "Good Match 👍", text: "A safe, flattering choice.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" });
    else setMatchResult({ title: "Neutral Choice 🤔", text: "Not your best or worst. Go for it if you love it!", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" });
  };

  const handleUserImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setExistingUserImage(null);
      setUserPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if ((!userImage && !existingUserImage) || !extractedImageUrl) return showToast('Missing image data.', 'error');
    setGenerating(true);

    const formData = new FormData();
    if (userImage) formData.append('userImage', userImage);
    if (existingUserImage) formData.append('existingUserImageUrl', existingUserImage);
    formData.append('productImageUrl', extractedImageUrl);
    formData.append('category', 'tops');
    formData.append('externalLink', url);

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
        showToast('Generation complete! Saved to your fits.', 'success');
        navigate('/dashboard');
        break;
      } catch (err) {
        console.error(`Model ${i} failed. Trying next...`);
      }
    }

    if (!success) {
      showToast('All AI servers are currently busy or at quota. Please try again later.', 'error');
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh]">
      <h1 className="mb-4 text-4xl font-extrabold tracking-widest text-center text-black uppercase">Web Try-On</h1>
      <p className="max-w-2xl mx-auto mb-12 text-center text-gray-500">Paste a link from your favorite store, extract the garment, and see how it looks on you.</p>

      <div className="p-6 mb-12 text-sm text-gray-600 border border-gray-200 shadow-sm bg-gray-50">
        <h3 className="mb-3 font-bold tracking-widest text-black uppercase"><i className="mr-2 fa-solid fa-circle-info"></i>How to get the link</h3>
        <ul className="pl-5 space-y-2 list-disc">
          <li><strong>From a Browser:</strong> Go to the product page (e.g., Myntra, Zara) and copy the URL from the address bar at the top of your screen.</li>
          <li><strong>From an App:</strong> Tap the "Share" icon on the product page and select "Copy Link".</li>
          <li><em>Note:</em> Some highly secured sites may block automatic extraction. If extraction fails, try finding the product on a different site.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col space-y-6">
          <div className="p-8 bg-white border border-gray-200 shadow-sm">
            <h3 className="pb-3 mb-6 text-lg font-bold tracking-widest uppercase border-b border-gray-200">1. Fetch Product</h3>
            <label className="block mb-2 text-xs font-bold tracking-wide uppercase">Paste Product Link Here</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://www.myntra.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-3 transition-colors border border-gray-300 outline-none focus:border-black"
                disabled={extracting || extractedImageUrl}
              />
              {!extractedImageUrl && (
                <Button variant="primary" onClick={handleExtract} loading={extracting} className="whitespace-nowrap">
                  Extract Image
                </Button>
              )}
            </div>

            {extractedImageUrl && (
              <div className="flex flex-col items-center mt-6 animate-fade-in">
                <p className="mb-2 text-xs font-bold tracking-widest text-green-600 uppercase"><i className="mr-1 fa-solid fa-check"></i> Image Extracted</p>
                <img src={extractedImageUrl} alt="Extracted Product" className="object-contain w-full h-64 p-2 border border-gray-200 bg-gray-50" />

                {colorProfile ? (
                  <Button variant="secondary" className="w-full mt-4 text-xs border-dashed" onClick={handleCheckMatch}>
                    <i className="mr-2 fa-solid fa-eye-dropper"></i> Click to pick color and check match
                  </Button>
                ) : (
                  <Link to="/color-analysis" className="w-full mt-4">
                    <Button variant="secondary" className="w-full text-xs text-gray-500 border-dashed">
                      <i className="mr-2 fa-solid fa-palette"></i> Find your colors to unlock matching
                    </Button>
                  </Link>
                )}

                {matchResult && (
                  <div className={`w-full mt-4 p-4 border ${matchResult.border} ${matchResult.bg} animate-fade-in text-center`}>
                    <h3 className={`text-sm font-extrabold uppercase tracking-widest mb-1 ${matchResult.color}`}>{matchResult.title}</h3>
                    <p className="text-xs text-gray-700">{matchResult.text}</p>
                  </div>
                )}

                <button onClick={() => { setExtractedImageUrl(null); setUrl(''); setMatchResult(null); }} className="mt-6 text-xs font-bold tracking-wider text-red-500 uppercase hover:underline">
                  Clear & Try Another Link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className={`bg-white p-8 border border-gray-200 shadow-sm transition-opacity duration-300 ${extractedImageUrl ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h3 className="pb-3 mb-6 text-lg font-bold tracking-widest uppercase border-b border-gray-200">2. Generate Fit</h3>

            <label className="block mb-2 text-xs font-bold tracking-wide uppercase">Your Photo</label>
            {!userPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 mb-6 transition border-2 border-gray-300 border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100 group">
                <i className="mb-3 text-4xl text-gray-400 transition-transform duration-300 fa-solid fa-cloud-arrow-up group-hover:-translate-y-1 group-hover:text-black"></i>
                <span className="text-sm font-bold tracking-widest text-gray-400 uppercase transition-colors duration-300 group-hover:text-black">Click to Upload Photo</span>
                <p className="mt-1 text-xs text-gray-400">Max size 5MB</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleUserImageUpload} />
              </label>
            ) : (
              <div className="relative mb-6 group">
                <p className="absolute z-10 hidden px-2 py-1 text-[10px] font-bold text-white uppercase transform -translate-x-1/2 bg-black rounded shadow-md top-2 left-1/2 group-hover:block">Your Photo</p>

                <img src={userPreview} alt="User" className="object-contain w-full h-48 p-2 border border-gray-200 bg-gray-50" />

                <button onClick={() => { setUserPreview(null); setUserImage(null); setExistingUserImage(null); }} className="absolute flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-500 rounded-full shadow-md top-2 right-2 hover:bg-red-700">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            )}

            <Button variant="primary" className="w-full" size="lg" onClick={handleGenerate} loading={generating} disabled={!userImage}>
              <i className="mr-2 fa-solid fa-wand-magic-sparkles"></i> Try It On
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}