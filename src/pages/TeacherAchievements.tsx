import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { SEO } from '@/components/SEO';

const teachers = [
  {
    slug: 'abdullah-rabbaa',
    name: 'الأستاذ عبدالله عمر الرباع',
    subject: 'الرياضيات والفيزياء',
    achievements: 'مجلات علمية متعددة + لعبة تفاعلية ثلاثية الأبعاد',
    color: 'from-amber-500 via-orange-500 to-rose-500',
  },
];

const TeacherAchievements: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white">
      <SEO title="إنجازات المعلمين للمنصة - ذروة العلم" description="إنجازات المعلمين المضافة لمنصة ذروة العلم" />
      <StarField />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white mb-8">
          <ArrowRight size={20} />
          رجوع
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/15 border border-amber-400/30 mb-4">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="text-amber-200 font-semibold">لوحة الشرف</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-amber-400 mb-3">
            إنجازات المعلمين للمنصة
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            صفحة تكريمية لمعلمي مدرسة عنبه الثانية الشاملة للبنين الذين أثروا منصة ذروة العلم بإسهاماتهم.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {teachers.map((t, i) => (
            <motion.button
              key={t.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(`/teacher-achievements/${t.slug}`)}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/50 to-blue-950/70 border-2 border-amber-500/30 hover:border-amber-400/70 p-8 text-right transition-all"
            >
              <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-2xl group-hover:opacity-40 transition`} />
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-xl mb-5`}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-300 transition">{t.name}</h3>
              <p className="text-amber-200/80 text-sm mb-3">{t.subject}</p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{t.achievements}</span>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm font-semibold">
                عرض الإنجازات
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
            </motion.button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherAchievements;
