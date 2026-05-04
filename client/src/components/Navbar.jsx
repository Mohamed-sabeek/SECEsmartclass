import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import seceLogo from '../assets/sece-logo.png';

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
              className="h-12 md:h-16 w-auto object-contain" 
            />
            <span className="text-xl md:text-2xl text-[#1A1A1A] tracking-tight leading-none">
              SECE <span className="font-bold text-[#FFD700]">SmartClass</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-sm font-medium text-gray-600 hover:text-[#FFD700] transition-all duration-300"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-sm font-medium text-gray-600 hover:text-[#FFD700] transition-all duration-300"
            >
              How It Works
            </a>
            <a href="/login" className="bg-[#1A1A1A] hover:bg-[#FFD700] text-white hover:text-[#1A1A1A] px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md active:scale-95">
              Login
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#1A1A1A]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="block text-[#1A1A1A] hover:text-[#FFD700] transition-all duration-300"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="block text-[#1A1A1A] hover:text-[#FFD700] transition-all duration-300"
            >
              How It Works
            </a>
            <a href="/login" className="block w-full bg-[#FFD700] hover:bg-[#FFED4E] text-white px-6 py-2 rounded-lg transition-all duration-300 text-center">
              Login
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
