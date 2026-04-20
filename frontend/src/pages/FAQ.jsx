import { useState } from 'react';
import { Link } from 'react-router-dom'; 

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I try on clothes virtually?",
      answer: "You can try on clothes virtually! Go to 'Web Try-On' to paste a link from Amazon/Myntra, or explore our 'Shop' to try on our curated collection.",
      links: [
        { text: "Open Web Try-On", path: "/web-tryon" },
        { text: "Explore Shop", path: "/products" }
      ]
    },
    {
      question: "How do I find my seasonal color palette?",
      answer: "Find your perfect palette in the 'Colors' section! Upload a photo and use the eyedropper tool to pick your exact skin, hair, and eye colors to discover your Season.",
      links: [
        { text: "Start Color Analysis", path: "/color-analysis" }
      ]
    },
    {
      question: "Where can I explore traditional Indian clothing?",
      answer: "Explore traditional Indian styles using our interactive map under the 'Regional' tab.",
      links: [
        { text: "Open Interactive Map", path: "/regional-styles" }
      ]
    },
    {
      question: "Where can I find my try-on history and saved color profiles?",
      answer: "Your try-on history and saved color profiles are securely stored in your personal 'Dashboard'.",
      links: [
        { text: "Go to Dashboard", path: "/dashboard" }
      ]
    },
    {
      question: "How do I buy clothes or use the cart?",
      answer: "Review your items and proceed to checkout by clicking the 'Cart' icon in the top right corner of the screen.",
      links: [
        { text: "View Cart", path: "/cart" }
      ]
    },
    {
      question: "How can I contact support?",
      answer: "You can reach out to our team directly via the 'Contact' page. We are always happy to help!",
      links: [
        { text: "Contact Us", path: "/contact" }
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl px-4 py-16 mx-auto sm:px-6 min-h-[70vh]">
      <h1 className="mb-4 text-4xl font-extrabold tracking-widest text-center text-black uppercase">Frequently Asked Questions</h1>
      <p className="mb-12 text-center text-gray-500">Everything you need to know about using TryOnStylist.</p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="overflow-hidden transition-all duration-300 border border-gray-200 bg-gray-50"
          >
            <button 
              onClick={() => toggleFAQ(index)}
              className="flex items-center justify-between w-full p-6 text-left transition-colors focus:outline-none hover:bg-gray-100"
            >
              <span className="text-sm font-bold tracking-widest text-gray-900 uppercase">{faq.question}</span>
              <span className="flex-shrink-0 ml-6">
                <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-black' : 'text-gray-400'}`}></i>
              </span>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 pt-0 bg-white border-t border-gray-100">
                <p className="text-gray-600">{faq.answer}</p>
                
                {faq.links && (
                  <div className="flex flex-wrap gap-4 mt-6">
                    {faq.links.map((link, i) => (
                      <Link 
                        key={i} 
                        to={link.path} 
                        className="px-5 py-3 text-xs font-bold tracking-wider text-white uppercase transition-colors bg-black rounded-sm hover:bg-gray-800"
                      >
                        {link.text} <i className="ml-2 fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}