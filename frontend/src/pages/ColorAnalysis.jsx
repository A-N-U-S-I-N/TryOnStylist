import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function ColorAnalysis() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [skinColor, setSkinColor] = useState('#e8c39e');
  const [hairColor, setHairColor] = useState('#4a2511');
  const [eyeColor, setEyeColor] = useState('#2e536f');

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('/api/user/latest-image', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.imageUrl) {
            setPreviewUrl(res.data.imageUrl);
            setExistingImage(res.data.imageUrl);
          }
        }).catch(err => console.error(err));
    }
  }, [token]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setExistingImage(null); 
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const getRgbString = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `RGB(${r}, ${g}, ${b})`;
  };

  const handleColorPick = async (setter, fallbackId) => {
    if (!previewUrl) return showToast("Upload your photo first!", "warning");

    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setter(result.sRGBHex);
      } catch (e) {
        
      }
    } else {
       document.getElementById(fallbackId).click();
    }
  };

  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const analyzeColors = () => {
    if (!image) return showToast("Please upload a photo first.", "warning");
    
    const skinHSL = hexToHSL(skinColor);
    const hairHSL = hexToHSL(hairColor);

    const isWarmSkin = skinHSL.h > 20 && skinHSL.h < 50; 
    const isDarkHair = hairHSL.l < 45;

    let season = "Winter";
    let best = [];
    let avoid = [];

    if (!isWarmSkin && isDarkHair) {
      season = "Winter";
      best = ['#000080', '#50C878', '#E0115F', '#FFFFFF', '#000000', '#4B0082']; 
      avoid = ['#DAA520', '#D2691E', '#FF8C00']; 
    } else if (isWarmSkin && !isDarkHair) {
      season = "Spring";
      best = ['#FFDAB9', '#FF7F50', '#40E0D0', '#FFFFF0', '#9ACD32', '#FFA07A']; 
      avoid = ['#000000', '#36454F', '#ADD8E6']; 
    } else if (!isWarmSkin && !isDarkHair) {
      season = "Summer";
      best = ['#B0E0E6', '#E6E6FA', '#FFB6C1', '#F5F5F5', '#87CEFA', '#DDA0DD']; 
      avoid = ['#FFA500', '#000000', '#FFFF00']; 
    } else {
      season = "Autumn";
      best = ['#808000', '#FFDB58', '#E2725B', '#8B4513', '#CD853F', '#556B2F']; 
      avoid = ['#FF1493', '#00FFFF', '#000000']; 
    }

    setResult({ season, bestColors: best, avoidColors: avoid });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const formData = new FormData();
    
    if (!image && existingImage) {
      const response = await fetch(existingImage);
      const blob = await response.blob();
      const defaultFile = new File([blob], "default_face.jpg", { type: "image/jpeg" });
      formData.append('userImage', defaultFile);
    } else {
      formData.append('userImage', image);
    }

    formData.append('season', result.season);
    formData.append('skinTone', hexToHSL(skinColor).h > 20 && hexToHSL(skinColor).h < 50 ? 'Warm' : 'Cool');
    formData.append('hairColor', hexToHSL(hairColor).l < 45 ? 'Dark' : 'Light');
    formData.append('eyeColor', hexToHSL(eyeColor).l < 40 ? 'Dark' : 'Light');
    formData.append('bestColors', JSON.stringify(result.bestColors));
    formData.append('avoidColors', JSON.stringify(result.avoidColors));

    try {
      await axios.post('/api/color-analysis', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Color Profile saved to your Dashboard!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Failed to save profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh]">
      <h1 className="mb-4 text-4xl font-extrabold tracking-widest text-center text-black uppercase">Color Analysis</h1>
      <p className="max-w-2xl mx-auto mb-12 text-center text-gray-500">Upload a photo and use the eyedropper tool to pick your exact skin, hair, and eye colors from the image.</p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col items-center p-8 border border-gray-200 shadow-sm bg-gray-50">
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center w-full mb-6 bg-white border-2 border-gray-300 border-dashed h-80">
              <i className="mb-4 text-4xl text-gray-400 fa-solid fa-camera"></i>
              <label className="px-6 py-2 text-sm font-bold tracking-wider text-white uppercase transition bg-black cursor-pointer hover:bg-gray-800">
                Upload Face Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          ) : (
            <div className="relative w-full mb-6">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-[450px] object-cover border border-gray-300"
              />
              <button onClick={() => {setPreviewUrl(null); setImage(null); setResult(null);}} className="absolute flex items-center justify-center w-8 h-8 text-white bg-red-600 rounded-full shadow-md top-2 right-2 hover:bg-red-700">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}

        </div>

        <div className="flex flex-col">
          <div className="p-8 mb-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="pb-3 mb-6 text-lg font-bold tracking-widest uppercase border-b border-gray-200">Extract Your Colors</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase">Skin Tone</label>
                  <p className="text-[10px] text-gray-500 uppercase">{skinColor}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" id="skinPicker" value={skinColor} onChange={(e)=>setSkinColor(e.target.value)} className="hidden" />
                  <button onClick={() => handleColorPick(setSkinColor, 'skinPicker')} className="flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase transition bg-black hover:bg-gray-800">
                    <i className="fa-solid fa-eye-dropper"></i> Pick
                  </button>
                  <div className="w-8 h-8 border border-gray-300 rounded-full shadow-inner" style={{backgroundColor: skinColor}}></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase">Hair Color</label>
                  <p className="text-[10px] text-gray-500 uppercase">{hairColor}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" id="hairPicker" value={hairColor} onChange={(e)=>setHairColor(e.target.value)} className="hidden" />
                  <button onClick={() => handleColorPick(setHairColor, 'hairPicker')} className="flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase transition bg-black hover:bg-gray-800">
                    <i className="fa-solid fa-eye-dropper"></i> Pick
                  </button>
                  <div className="w-8 h-8 border border-gray-300 rounded-full shadow-inner" style={{backgroundColor: hairColor}}></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase">Eye Color</label>
                  <p className="text-[10px] text-gray-500 uppercase">{eyeColor}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" id="eyePicker" value={eyeColor} onChange={(e)=>setEyeColor(e.target.value)} className="hidden" />
                  <button onClick={() => handleColorPick(setEyeColor, 'eyePicker')} className="flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase transition bg-black hover:bg-gray-800">
                    <i className="fa-solid fa-eye-dropper"></i> Pick
                  </button>
                  <div className="w-8 h-8 border border-gray-300 rounded-full shadow-inner" style={{backgroundColor: eyeColor}}></div>
                </div>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-8" onClick={analyzeColors}>
              <i className="mr-2 fa-solid fa-wand-magic-sparkles"></i> Match My Season
            </Button>
          </div>

          {result && (
            <div className="p-8 text-white bg-gray-900 border border-gray-800 shadow-xl animate-fade-in">
              <h3 className="mb-2 text-2xl font-extrabold tracking-widest text-center text-white uppercase">You are a {result.season}</h3>
              <p className="mb-8 text-xs tracking-widest text-center text-gray-400 uppercase">Hover over colors to see RGB values</p>
              
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold tracking-widest uppercase"><i className="mr-2 text-green-400 fa-solid fa-check-circle"></i> Your Best Colors</p>
                <div className="flex h-12 gap-2">
                  {result.bestColors.map(color => (
                    <div key={color} className="flex-1 transition rounded-sm shadow-inner hover:-translate-y-1 cursor-help" style={{ backgroundColor: color }} title={`${color.toUpperCase()} | ${getRgbString(color)}`}></div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-xs font-bold tracking-widest uppercase"><i className="mr-2 text-red-400 fa-solid fa-times-circle"></i> Colors to Avoid</p>
                <div className="flex h-8 gap-2">
                  {result.avoidColors.map(color => (
                    <div key={color} className="flex-1 transition rounded-sm shadow-inner opacity-40 hover:-translate-y-1 hover:opacity-100 cursor-help" style={{ backgroundColor: color }} title={`${color.toUpperCase()} | ${getRgbString(color)}`}></div>
                  ))}
                </div>
              </div>

              <Button variant="secondary" className="w-full text-black bg-white border-none hover:bg-gray-200" onClick={handleSaveProfile} loading={loading}>
                Save to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}