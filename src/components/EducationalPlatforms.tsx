
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Atom, FlaskConical, Calculator, Dna } from 'lucide-react';

const EducationalPlatforms = () => {
  return (
    <motion.div 
      className="w-full py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
          المنصات التعليمية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-0">
          {/* منصة الفيزياء */}
          <Link to="/physics">
            <Card className="h-64 overflow-hidden relative hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/20 to-purple-700/30 border-blue-500/20 rounded-xl">
              <div className="absolute inset-0">
                <img 
                  src="https://modo3.com/thumbs/fit630x300/11168/1630299222/%D8%AA%D8%B9%D8%B1%D9%8A%D9%81_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1.jpg" 
                  alt="الفيزياء" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <Atom className="w-12 h-12 text-blue-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">الفيزياء</h3>
                  <p className="text-white/80 text-sm max-w-md">استكشف عالم الفيزياء واكتشف القوانين التي تحكم الكون</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الكيمياء */}
          <Link to="/chemistry">
            <Card className="h-64 overflow-hidden relative hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500/20 to-blue-700/30 border-cyan-500/20 rounded-xl">
              <div className="absolute inset-0">
                <img 
                  src="https://doctor-asmaa-shalapy.com/wp-content/uploads/2024/08/%D8%A7%D9%84%D9%83%D9%8A%D9%85%D9%8A%D8%A7%D8%A1-%D8%A7%D9%84%D8%B9%D8%B6%D9%88%D9%8A%D8%A9.webp" 
                  alt="الكيمياء" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <FlaskConical className="w-12 h-12 text-cyan-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">الكيمياء</h3>
                  <p className="text-white/80 text-sm max-w-md">تعرف على العناصر والتفاعلات الكيميائية وتطبيقاتها</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الرياضيات */}
          <Link to="/mathematics">
            <Card className="h-64 overflow-hidden relative hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500/20 to-indigo-700/30 border-purple-500/20 rounded-xl">
              <div className="absolute inset-0">
                <img 
                  src="https://static6.depositphotos.com/1004338/648/v/450/depositphotos_6489591-stock-illustration-mathematics-background.jpg" 
                  alt="الرياضيات" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <Calculator className="w-12 h-12 text-purple-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">الرياضيات</h3>
                  <p className="text-white/80 text-sm max-w-md">استكشف عالم الأرقام والمعادلات والنظريات الرياضية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الأحياء */}
          <Link to="/biology">
            <Card className="h-64 overflow-hidden relative hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500/20 to-teal-700/30 border-green-500/20 rounded-xl">
              <div className="absolute inset-0">
                <img 
                  src="https://mittrarabia.com/wp-content/uploads/2023/09/shutterstock_1595924371-445x250.jpeg" 
                  alt="الأحياء" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <Dna className="w-12 h-12 text-green-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">الأحياء</h3>
                  <p className="text-white/80 text-sm max-w-md">تعرف على الكائنات الحية وعلم الأحياء بمختلف فروعه</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationalPlatforms;
