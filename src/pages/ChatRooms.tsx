
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Calculator, Atom, FlaskConical, Leaf } from "lucide-react";

const ChatRooms = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-cyan-900/40 to-cyan-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-cyan-500 mb-10">
            غرف المحادثة
          </h1>
          
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            انضم إلى غرف المحادثة المتخصصة للتواصل مع الطلاب والمعلمين وطرح الأسئلة ومناقشة المواضيع العلمية المختلفة
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Mathematics Chat Room */}
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-blue-900/30 backdrop-blur-sm">
                    <Calculator className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="mr-4">
                    <h2 className="text-xl font-bold text-white">غرفة الرياضيات</h2>
                    <p className="text-blue-300/70 text-sm">٢٨ متصل حاليًا</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4">
                  ناقش المعادلات الرياضية، الهندسة، حساب التفاضل والتكامل، وغيرها من مواضيع الرياضيات
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-blue-600/70 hover:bg-blue-600 text-white rounded-md transition-colors">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    انضم للمحادثة
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* Physics Chat Room */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-700/30 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-purple-900/30 backdrop-blur-sm">
                    <Atom className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="mr-4">
                    <h2 className="text-xl font-bold text-white">غرفة الفيزياء</h2>
                    <p className="text-purple-300/70 text-sm">٢٢ متصل حاليًا</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4">
                  ناقش قوانين الفيزياء، الميكانيكا، الديناميكا الحرارية، الكهرومغناطيسية، وغيرها
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-purple-600/70 hover:bg-purple-600 text-white rounded-md transition-colors">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    انضم للمحادثة
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* Chemistry Chat Room */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/30 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-purple-900/30 backdrop-blur-sm">
                    <FlaskConical className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="mr-4">
                    <h2 className="text-xl font-bold text-white">غرفة الكيمياء</h2>
                    <p className="text-purple-300/70 text-sm">١٩ متصل حاليًا</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4">
                  ناقش التفاعلات الكيميائية، الجدول الدوري، الكيمياء العضوية، وغيرها من المواضيع
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-purple-600/70 hover:bg-purple-600 text-white rounded-md transition-colors">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    انضم للمحادثة
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* Biology Chat Room */}
            <Card className="bg-gradient-to-br from-green-500/20 to-green-700/30 border-green-500/20 hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-green-900/30 backdrop-blur-sm">
                    <Leaf className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="mr-4">
                    <h2 className="text-xl font-bold text-white">غرفة الأحياء</h2>
                    <p className="text-green-300/70 text-sm">١٦ متصل حاليًا</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4">
                  ناقش علم الخلية، علم الوراثة، التطور، التنوع الحيوي، وغيرها من مواضيع علم الأحياء
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-green-600/70 hover:bg-green-600 text-white rounded-md transition-colors">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    انضم للمحادثة
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-700/20 border-cyan-500/20 mb-10">
            <CardContent className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-full bg-cyan-900/30 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white mr-4 mt-2">غرف عامة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-600/10 p-4 rounded-lg border border-cyan-500/20 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">الساحة العلمية</h3>
                    <p className="text-white/70 text-sm">٣٥ متصل حاليًا</p>
                  </div>
                  <button className="px-3 py-1 bg-cyan-600/70 hover:bg-cyan-600 text-white rounded-md text-sm transition-colors">
                    انضم
                  </button>
                </div>
                <div className="bg-cyan-600/10 p-4 rounded-lg border border-cyan-500/20 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">مساعدة في الواجبات</h3>
                    <p className="text-white/70 text-sm">٤٢ متصل حاليًا</p>
                  </div>
                  <button className="px-3 py-1 bg-cyan-600/70 hover:bg-cyan-600 text-white rounded-md text-sm transition-colors">
                    انضم
                  </button>
                </div>
                <div className="bg-cyan-600/10 p-4 rounded-lg border border-cyan-500/20 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">المسابقات العلمية</h3>
                    <p className="text-white/70 text-sm">١٧ متصل حاليًا</p>
                  </div>
                  <button className="px-3 py-1 bg-cyan-600/70 hover:bg-cyan-600 text-white rounded-md text-sm transition-colors">
                    انضم
                  </button>
                </div>
                <div className="bg-cyan-600/10 p-4 rounded-lg border border-cyan-500/20 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">تقنيات التعلم</h3>
                    <p className="text-white/70 text-sm">٢٣ متصل حاليًا</p>
                  </div>
                  <button className="px-3 py-1 bg-cyan-600/70 hover:bg-cyan-600 text-white rounded-md text-sm transition-colors">
                    انضم
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-white/70 italic">ستتطلب غرف المحادثة تسجيل الدخول قريبًا...</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatRooms;
