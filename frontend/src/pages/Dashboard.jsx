import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../components/Toast';

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [colorProfiles, setColorProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFit, setSelectedFit] = useState(null);
  const [selectedColorProfile, setSelectedColorProfile] = useState(null);

  const [matchModalProfile, setMatchModalProfile] = useState(null);
  const [matchUrlInput, setMatchUrlInput] = useState('');
  const [matchImageUrl, setMatchImageUrl] = useState(null);
  const [extractingMatch, setExtractingMatch] = useState(false);
  const [pickedGarmentColor, setPickedGarmentColor] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, colorRes] = await Promise.all([
          axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/color-analysis', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setHistory(histRes.data);
        setColorProfiles(colorRes.data);
      } catch (err) {
        showToast('Failed to load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tryonstylist.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Download started!', 'success');
    } catch (error) { window.open(imageUrl, '_blank'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fit?")) return;
    try {
      await axios.delete(`/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prevHistory => prevHistory.filter(item => item._id !== id));
      showToast("Fit deleted successfully!", "success");
    } catch (err) {
      showToast("Failed to delete.", "error");
    }
  };

  const getRgbString = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `RGB(${r}, ${g}, ${b})`;
  };

  const handleExtractMatchImage = async () => {
    if (!matchUrlInput) return showToast('Please paste a product link.', 'warning');
    setExtractingMatch(true);
    try {
      const res = await axios.post('/api/extract-image', { url: matchUrlInput }, { headers: { Authorization: `Bearer ${token}` } });
      setMatchImageUrl(res.data.imageUrl);
      setPickedGarmentColor(null); setMatchResult(null);
    } catch (err) { showToast('Failed to extract image. Try uploading instead.', 'error'); }
    finally { setExtractingMatch(false); }
  };

  const handleMatchImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMatchImageUrl(URL.createObjectURL(file));
      setPickedGarmentColor(null); setMatchResult(null);
    }
  };

  const handlePickGarmentColor = async () => {
    if (!window.EyeDropper) return showToast("Your browser doesn't support the EyeDropper tool.", "error");
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const pickedHex = result.sRGBHex;
      setPickedGarmentColor(pickedHex);
      calculateMatch(pickedHex);
    } catch (e) {  }
  };

  const calculateMatch = (pickedHex) => {
    const hexToRgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const colorDistance = (hex1, hex2) => {
      const [r1, g1, b1] = hexToRgb(hex1);
      const [r2, g2, b2] = hexToRgb(hex2);
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    };

    let minBest = Infinity;
    matchModalProfile.bestColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if (d < minBest) minBest = d;
    });

    let minAvoid = Infinity;
    matchModalProfile.avoidColors.forEach(c => {
      const d = colorDistance(pickedHex, c);
      if (d < minAvoid) minAvoid = d;
    });

    if (minBest < 60) setMatchResult({ title: "Perfect Match! 🌟", text: "This color aligns beautifully with your palette.", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" });
    else if (minAvoid < 60) setMatchResult({ title: "Proceed With Caution ⚠️", text: "This shade is very close to colors that might wash you out.", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" });
    else if (minBest < minAvoid) setMatchResult({ title: "Good Match 👍", text: "A safe, flattering choice for your season.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" });
    else setMatchResult({ title: "Neutral Choice 🤔", text: "This isn't strongly in your best or worst colors. If you love the dress, go for it!", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" });
  };

  if (loading) return <div className="py-20 font-bold tracking-widest text-center uppercase">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 min-h-[70vh]">
      <h1 className="mb-2 text-4xl font-extrabold tracking-widest text-center text-black uppercase">
        Hi, {user?.name?.split(' ')[0]}!
      </h1>
      <h2 className="mb-12 text-lg tracking-widest text-center text-gray-500 uppercase">Welcome to your Dashboard</h2>

      {colorProfiles.length > 0 && (
        <div className="mb-16">

          <div className="flex flex-col items-center justify-between gap-4 pb-3 mb-6 border-b border-gray-200 md:flex-row">
            <h2 className="text-2xl font-bold tracking-widest uppercase">
              <i className="mr-2 fa-solid fa-palette"></i>My Color Profiles
            </h2>
            <Button
              variant="primary"
              onClick={() => setMatchModalProfile(colorProfiles[0])} 
              className="w-full transition-shadow shadow-md md:w-auto hover:shadow-lg"
            >
              <i className="mr-2 fa-solid fa-crosshairs"></i> Launch Garment Matcher
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {colorProfiles.map(profile => (
              <div key={profile._id} className="flex flex-col gap-6 p-6 transition-shadow bg-white border border-gray-200 shadow-sm sm:flex-row hover:shadow-md group">
                <div
                  className="w-full cursor-pointer sm:w-1/3"
                  onClick={() => setSelectedColorProfile(profile)}
                >
                  <img src={profile.userImageUrl} alt="User Profile" className="object-cover w-full h-40 transition-opacity border border-gray-200 group-hover:opacity-90" />
                  <p className="text-[10px] text-center mt-2 text-gray-400 uppercase tracking-widest font-bold group-hover:text-black transition-colors">View Details <i className="ml-1 fa-solid fa-expand"></i></p>
                </div>

                <div className="flex flex-col justify-center w-full sm:w-2/3">
                  <h3 className="mb-1 text-xl font-extrabold tracking-widest text-black uppercase">{profile.season}</h3>
                  <p className="mb-4 text-xs tracking-widest text-gray-500 uppercase">
                    {profile.skinTone} Skin • {profile.hairColor} Hair • {profile.eyeColor} Eyes
                  </p>

                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-green-600">Best Colors</p>
                    <div className="flex h-6 gap-1">
                      {profile.bestColors.map(c => <div key={c} className="flex-1 rounded-sm" style={{ backgroundColor: c }}></div>)}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-red-600">Avoid</p>
                    <div className="flex h-4 gap-1">
                      {profile.avoidColors.map(c => <div key={c} className="flex-1 rounded-sm opacity-50" style={{ backgroundColor: c }}></div>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="pb-3 mb-6 text-2xl font-bold tracking-widest uppercase border-b border-gray-200">
        <i className="mr-2 fa-solid fa-shirt"></i>My Try-On History
      </h2>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 text-center text-gray-500">
          <i className="mb-6 text-6xl text-gray-300 fa-solid fa-camera-retro"></i>
          <p className="mb-8 text-sm font-bold tracking-widest text-gray-600 uppercase">You haven't tried on any clothes yet.</p>
          <Link to="/products"><Button variant="primary" size="lg">Explore Collection</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {history.map(item => (
            <div key={item._id} className="relative flex flex-col p-6 transition-shadow bg-white border border-gray-200 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between pb-3 mb-6 border-b border-gray-100">
                <div className="flex flex-col overflow-hidden">
                  <p className="font-bold tracking-wide text-gray-900 uppercase truncate">
                    {item.product?.name || 'Item Unavailable'}
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center justify-center p-2 text-gray-400 transition-colors rounded-md hover:text-red-600 hover:bg-red-50"
                  title="Delete Fit"
                >
                  <i className="text-lg fa-solid fa-trash-can"></i>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 cursor-pointer group" onClick={() => setSelectedFit(item)}>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Your Photo</p>
                  <img src={item.userImageUrl} alt="User" className="object-cover w-full h-48 transition border border-gray-200 bg-gray-50 group-hover:opacity-80" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-black uppercase tracking-widest mb-2 font-bold"><i className="mr-1 text-purple-600 fa-solid fa-wand-magic-sparkles"></i> AI Result</p>
                  <img src={item.resultImageUrl} alt="AI Result" className="object-cover w-full h-48 transition border border-gray-200 shadow-inner bg-gray-50 group-hover:opacity-80" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {item.externalLink ? (
                  <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full h-full text-xs">View Original <i className="ml-1 fa-solid fa-arrow-up-right-from-square"></i></Button>
                  </a>
                ) : item.product ? (
                  <Link to={`/product/${item.product._id}`}>
                    <Button variant="secondary" className="w-full h-full text-xs">View Product</Button>
                  </Link>
                ) : <div />}
                <Button variant="primary" className="w-full h-full text-xs" onClick={() => handleDownload(item.resultImageUrl)}>
                  <i className="mr-2 fa-solid fa-download"></i> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-6xl p-6 bg-white rounded-lg">
            <button onClick={() => setSelectedFit(null)} className="absolute z-10 text-3xl text-gray-500 top-4 right-4 hover:text-black">&times;</button>
            <h2 className="mb-8 text-2xl font-bold tracking-widest text-center uppercase">Generation Details</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">Original Photo</h3>
                <img src={selectedFit.userImageUrl} alt="User" className="w-full h-[500px] object-contain bg-gray-50 border border-gray-200 p-2" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">Product Selected</h3>
                {selectedFit.product ? (
                  <img src={selectedFit.product.imageUrl} alt="Product" className="w-full h-[500px] object-contain bg-gray-50 border border-gray-200 p-2" />
                ) : selectedFit.productImageUrl ? (
                  <img src={selectedFit.productImageUrl} alt="Extracted Product" className="w-full h-[500px] object-contain bg-gray-50 border border-gray-200 p-2" />
                ) : (
                  <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-400 uppercase tracking-widest">No Image</div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-purple-600 uppercase">
                  <i className="mr-2 fa-solid fa-wand-magic-sparkles"></i>AI Result
                </h3>
                <img src={selectedFit.resultImageUrl} alt="Result" className="w-full h-[500px] object-contain bg-gray-50 border border-purple-200 p-2 shadow-lg" />
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button variant="primary" onClick={() => handleDownload(selectedFit.resultImageUrl)}>
                <i className="mr-2 fa-solid fa-download"></i> Download Final Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedColorProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-4xl p-8 bg-white rounded-sm shadow-2xl lg:p-12 animate-fade-in">
            <button onClick={() => setSelectedColorProfile(null)} className="absolute z-10 text-4xl text-gray-400 top-4 right-6 hover:text-black">&times;</button>
            <h2 className="pb-6 mb-10 text-3xl font-extrabold tracking-widest text-center uppercase border-b border-gray-100">Your Color Analysis</h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center">
                <img src={selectedColorProfile.userImageUrl} alt="User" className="w-full max-h-[400px] object-cover bg-gray-50 border border-gray-200 p-2 shadow-md" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="mb-1 text-xs tracking-widest text-gray-500 uppercase">Your Season</p>
                <h3 className="mb-4 text-4xl font-extrabold tracking-widest text-black uppercase">{selectedColorProfile.season}</h3>

                <div className="p-4 mb-8 border border-gray-200 bg-gray-50">
                  <p className="flex justify-between mb-2 text-sm font-bold tracking-widest text-gray-700 uppercase">
                    <span>Skin Tone:</span> <span className="text-black">{selectedColorProfile.skinTone}</span>
                  </p>
                  <p className="flex justify-between mb-2 text-sm font-bold tracking-widest text-gray-700 uppercase">
                    <span>Hair Color:</span> <span className="text-black">{selectedColorProfile.hairColor}</span>
                  </p>
                  <p className="flex justify-between text-sm font-bold tracking-widest text-gray-700 uppercase">
                    <span>Eye Color:</span> <span className="text-black">{selectedColorProfile.eyeColor}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-xs font-bold tracking-widest uppercase"><i className="mr-2 text-green-600 fa-solid fa-check-circle"></i> Best Colors For You</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedColorProfile.bestColors.map(color => (
                      <div key={color} className="relative w-12 h-12 group">
                        <div className="w-full h-full transition border border-gray-200 rounded-full shadow-inner cursor-help hover:scale-110" style={{ backgroundColor: color }}></div>
                        <div className="absolute z-50 flex-col items-center hidden mb-2 transform -translate-x-1/2 bottom-full left-1/2 group-hover:flex">
                          <div className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded shadow-xl text-center whitespace-nowrap tracking-wider">{color.toUpperCase()} <br /> {getRgbString(color)}</div>
                          <div className="w-2 h-2 -mt-1 transform rotate-45 bg-black"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold tracking-widest uppercase"><i className="mr-2 text-red-600 fa-solid fa-times-circle"></i> Colors to Avoid</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedColorProfile.avoidColors.map(color => (
                      <div key={color} className="relative w-10 h-10 group">
                        <div className="w-full h-full transition border border-gray-200 rounded-full shadow-inner opacity-50 cursor-help hover:opacity-100 hover:scale-110" style={{ backgroundColor: color }}></div>
                        <div className="absolute z-50 flex-col items-center hidden mb-2 transform -translate-x-1/2 bottom-full left-1/2 group-hover:flex">
                          <div className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded shadow-xl text-center whitespace-nowrap tracking-wider">{color.toUpperCase()} <br /> {getRgbString(color)}</div>
                          <div className="w-2 h-2 -mt-1 transform rotate-45 bg-black"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {matchModalProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-5xl p-8 bg-white rounded-sm shadow-2xl lg:p-12 animate-fade-in">
            <button
              onClick={() => { setMatchModalProfile(null); setMatchImageUrl(null); setPickedGarmentColor(null); setMatchResult(null); }}
              className="absolute z-10 text-4xl text-gray-400 top-4 right-6 hover:text-black"
            >&times;</button>

            <h2 className="pb-4 mb-8 text-3xl font-extrabold tracking-widest text-center uppercase border-b border-gray-100">
              <i className="mr-3 fa-solid fa-crosshairs"></i>Garment Matcher
            </h2>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="flex flex-col pr-0 border-r border-gray-100 md:pr-12">
                <p className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">1. Provide Garment Image</p>

                {!matchImageUrl ? (
                  <>
                    <div className="flex gap-2 mb-6">
                      <input
                        type="url" placeholder="Paste product link..." value={matchUrlInput} onChange={(e) => setMatchUrlInput(e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 outline-none focus:border-black"
                      />
                      <Button variant="primary" onClick={handleExtractMatchImage} loading={extractingMatch}>Extract</Button>
                    </div>
                    <div className="mb-6 text-xs font-bold tracking-widest text-center text-gray-400 uppercase">— OR —</div>
                    <label className="flex flex-col items-center justify-center w-full h-32 transition border-2 border-gray-300 border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <i className="mb-2 text-2xl text-gray-400 fa-solid fa-upload"></i>
                      <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleMatchImageUpload} />
                    </label>
                  </>
                ) : (
                  <div className="relative flex flex-col items-center animate-fade-in">
                    <img src={matchImageUrl} alt="Garment" className="w-full h-[350px] object-contain bg-gray-50 border border-gray-200 p-2 mb-6" />

                    <Button variant="primary" size="lg" className="w-full mb-4" onClick={handlePickGarmentColor}>
                      <i className="mr-2 fa-solid fa-eye-dropper"></i> Pick Garment Color
                    </Button>

                    <button onClick={() => { setMatchImageUrl(null); setPickedGarmentColor(null); setMatchResult(null); }} className="text-xs font-bold tracking-wider text-red-500 uppercase hover:underline">
                      Start Over
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <p className="w-full mb-8 text-sm font-bold tracking-widest text-gray-500 uppercase">2. Match Result</p>

                {!pickedGarmentColor ? (
                  <div className="mt-10 text-center text-gray-400">
                    <i className="mb-4 text-6xl fa-solid fa-palette opacity-30"></i>
                    <p className="text-sm font-bold tracking-widest uppercase">Pick a color to see your match</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full animate-fade-in">
                    <p className="mb-2 text-xs font-bold tracking-widest text-gray-500 uppercase">Picked Color</p>
                    <div className="w-24 h-24 mb-8 border border-gray-300 rounded-full shadow-inner" style={{ backgroundColor: pickedGarmentColor }}></div>

                    {matchResult && (
                      <div className={`w-full p-8 border ${matchResult.border} ${matchResult.bg} text-center`}>
                        <h3 className={`text-2xl font-extrabold uppercase tracking-widest mb-3 ${matchResult.color}`}>{matchResult.title}</h3>
                        <p className="text-gray-700">{matchResult.text}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}