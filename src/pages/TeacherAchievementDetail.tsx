import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Gamepad2, ExternalLink, FileText, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

interface Journal {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  cover_image_url: string;
  pdf_url: string;
  created_at: string | null;
}

const TEACHERS: Record<string, { name: string; subject: string; authorMatch: string[]; gameUrl?: string; gameTitle?: string }> = {
  'abdullah-rabbaa': {
    name: 'الأستاذ عبدالله عمر الرباع',
    subject: 'الرياضيات والفيزياء',
    authorMatch: ['عبدالله عمر الرباع', 'عبد الله عمر الرباع', 'عبدالله عمر مبارك الرباع'],
    gameUrl: '/games/abdullah-rabbaa-adventure.html',
    gameTitle: 'مغامرة الأساطير 3D — عالم الجبال',
  },
};

const TeacherAchievementDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const teacher = TEACHERS[slug];
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacher) return;
    (async () => {
      const orFilter = teacher.authorMatch.map(n => `author.ilike.%${n}%`).join(',');
      const { data } = await supabase
        .from('scientific_journals')
        .select('*')
        .or(orFilter)
        .order('created_at', { ascending: false });
      setJournals((data as Journal[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (!teacher) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-blue-950 text-white">
        المعلم غير موجود
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white">
      <SEO title={`${teacher.name} - إنجازات المعلمين`} description={`إنجازات ${teacher.name} في منصة ذروة العلم`} />
      <StarField />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <button onClick={() => navigate('/teacher-achievements')} className="flex items-center gap-2 text-white/70 hover:text-white mb-8">
          <ArrowRight size={20} />
          العودة للمعلمين
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 items-center justify-center shadow-2xl mb-5">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-amber-400 mb-2">
            {teacher.name}
          </h1>
          <p className="text-amber-200/90 text-lg">{teacher.subject}</p>
        </motion.div>

        {/* Game Section */}
        {teacher.gameUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <div className="flex items-center gap-3 mb-5">
              <Gamepad2 className="w-7 h-7 text-fuchsia-300" />
              <h2 className="text-2xl font-bold">اللعبة التفاعلية</h2>
            </div>
            <div className="relative overflow-hidden rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900/40 to-purple-950/60 p-6">
              <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    إنجاز أصلي
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{teacher.gameTitle}</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    لعبة ثلاثية الأبعاد تفاعلية تم تطويرها بواسطة {teacher.name} باستخدام Three.js — استكشف عالم الجبال وحقّق الإنجازات.
                  </p>
                  <a
                    href={teacher.gameUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-fuchsia-500/40 transition"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    ابدأ اللعب
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="w-full md:w-72 aspect-video rounded-2xl overflow-hidden border border-fuchsia-400/30 bg-black/40">
                  <iframe
                    src={teacher.gameUrl}
                    className="w-full h-full"
                    title={teacher.gameTitle}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Journals Section */}
        <section className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <BookOpen className="w-7 h-7 text-cyan-300" />
            <h2 className="text-2xl font-bold">المجلات العلمية المُضافة</h2>
            <span className="text-white/50 text-sm">({journals.length})</span>
          </div>

          {loading ? (
            <div className="text-center text-white/60 py-12">جارٍ التحميل...</div>
          ) : journals.length === 0 ? (
            <div className="text-center text-white/60 py-12 rounded-2xl border border-white/10 bg-white/5">
              لا توجد مجلات بعد
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {journals.map((j, i) => (
                <motion.a
                  key={j.id}
                  href={j.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-blue-950/70 border-2 border-cyan-500/30 hover:border-cyan-400/70 transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-blue-950/50">
                    {j.cover_image_url ? (
                      <img
                        src={j.cover_image_url}
                        alt={j.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <FileText className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-cyan-300 mb-1">{j.subject}</div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition line-clamp-2">{j.title}</h3>
                    {j.description && (
                      <p className="text-white/60 text-sm line-clamp-2">{j.description}</p>
                    )}
                    <div className="mt-3 inline-flex items-center gap-1 text-cyan-300 text-sm font-semibold">
                      فتح المجلة
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherAchievementDetail;
