
import React from 'react';
import { Book, FileText, Image, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

const EducationalResources = () => {
  return (
    <motion.div 
      className="w-full py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
          مصادر تعليمية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
          {/* منصة الرياضيات */}
          <Link to="/mathematics">
            <Card className="h-64 overflow-hidden relative hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-60">
                <img 
                  src="https://cdn.sotor.com/thumbs/fit630x300/21018/1578422030/%D8%AA%D8%B9%D8%B1%D9%8A%D9%81_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A7%D8%AA.jpg" 
                  className="w-full h-full object-cover"
                  alt="منصة الرياضيات"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/90" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">منصة الرياضيات</h3>
                  <p className="text-white/80 text-sm max-w-md">استكشف عالم الرياضيات مع أحدث المصادر التعليمية والتمارين التفاعلية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الفيزياء */}
          <Link to="/physics">
            <Card className="h-64 overflow-hidden relative hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500/20 to-purple-700/30 border-purple-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-60">
                <img 
                  src="https://modo3.com/thumbs/fit630x300/11168/1630299222/%D8%AA%D8%B9%D8%B1%D9%8A%D9%81_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1.jpg" 
                  className="w-full h-full object-cover"
                  alt="منصة الفيزياء"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/90" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">منصة الفيزياء</h3>
                  <p className="text-white/80 text-sm max-w-md">تعلم الفيزياء بطريقة تفاعلية مع تجارب افتراضية وشروحات مبسطة</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الكيمياء */}
          <Link to="/chemistry">
            <Card className="h-64 overflow-hidden relative hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500/20 to-green-700/30 border-green-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-60">
                <img 
                  src="https://adminassets.devops.arabiaweather.com/sites/default/files/field/image/chemistry.jpg" 
                  className="w-full h-full object-cover"
                  alt="منصة الكيمياء"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/90" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">منصة الكيمياء</h3>
                  <p className="text-white/80 text-sm max-w-md">اكتشف عالم الكيمياء مع تجارب افتراضية وشروحات مفصلة للمفاهيم الأساسية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* منصة الأحياء */}
          <Link to="/biology">
            <Card className="h-64 overflow-hidden relative hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500/20 to-cyan-700/30 border-cyan-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-60">
                <img 
                  src="https://png.pngtree.com/thumb_back/fh260/background/20230704/pngtree-d-rendered-chromosomes-against-a-scientific-backdrop-exploring-life-and-biology-image_3739831.jpg" 
                  className="w-full h-full object-cover"
                  alt="منصة الأحياء"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/90" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">منصة الأحياء</h3>
                  <p className="text-white/80 text-sm max-w-md">استكشف علم الأحياء من خلال نماذج تفاعلية وشروحات مفصلة للمفاهيم الحيوية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* الألغاز التعليمية */}
          <Link to="/subject-puzzles">
            <Card className="h-64 overflow-hidden relative hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-500/20 to-amber-700/30 border-yellow-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-yellow-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">الألغاز التعليمية</h3>
                  <p className="text-white/80 text-sm max-w-md">حل الألغاز التعليمية وتحدي نفسك في مختلف المواد العلمية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Visual Library */}
          <Link to="/visual-library">
            <Card className="h-64 overflow-hidden relative hover:border-pink-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-pink-500/20 to-pink-700/30 border-pink-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <Image className="w-12 h-12 text-pink-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">المكتبة المرئية</h3>
                  <p className="text-white/80 text-sm max-w-md">استكشف مجموعة من الصور والرسومات التعليمية لتعزيز فهمك للمفاهيم العلمية</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Scientific Journal */}
          <Link to="/scientific-journal">
            <Card className="h-64 overflow-hidden relative hover:border-indigo-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-500/20 to-indigo-700/30 border-indigo-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-indigo-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">المجلة العلمية</h3>
                  <p className="text-white/80 text-sm max-w-md">اطلع على أحدث المقالات والأبحاث العلمية في مختلف المجالات</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Study Organization */}
          <Link to="/study-organization">
            <Card className="h-64 overflow-hidden relative hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-500/20 to-emerald-700/30 border-emerald-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <Book className="w-12 h-12 text-emerald-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">تنظيم الدراسة</h3>
                  <p className="text-white/80 text-sm max-w-md">أدوات ونصائح لتنظيم وقتك وتحسين كفاءة دراستك</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Chat Rooms */}
          <Link to="/chat-rooms">
            <Card className="h-64 overflow-hidden relative hover:border-sky-400/50 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-sky-500/20 to-sky-700/30 border-sky-500/20 rounded-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60" />
              </div>
              <CardContent className="flex items-center justify-center h-full text-center p-6 relative z-10">
                <div className="flex flex-col items-center">
                  <MessageSquare className="w-12 h-12 text-sky-400 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">غرف المحادثة</h3>
                  <p className="text-white/80 text-sm max-w-md">تواصل مع زملائك وناقش المواضيع العلمية في بيئة تعليمية تفاعلية</p>
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
