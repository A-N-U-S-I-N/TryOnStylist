import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import Button from '../components/Button';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  
  const [selectedCategory, setSelectedCategory] = useState(() => {
     const params = new URLSearchParams(location.search);
     return params.get('category') || 'all';
  });
  const [genderFilter, setGenderFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('gender') || localStorage.getItem('preferredGender') || 'women';
 });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const genderParam = params.get('gender');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (genderParam) setGenderFilter(genderParam);
  }, [location.search]);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const genderProducts = products.filter(p => p.gender === genderFilter);

  const availableCategories = [...new Set(genderProducts.map(p => p.category))];

  const activeCategories = ['all', ...availableCategories];

  const filteredProducts = genderProducts.filter(p => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  const handleGenderToggle = (gender) => {
    setGenderFilter(gender);
    setSelectedCategory('all');
    localStorage.setItem('preferredGender', gender); 
  };

  return (
    <div className="relative min-h-screen px-4 py-12 mx-auto bg-white max-w-7xl">
      <h1 className="mb-12 text-4xl font-extrabold tracking-widest text-center uppercase">The Collection</h1>
      
      <div className="flex justify-center py-2 mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {activeCategories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 mx-2 uppercase tracking-wider ${
              selectedCategory === category ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
         <div className="py-20 font-bold tracking-widest text-center uppercase">Loading Collection...</div>
      ) : filteredProducts.length === 0 ? (
         <p className="mt-8 text-lg text-center text-gray-600">No products found for this category.</p>
      ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map(p => (
              <div key={p._id} className="flex flex-col h-full p-2 transition-all bg-white border border-transparent group hover:border-gray-200">
                <Link to={`/product/${p._id}`} className="relative flex items-center justify-center w-full mb-4 overflow-hidden bg-gray-100 h-80 group">
                  <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                </Link>
                <div className="flex flex-col flex-grow text-center">
                  <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase">{p.category}</p>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 truncate">{p.name}</h3>
                  <p className="mb-4 font-bold text-gray-800">Rs. {p.price}</p>
                  <Link to={`/product/${p._id}`} className="mt-auto">
                    <Button variant="secondary" className="w-full">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
      )}

      <div className="fixed z-50 flex overflow-hidden bg-white border-2 border-black rounded-full shadow-2xl bottom-8 right-8">
        <button 
          onClick={() => handleGenderToggle('women')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${genderFilter === 'women' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          Women
        </button>
        <button 
          onClick={() => handleGenderToggle('men')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${genderFilter === 'men' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          Men
        </button>
      </div>
    </div>
  );
}