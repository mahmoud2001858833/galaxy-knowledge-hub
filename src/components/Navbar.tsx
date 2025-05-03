
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="relative z-50 py-4 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-space-neon-blue mr-2">🌌</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-deep-purple">
            فلك المعرفة
          </span>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-2 items-center">
        <Link to="/about" className="nav-link">
          عن المنصة
        </Link>
        <Link to="/contact" className="nav-link">
          اتصل بنا
        </Link>
        <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 w-10 h-10">
          <UserIcon className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden text-white p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
          />
        </svg>
      </button>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-space-cosmic-black/95 backdrop-blur-lg border-y border-white/10 p-4">
          <div className="flex flex-col space-y-3">
            <Link to="/about" className="nav-link">
              عن المنصة
            </Link>
            <Link to="/contact" className="nav-link">
              اتصل بنا
            </Link>
            <Button className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white rounded-full">
              <UserIcon className="h-5 w-5 mr-2" />
              تسجيل الدخول
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
