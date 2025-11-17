import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="bg-blue-950/30 backdrop-filter backdrop-blur-lg border-t border-blue-800/20 mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-end mb-4 md:mb-0">
            <p className="text-white/60 text-center md:text-right">
              منصة تفاعلية للتعلم الذكي
            </p>
            <p className="text-white/60 text-center md:text-right mt-1">
              تم إنشاء المنصة بواسطة محمود جوارنة
            </p>
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <Link to="/contact" className="text-blue-400 hover:text-blue-300 text-sm">
              تواصل معنا
            </Link>
            <span className="text-white/30">•</span>
            
            <span className="text-white/30">•</span>
            <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">
              الرئيسية
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-blue-900/50 text-center">
          
        </div>
      </div>
    </footer>;
};
export default Footer;