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

interface Assignment {
  id: string;
  assignment_name: string;
  grade: string;
  section: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

const ParentAssignments = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('grade, section')
        .eq('user_id', user.id)
        .maybeSingle();

      if (parentError) throw parentError;

      if (!parentData) {
        navigate('/parent-registration');
        return;
      }

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('class_assignments')
        .select('*')
        .eq('grade', parentData.grade)
        .eq('section', parentData.section)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الواجبات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="واجبات الطالب - جسر التواصل"
        description="عرض واجبات الطالب"
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-cyan-500">
                {t.communicationBridge.assignments.title}
              </h1>
              <div className="w-16 h-1 bg-blue-500/50"></div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center text-white/60 py-12">
                {t.communicationBridge.assignments.noAssignments}
              </div>
            ) : (
              assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  {assignment.image_url && (
                    <img 
                      src={assignment.image_url} 
                      alt={assignment.assignment_name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{assignment.assignment_name}</h3>
                  <p className="text-blue-300 mb-2">الصف: {assignment.grade}{assignment.section}</p>
                  <p className="text-white/70 text-sm mb-4">{assignment.description}</p>
                  <p className="text-white/50 text-xs">
                    {new Date(assignment.created_at).toLocaleDateString('ar-SA')}
                  </p>
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

export default ParentAssignments;