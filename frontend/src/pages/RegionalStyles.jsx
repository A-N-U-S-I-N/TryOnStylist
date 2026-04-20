import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const statesData = [
  {
    id: 'rj',
    name: 'Rajasthan',
    top: '37%',
    left: '23%',
    men: {
      title: 'Bandhgala Suit',
      img: 'https://rajanyas.com/cdn/shop/products/MAK_5398_1.jpg?v=1695630110&width=1946',
    },
    women: {
      title: 'Ghagra Choli',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5_d9Sl0r9qriJhr0rT6U1VY9tE8XG7GKrHg&s',
    },
  },
  {
    id: 'pb',
    name: 'Punjab',
    top: '22%',
    left: '27%',
    men: {
      title: 'Kurta Pajama',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdjH0y_GbvEYAaUYZ5AHfUH2uo2vfGVXL_2g&s',
    },
    women: {
      title: 'Patiala Suit',
      img: 'https://mangaldeep.co.in/cdn/shop/files/212103.jpg?v=1756107117',
    },
  },
  {
    id: 'mh',
    name: 'Maharashtra',
    top: '59%',
    left: '28%',
    men: {
      title: 'Dhoti Kurta',
      img: 'https://www.sareespalace.com/image/cache/data-2024/off-white-art-silk-dhoti-kurta-303904-1000x1375.jpg',
    },
    women: {
      title: 'Nauvari Saree',
      img: 'https://www.utsavpedia.com/wp-content/uploads/2013/06/nauvari-art-silk-saree.jpg',
    },
  },
  {
    id: 'wb',
    name: 'West Bengal',
    top: '48%',
    left: '67%',
    men: {
      title: 'Panjabi & Dhoti',
      img: 'https://www.dheu.in/cdn/shop/files/DPM22068DPCS22052DH_4_1400x.jpg?v=1691151222',
    },
    women: {
      title: 'Garad Saree',
      img: 'https://cdn.shopify.com/s/files/1/0353/3897/files/Garad-Silk-Saree.jpg?v=1613150046',
    },
  },
  {
    id: 'kl',
    name: 'Kerala',
    top: '88%',
    left: '30.5%',
    men: {
      title: 'Mundu & Shirt',
      img: 'https://dishacreationz.com/cdn/shop/files/DSC04765.jpg?v=1750313775',
    },
    women: {
      title: 'Kasavu Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7Z2f7AbMXl-h1X5_s1vnoAKu2cj2D1w78RQ&s',
    },
  },
  {
    id: 'gj',
    name: 'Gujarat',
    top: '48%',
    left: '16%',
    men: {
      title: 'Kediyu & Dhoti',
      img: 'https://m.media-amazon.com/images/I/91d7gJHQN6L._AC_UY1100_.jpg',
    },
    women: {
      title: 'Chaniya Choli',
      img: 'https://www.fancydresswale.com/cdn/shop/files/Red-Navratri-Lehenga-Choli-with-Dupatta-_-Gujarati-Traditional-Embroidered-Chaniya-Choli-for-Women-fancydresswale.com-162943250.jpg',
    },
  },
  {
    id: 'jk',
    name: 'Jammu & Kashmir',
    top: '9%',
    left: '30%',
    men: {
      title: 'Pheran',
      img: 'https://i.pinimg.com/736x/d3/4c/9c/d34c9c4178458fdcb1f1b603c4bdf5d1.jpg',
    },
    women: {
      title: 'Pheran & Taranga',
      img: 'https://traditional25.wordpress.com/wp-content/uploads/2012/03/kashmiridress.jpg?w=584',
    },
  },
  {
    id: 'up',
    name: 'Uttar Pradesh',
    top: '36%',
    left: '45%',
    men: {
      title: 'Sherwani',
      img: 'https://dulhaghar.in/cdn/shop/files/HSP04554.jpg?v=1755262396',
    },
    women: {
      title: 'Chikankari Suit',
      img: 'https://madhusha.in/cdn/shop/files/17_1.jpg?v=1727845929&width=1946',
    },
  },
  {
    id: 'mp',
    name: 'Madhya Pradesh',
    top: '48%',
    left: '36%',
    men: {
      title: 'Bandi & Dhoti',
      img: 'https://5.imimg.com/data5/SELLER/Default/2024/3/404851417/BC/EA/YP/43751378/dsc09935.jpg',
    },
    women: {
      title: 'Maheshwari Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ-1tW14VIa3v6hiBEv-ljAs3w2IDvps8o8Q&s',
    },
  },
  {
    id: 'tn',
    name: 'Tamil Nadu',
    top: '86%',
    left: '37%',
    men: {
      title: 'Veshti & Angavastram',
      img: 'https://sethukrishna.com/cdn/shop/products/Mynthra_06_5ebc5960-2806-41d3-a609-f51a3096ae9d.jpg?v=1691489064&width=900',
    },
    women: {
      title: 'Kanjeevaram Saree',
      img: 'https://5.imimg.com/data5/NN/GR/BY/SELLER-9882405/pure-kanjeevaram-silk-saree-500x500.jpg',
    },
  },
  {
    id: 'ka',
    name: 'Karnataka',
    top: '75%',
    left: '27%',
    men: {
      title: 'Panche & Mysore Peta',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9rwt4gkLoyIgGbuoMaXvAn6TxBPkslAc7HQ&s',
    },
    women: {
      title: 'Ilkal Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpvOC0FgAvkSwUc7qgcqQUZobPWDN7ZhSqQ&s',
    },
  },
  {
    id: 'as',
    name: 'Assam',
    top: '36%',
    left: '84%',
    men: {
      title: 'Suriya & Chador',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTdnjOE6TsJA5KELrJtvEIVB1J9b2thKUg_Q&s',
    },
    women: {
      title: 'Mekhela Chador',
      img: 'https://m.media-amazon.com/images/I/714Yc32q6BL._AC_UY350_.jpg',
    },
  },
  {
    id: 'or',
    name: 'Odisha',
    top: '55%',
    left: '57%',
    men: {
      title: 'Kurta & Gamucha',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkc2EMuwtygyRjdbrL-_n_sIaA3GhMVGNhrw&s',
    },
    women: {
      title: 'Sambalpuri Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSshdrCMunwMyJi0FOu0yg9gtVT3asY2h-IkA&s',
    },
  },
  {
    id: 'ap',
    name: 'Andhra Pradesh',
    top: '74%',
    left: '39%',
    men: {
      title: 'Kurta & Pancha',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5o3xBwVaogm3ADKMSr1y4t8nacGfBrd3UrQ&s',
    },
    women: {
      title: 'Dharmavaram Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmnwTM5G0Vu0jtv2KQLMoroo-Q5Hg3e7TtjA&s',
    },
  },
  {
    id: 'br',
    name: 'Bihar',
    top: '39%',
    left: '60%',
    men: {
      title: 'Kurta & Dhoti',
      img: 'https://i.pinimg.com/736x/6d/ba/10/6dba105bdb57430f5693c922bf2bbfa8.jpg',
    },
    women: {
      title: 'Tussar Silk Saree',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSljaH_0JTCbZzAy-l8WWVjB6Yr-JQhEkIYmQ&s',
    },
  },
];



