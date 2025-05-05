
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Book, Calendar, Clock, CheckCircle } from "lucide-react";

const StudyOrganization = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-green-900/40 to-green-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-white to-green-500 mb-10">
            تنظيم الدراسة
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-700/20 border-green-500/20 hover:border-green-400/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-green-900/30 backdrop-blur-sm">
                    <Calendar className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mr-4 mt-2">جدول الدراسة الأسبوعي</h2>
                </div>
                <p className="text-white/70 mb-4">
                  نظم وقتك وحدد أهدافك الدراسية بشكل أسبوعي لتحقيق أفضل النتائج
                </p>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>تخصيص وقت محدد لكل مادة</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>تحديد أوقات الراحة بين فترات الدراسة</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>مراجعة أسبوعية للمواد الأساسية</span>
                  </li>
                </ul>
                <div className="text-center mt-6">
                  <button className="px-4 py-2 bg-green-600/70 hover:bg-green-600 text-white rounded-md transition-colors">
                    إنشاء جدول دراسي
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-700/20 border-green-500/20 hover:border-green-400/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 rounded-full bg-green-900/30 backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mr-4 mt-2">تقنية بومودورو</h2>
                </div>
                <p className="text-white/70 mb-4">
                  استخدم تقنية بومودورو للدراسة بفعالية أكبر وتحسين التركيز
                </p>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>٢٥ دقيقة دراسة مركزة</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>٥ دقائق استراحة قصيرة</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 ml-2" />
                    <span>استراحة طويلة بعد ٤ دورات</span>
                  </li>
                </ul>
                <div className="text-center mt-6">
                  <button className="px-4 py-2 bg-green-600/70 hover:bg-green-600 text-white rounded-md transition-colors">
                    بدء المؤقت
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-700/20 border-green-500/20 mb-10">
            <CardContent className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-full bg-green-900/30 backdrop-blur-sm">
                  <Book className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mr-4 mt-2">نصائح لتنظيم الدراسة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-bold text-lg text-green-300 mb-2">البيئة المناسبة</h3>
                  <p className="text-white/70">اختر مكانًا هادئًا ومريحًا للدراسة، مع إضاءة مناسبة وتهوية جيدة. تأكد من إزالة جميع مصادر التشتيت مثل الهاتف والتلفاز.</p>
                </div>
                <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-bold text-lg text-green-300 mb-2">المذاكرة النشطة</h3>
                  <p className="text-white/70">استخدم أساليب المذاكرة النشطة مثل شرح المفاهيم بصوت عالٍ، كتابة الملخصات، وحل المشكلات بدلاً من القراءة فقط.</p>
                </div>
                <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-bold text-lg text-green-300 mb-2">تقسيم المهام</h3>
                  <p className="text-white/70">قسم المهام الكبيرة إلى خطوات صغيرة يمكن إدارتها بسهولة، وحدد أهدافًا واقعية لكل جلسة دراسة.</p>
                </div>
                <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="font-bold text-lg text-green-300 mb-2">المراجعة المنتظمة</h3>
                  <p className="text-white/70">خصص وقتًا للمراجعة المنتظمة للمادة التي تمت دراستها، فهذا يساعد على تثبيت المعلومات في الذاكرة طويلة المدى.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-white/70 italic">سيتم إضافة المزيد من الأدوات والنصائح لتنظيم الدراسة قريبًا...</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyOrganization;
