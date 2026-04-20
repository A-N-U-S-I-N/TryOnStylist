import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hi! I'm your TryOnStylist Assistant. How can I help you navigate the site today?" 
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateBotResponse = (userInput) => {
    const text = userInput.toLowerCase();
    
    if (text.includes('try') || text.includes('web') || text.includes('link')) {
      return {
        text: "You can try on clothes virtually! Go to 'Web Try-On' to paste a link from Amazon/Myntra, or explore our 'Shop'.",
        link: "/web-tryon",
        linkText: "Open Web Try-On"
      };
    }
    if (text.includes('color') || text.includes('season') || text.includes('palette')) {
      return {
        text: "Find your perfect palette in the 'Find My Colors' section! Upload a photo to pick your exact skin, hair, and eye colors to get your Season.",
        link: "/color-analysis",
        linkText: "Start Color Analysis"
      };
    }
    if (text.includes('map') || text.includes('region') || text.includes('traditional') || text.includes('indian')) {
      return {
        text: "Explore traditional Indian styles using our interactive map.",
        link: "/regional-styles",
        linkText: "Open Interactive Map"
      };
    }
    if (text.includes('order') || text.includes('history') || text.includes('fit') || text.includes('dashboard')) {
      return {
        text: "Your try-on history and saved color profiles are located in your personal Dashboard.",
        link: "/dashboard",
        linkText: "Go to Dashboard"
      };
    }
    if (text.includes('shop') || text.includes('clothes') || text.includes('products')) {
      return {
        text: "Browse our curated collection of modern fashion in the Shop.",
        link: "/products",
        linkText: "Explore Shop"
      };
    }
    if (text.includes('cart') || text.includes('checkout') || text.includes('buy')) {
      return {
        text: "Review your items and proceed to checkout in your Cart.",
        link: "/cart",
        linkText: "View Cart"
      };
    }
    if (text.includes('contact') || text.includes('help') || text.includes('support')) {
      return {
        text: "You can reach out to our team directly via the Contact page.",
        link: "/contact",
        linkText: "Contact Us"
      };
    }
    
    return {
      text: "I'm a simple navigation assistant! You can ask me where to find things like 'Virtual Try-On', 'Color Analysis', 'Dashboard', 'Shop', 'Map', or 'Cart'."
    };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      const botReply = generateBotResponse(input);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: botReply.text, 
        link: botReply.link, 
        linkText: botReply.linkText 
      }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start">
      {isOpen && (
        <div className="flex flex-col mb-4 overflow-hidden bg-white border border-gray-200 rounded-sm shadow-2xl w-80 h-96 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 text-white bg-black">
            <h3 className="text-sm font-bold tracking-widest uppercase"><i className="mr-2 fa-solid fa-robot"></i> Stylist Bot</h3>
            <button onClick={() => setIsOpen(false)} className="text-lg transition hover:text-gray-300">&times;</button>
          </div>

          <div className="flex flex-col flex-grow gap-3 p-4 overflow-y-auto text-sm bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 rounded-sm ${msg.sender === 'user' ? 'bg-gray-200 text-black self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`}>
                <p>{msg.text}</p>
                
                {msg.link && (
                  <Link 
                    to={msg.link} 
                    onClick={() => setIsOpen(false)} 
                    className="inline-block w-full px-3 py-2 mt-3 text-xs font-bold tracking-wider text-center text-white uppercase transition bg-black rounded-sm hover:bg-gray-800"
                  >
                    {msg.linkText} <i className="ml-1 fa-solid fa-arrow-right"></i>
                  </Link>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex p-2 bg-white border-t border-gray-200">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask me anything..." 
              className="flex-grow p-2 text-sm outline-none"
            />
            <button type="submit" className="px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition bg-black hover:bg-gray-800">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 ${isOpen ? 'bg-gray-800 text-white' : 'bg-black text-white'}`}
      >
        <i className={`text-2xl ${isOpen ? 'fa-solid fa-times' : 'fa-solid fa-message'}`}></i>
      </button>
    </div>
  );
}