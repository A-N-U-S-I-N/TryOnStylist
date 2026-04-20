import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [genderFilter, setGenderFilter] = useState(() => localStorage.getItem('preferredGender') || 'women');

  const handleGenderChange = (gender) => {
    setGenderFilter(gender);
    localStorage.setItem('preferredGender', gender);
  };
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const formatCategoryName = (cat) => {
    if (cat === 'tshirt') return 'T-Shirts';
    if (cat === 'one-piece') return 'One-Pieces';
    return cat.charAt(0).toUpperCase() + cat.slice(1) + 's'; 
  };

  const getDynamicCategories = (gender) => {
    const genderProducts = products.filter(p => p.gender === gender);
    const categoriesMap = {};
    
    genderProducts.forEach(p => {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = {
          name: formatCategoryName(p.category),
          imageSrc: p.imageUrl, 
          href: `/products?category=${p.category}&gender=${gender}`
        };
      }
    });
    
    return Object.values(categoriesMap);
  };

  const activeCategories = getDynamicCategories(genderFilter);

  const features = [
    { name: 'AI Visualization', description: 'See how clothes look on you with our AI-powered visualization tool.', iconClass: 'fa-solid fa-wand-magic-sparkles' },
    { name: 'Virtual Try-On', description: 'Use our innovative feature to virtually try on any item before you buy.', iconClass: 'fa-solid fa-camera-retro' },
    { name: 'Modern Styles', description: 'Discover a curated collection of modern and trendy clothing for every occasion.', iconClass: 'fa-solid fa-palette' },
    { name: 'Latest Fashion', description: 'Stay ahead of the curve with the latest drops and fashion-forward options.', iconClass: 'fa-solid fa-arrow-trend-up' },
  ];

  return (
    <div className="relative bg-white">
      <div className="relative bg-gray-900 h-[70vh]">
        <div className="absolute inset-0">
          <img className="object-cover w-full h-full opacity-60" src="/hero-bg.jpg" alt="Fashion" />
        </div>
        <div className="relative flex flex-col items-center justify-center h-full px-4 mx-auto text-center max-w-7xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
            Discover Your Style
          </h1>
          <p className="max-w-3xl mt-6 text-xl text-gray-300">
            At TryOnStylist, we offer a curated collection of modern fashion. Use our AI to see exactly how our premium collection looks on you before you buy.
          </p>
          <div className="mt-10">
            <Link to={`/products?gender=${genderFilter}`} className="inline-block px-8 py-4 text-base font-bold tracking-wider text-white uppercase transition-all bg-transparent border-2 border-white rounded-sm hover:bg-white hover:text-black">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      <section className="px-4 py-16 pt-20 mx-auto bg-white max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Shop by Category</h2>
          <p className="mt-4 text-lg text-gray-600">Find your perfect fit from our popular {genderFilter} categories.</p>
        </div>
        
        {loading ? (
          <div className="py-10 font-bold tracking-widest text-center uppercase">Loading Categories...</div>
        ) : activeCategories.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No categories available right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {activeCategories.map((category) => (
              <Link key={category.name} to={category.href} className="block group">
                <div className="relative w-full overflow-hidden bg-gray-100 rounded-sm h-80 group-hover:opacity-75">
                  <img src={category.imageSrc} alt={category.name} className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-wide text-gray-900 uppercase">{category.name}</h3>
                <p className="mt-1 text-sm tracking-widest text-gray-500 uppercase">Shop now</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="py-24 mt-12 bg-gray-50">
        <div className="flex flex-col items-center mx-auto lg:flex-row max-w-7xl">
          <div className="flex flex-col justify-center p-12 text-center lg:w-1/2 lg:p-24 lg:text-left">
            <h2 className="mb-6 text-4xl font-extrabold tracking-widest text-black uppercase">
              Find Your True Colors
            </h2>
            <div className="w-16 h-1 mx-auto mb-6 bg-black lg:mx-0"></div>
            <p className="mb-10 text-lg leading-relaxed text-gray-500">
              Stop guessing which shades suit you. Use our interactive Color Picker to extract your exact skin, hair, and eye hex codes, and instantly discover your Seasonal Color Palette.
            </p>
            <div>
              <Link to="/color-analysis" className="inline-block px-10 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all bg-transparent border border-black hover:bg-black hover:text-white">
                Open Color Palette Tool
              </Link>
            </div>
          </div>
          <div className="w-full p-8 lg:w-1/2 lg:p-0">
            <img
              src="https://images.unsplash.com/photo-1716471330459-063b3baf247e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Abstract Color Wheel"
              className="w-full h-[500px] object-cover lg:rounded-l-full shadow-2xl"
            />
          </div>
        </div>
      </section>

      <div className="relative bg-gray-900 h-[100vh] border-t border-gray-100">
        <div className="absolute inset-0">
          <img 
            className="object-cover w-full h-full opacity-40" 
            src="https://images.unsplash.com/photo-1753161029001-153c43be9eb7?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Style from anywhere" 
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 mx-auto text-center max-w-7xl">
          <h2 className="mb-6 text-4xl font-extrabold tracking-widest text-white uppercase sm:text-5xl lg:text-6xl">
            Style From Anywhere
          </h2>
          <div className="w-16 h-1 mx-auto mb-6 bg-white"></div>
          <p className="max-w-2xl mb-10 text-lg text-gray-300">
            Found a stunning outfit on your favorite store? Paste the link, and our AI will extract it and fit it perfectly onto your photo instantly.
          </p>
          <div>
            <Link to="/web-tryon" className="inline-block px-10 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all bg-white border-2 border-white rounded-sm hover:bg-transparent hover:text-white">
              <i className="mr-2 fa-solid fa-link"></i> Try From Web Link
            </Link>
          </div>
        </div>
      </div>

      <section className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="flex flex-col items-center mx-auto lg:flex-row max-w-7xl">
          <div className="w-full p-8 lg:w-1/2 lg:p-0">
            <img 
              src="https://images.unsplash.com/photo-1733094151451-4222a842cfd1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Indian Culture" 
              className="w-full h-[500px] object-cover lg:rounded-r-full shadow-2xl" 
            />
          </div>
          <div className="flex flex-col justify-center p-12 text-center lg:w-1/2 lg:p-24 lg:text-left">
            <h2 className="mb-6 text-4xl font-extrabold tracking-widest text-black uppercase">
              Trying Regional Styles
            </h2>
            <div className="w-16 h-1 mx-auto mb-6 bg-black lg:mx-0"></div>
            <p className="mb-10 text-lg leading-relaxed text-gray-500">
              Explore the rich cultural tapestry of India. Click on our interactive map to discover and virtually try on authentic traditional dresses from various states across the country.
            </p>
            <div>
              <Link to="/regional-styles" className="inline-block px-10 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all bg-black border border-black hover:bg-white hover:text-black">
                <i className="mr-2 fa-solid fa-map-location-dot"></i> Open Interactive Map
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-white">
        <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Why TryOnStylist?</h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
              We are committed to providing stylish, high-quality apparel that lasts.
            </p>
          </div>
          <div className="grid grid-cols-1 mt-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-gray-900 rounded-md">
                  <i className={`${feature.iconClass} text-xl`} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-wide text-gray-900 uppercase">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed z-50 flex overflow-hidden bg-white border-2 border-black rounded-full shadow-2xl bottom-8 right-8">
        <button
          onClick={() => handleGenderChange('women')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${genderFilter === 'women' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          Women
        </button>
        <button
          onClick={() => handleGenderChange('men')} 
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${genderFilter === 'men' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          Men
        </button>
      </div>
    </div>
  );
}