export default function RegionalStyles() {
  const [selectedState, setSelectedState] = useState(null);
  const navigate = useNavigate();

  const handleTryOn = (imgUrl, title) => {
    navigate('/web-tryon', { state: { imageUrl: imgUrl, url: `Regional Attire: ${title}` } });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 min-h-[85vh]">
      <h1 className="mb-4 text-4xl font-extrabold tracking-widest text-center text-black uppercase">Regional Styles</h1>
      <p className="max-w-2xl mx-auto mb-12 text-center text-gray-500">Hover over the pointers to view states, and click to explore their traditional attire.</p>

      <div className="relative w-full max-w-5xl mx-auto">


        <img
          src="/india-map.png"
          alt="Map of India"
          className="object-contain w-full h-full opacity-70"
        />

        
        {statesData.map(state => (
          <div
            key={state.id}
            className="absolute group hover:z-[100] cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ top: state.top, left: state.left }}
            onClick={() => setSelectedState(state)}
          >
            <div className="absolute z-50 flex-col items-center hidden mb-2 transform -translate-x-1/2 group-hover:flex bottom-full left-1/2 animate-fade-in">
              <div className="bg-white text-black border border-gray-200 text-[10px] sm:text-xs font-extrabold px-4 py-2 rounded-full shadow-2xl whitespace-nowrap tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {state.name}
              </div>
              <div className="w-3 h-3 -mt-2 transform rotate-45 bg-white border-b border-r border-gray-200 shadow-sm"></div>
            </div>

            <div className="relative flex flex-col items-center justify-center mt-2 text-gray-800 transition-colors duration-300 group-hover:text-red-600">
              <i className="z-10 text-2xl transition-transform duration-300 fa-solid fa-map-pin drop-shadow-md group-hover:-translate-y-1"></i>
            </div>
          </div>
        ))}
      </div>

      {selectedState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-4xl p-8 bg-white rounded-sm shadow-2xl lg:p-12 animate-fade-in">
            <button onClick={() => setSelectedState(null)} className="absolute z-10 text-4xl text-gray-400 top-4 right-6 hover:text-black">&times;</button>

            <h2 className="pb-4 mb-8 text-3xl font-extrabold tracking-widest text-center uppercase border-b border-gray-100">
              {selectedState.name}
            </h2>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">Men's Attire</h3>
                <img src={selectedState.men.img} alt={selectedState.men.title} className="object-cover w-full mb-4 border border-gray-200 shadow-md h-80 bg-gray-50" />
                <p className="mb-6 text-lg font-bold tracking-widest uppercase">{selectedState.men.title}</p>
                <Button variant="primary" className="w-full" onClick={() => handleTryOn(selectedState.men.img, `${selectedState.name} Men's ${selectedState.men.title}`)}>
                  <i className="mr-2 fa-solid fa-wand-magic-sparkles"></i> Try On
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">Women's Attire</h3>
                <img src={selectedState.women.img} alt={selectedState.women.title} className="object-cover w-full mb-4 border border-gray-200 shadow-md h-80 bg-gray-50" />
                <p className="mb-6 text-lg font-bold tracking-widest uppercase">{selectedState.women.title}</p>
                <Button variant="primary" className="w-full" onClick={() => handleTryOn(selectedState.women.img, `${selectedState.name} Women's ${selectedState.women.title}`)}>
                  <i className="mr-2 fa-solid fa-wand-magic-sparkles"></i> Try On
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}