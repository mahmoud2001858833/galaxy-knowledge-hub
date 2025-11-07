import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  teacher_name: string;
  class_section: string;
  student_name: string;
  parent_name: string;
  description: string;
  created_at: string;
}

const ParentNotes = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('student_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (parentError) throw parentError;

      if (!parentData) {
        navigate('/parent-registration');
        return;
      }

      setStudentName(parentData.student_name);

      const { data: notesData, error: notesError } = await supabase
        .from('class_notes')
        .select('*')
        .eq('student_name', parentData.student_name)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الملاحظات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="ملاحظات الطالب - جسر التواصل"
        description="عرض ملاحظات الطالب"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/parent-dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-white to-orange-500">
                {t.communicationBridge.notes.title}
              </h1>
              <div className="w-16 h-1 bg-yellow-500/50"></div>
              {studentName && (
                <p className="text-white/70 mt-4">ملاحظات الطالب: {studentName}</p>
              )}
            </div>
          </motion.div>

          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                {t.communicationBridge.notes.noNotes}
              </div>
            ) : (
              notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-yellow-300 text-sm">المعلم</p>
                      <p className="text-white font-semibold">{note.teacher_name}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 text-sm">الصف والشعبة</p>
                      <p className="text-white font-semibold">{note.class_section}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 text-sm">التاريخ</p>
                      <p className="text-white font-semibold">
                        {new Date(note.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-yellow-300 text-sm mb-2">وصف المشكلة</p>
                    <p className="text-white/80">{note.description}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParentNotes;