import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[#1A1A1A]">
              SECE <span className="text-[#FFD700]">SmartClass</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-[#1A1A1A] hover:text-[#FFD700] transition-all duration-300"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-[#1A1A1A] hover:text-[#FFD700] transition-all duration-300"
            >
              How It Works
            </a>
            <a href="/login" className="bg-[#FFD700] hover:bg-[#FFED4E] text-white px-6 py-2 rounded-lg transition-all duration-300">
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
