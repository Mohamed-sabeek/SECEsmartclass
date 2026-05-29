import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import seceLogo from '../assets/sece-logo.webp';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
    
    // Close mobile menu
    setIsOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img 
              src={seceLogo} 
              alt="SECE Logo" 
              className="h-20 md:h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105" 
            />
            <span className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tighter leading-none transition-colors duration-300 group-hover:text-gray-800">
              SECE <span className="text-[#FFD700] font-black">SmartClass</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-sm font-bold tracking-wide text-gray-600 hover:text-[#1A1A1A] transition-all duration-300 relative py-1 group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-sm font-bold tracking-wide text-gray-600 hover:text-[#1A1A1A] transition-all duration-300 relative py-1 group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="/login" className="bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-7 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
              Login Portal
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#1A1A1A] focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-gray-50 animate-fadeIn">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="block text-base font-bold text-gray-600 hover:text-[#FFD700] transition-all duration-300 py-1"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="block text-base font-bold text-gray-600 hover:text-[#FFD700] transition-all duration-300 py-1"
            >
              How It Works
            </a>
            <a href="/login" className="block w-full bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-6 py-3 rounded-xl font-bold transition-all duration-300 text-center shadow-md">
              Login Portal
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
