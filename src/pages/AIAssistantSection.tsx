import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Brain, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const clickSound = '/message-notification.mp3';

const AIAssistantSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('admin_teacher_access')
        .select('access_level')
        .eq('user_id', user.id)
        .single();

      setIsSuperAdmin(data?.access_level === 'super_admin');
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: "🚀 منشئ المنصات الذكي",
      icon: "🚀",
      description: "أنشئ موقعك الإلكتروني بالذكاء الاصطناعي - برمجة بدون كود بمساعدة AI متطور",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-cyan-600/20 to-blue-600/20",
      borderColor: "border-cyan-500/30",
      link: "/ai-platform-builder"
    },
    {
      title: "🇯🇴 مساعدك الأردني",
      icon: "🇯🇴",
      description: "مساعد ذكي متخصص في المنهاج الأردني - يجيب من الكتب المدرسية حصرياً",
      image: aiAssistantBg,
      color: "from-green-600/20 to-red-600/20",
      borderColor: "border-green-500/30",
      link: "/jordanian-assistant"
    },
    {
      title: "مرشدك النفسي",
      icon: "💙",
      description: "دعم نفسي ذكي يساعدك في فهم مشاعرك ويوجهك للقسم المناسب",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-pink-600/20 to-purple-600/20",
      borderColor: "border-pink-500/30",
      link: "/psychological-guide"
    },
    {
      title: t.platformCategories.falakAI,
      icon: "🌌",
      description: t.platformCategories.falakAIDescription,
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "border-indigo-500/30",
      link: "/falak-knowledge-ai"
    }
  ];

  return (
    <div className="min-h-screen relative" dir={dir}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={aiAssistantBg} 
          alt="AI Assistant Section"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-blue-950/90" />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Platforms Grid */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              قسم مساعدك الذكي
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5 + index * 0.15,
                }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  playSound();
                  navigate(platform.link);
                }}
                className={`group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer border-2 ${platform.borderColor} transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40`}
              >
                {/* Background Image */}
                <motion.div 
                  className="absolute inset-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src={platform.image} 
                    alt={platform.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/50 to-transparent" />
                </motion.div>

                {/* Glow Effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-8 z-10 flex flex-col justify-center items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: [0, -15, 15, -15, 0] }}
                    transition={{ duration: 0.6 }}
                    className="text-8xl mb-6 filter drop-shadow-2xl"
                  >
                    {platform.icon}
                  </motion.div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {platform.title}
                  </h3>

                  <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                    {platform.description}
                  </p>

                  {/* Admin Upload Button for Jordanian Assistant */}
                  {index === 1 && isSuperAdmin && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/upload-textbooks');
                      }}
                      className="mb-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      إدارة ورفع الكتب
                    </Button>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)" }}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 border border-purple-400/50 rounded-full text-white font-semibold backdrop-blur-sm"
                  >
                    <span>استكشف الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIAssistantSection;