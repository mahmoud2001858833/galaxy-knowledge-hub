
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm py-8 px-6 md:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4 text-right">فلك المعرفة</h3>
            <p className="text-white/70 text-right">
              منصة تعليمية تفاعلية تجمع بين المعرفة العلمية والتكنولوجيا الحديثة بتصميم فضائي مميز
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4 text-right">روابط سريعة</h3>
            <ul className="space-y-2 text-right">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/mathematics" className="text-white/70 hover:text-white transition-colors">
                  منصة الرياضيات
                </Link>
              </li>
              <li>
                <Link to="/chemistry" className="text-white/70 hover:text-white transition-colors">
                  منصة الكيمياء
                </Link>
              </li>
              <li>
                <Link to="/physics" className="text-white/70 hover:text-white transition-colors">
                  منصة الفيزياء
                </Link>
              </li>
              <li>
                <Link to="/biology" className="text-white/70 hover:text-white transition-colors">
                  منصة الأحياء
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4 text-right">تواصل معنا</h3>
            <ul className="space-y-2 text-right">
              <li>
                <a href="mailto:jowmahmoud6@gmail.com" className="text-white/70 hover:text-white transition-colors">
                  البريد الإلكتروني
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                  نموذج التواصل
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-white/50">
          <p>&copy; {new Date().getFullYear()} فلك المعرفة - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
