
import React from 'react';
import { Book, FileText, Image, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

const EducationalResources = () => {
  return (
    <motion.div 
      className="w-full py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
          مصادر تعليمية
        </h2>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {/* الألغاز التعليمية */}
          <Link to="/subject-puzzles">
            <Card className="h-28 md:h-32 overflow-hidden relative hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-500/20 to-amber-700/30 border-yellow-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-3 relative z-10">
                <div className="flex flex-col items-center">
                  <FileText className="w-6 h-6 text-yellow-400 mb-1" />
                  <h3 className="text-sm md:text-base font-bold text-white mb-0.5">الألغاز التعليمية</h3>
                  <p className="text-white/80 text-xs hidden md:block">حل الألغاز وتحدي نفسك</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Visual Library */}
          <Link to="/visual-library">
            <Card className="h-28 md:h-32 overflow-hidden relative hover:border-pink-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-pink-500/20 to-pink-700/30 border-pink-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-3 relative z-10">
                <div className="flex flex-col items-center">
                  <Image className="w-6 h-6 text-pink-400 mb-1" />
                  <h3 className="text-sm md:text-base font-bold text-white mb-0.5">المكتبة المرئية</h3>
                  <p className="text-white/80 text-xs hidden md:block">استكشف الصور التعليمية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Scientific Journal */}
          <Link to="/scientific-journal">
            <Card className="h-28 md:h-32 overflow-hidden relative hover:border-indigo-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-500/20 to-indigo-700/30 border-indigo-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-3 relative z-10">
                <div className="flex flex-col items-center">
                  <FileText className="w-6 h-6 text-indigo-400 mb-1" />
                  <h3 className="text-sm md:text-base font-bold text-white mb-0.5">المجلة العلمية</h3>
                  <p className="text-white/80 text-xs hidden md:block">اطلع على أحدث المقالات</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Study Organization */}
          <Link to="/study-organization">
            <Card className="h-28 md:h-32 overflow-hidden relative hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-500/20 to-emerald-700/30 border-emerald-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-3 relative z-10">
                <div className="flex flex-col items-center">
                  <Book className="w-6 h-6 text-emerald-400 mb-1" />
                  <h3 className="text-sm md:text-base font-bold text-white mb-0.5">تنظيم الدراسة</h3>
                  <p className="text-white/80 text-xs hidden md:block">أدوات ونصائح لتنظيم وقتك</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Chat Rooms */}
          <Link to="/chat-rooms">
            <Card className="h-28 md:h-32 overflow-hidden relative hover:border-sky-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-sky-500/20 to-sky-700/30 border-sky-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-3 relative z-10">
                <div className="flex flex-col items-center">
                  <MessageSquare className="w-6 h-6 text-sky-400 mb-1" />
                  <h3 className="text-sm md:text-base font-bold text-white mb-0.5">غرف المحادثة</h3>
                  <p className="text-white/80 text-xs hidden md:block">تواصل مع زملائك</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationalResources;
