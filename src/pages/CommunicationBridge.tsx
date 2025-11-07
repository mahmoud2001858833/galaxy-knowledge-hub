import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Users, UserCheck } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

const CommunicationBridge = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [selectedType, setSelectedType] = useState<'teacher' | 'parent' | null>(null);

  const userTypes = [
    {
      type: 'teacher' as const,
      title: t.communicationBridge.teacher,
      icon: <Users className="w-16 h-16 mb-4" />,
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      description: "للمعلمين: إدارة الواجبات والملاحظات والتواصل مع أولياء الأمور"
    },
    {
      type: 'parent' as const,
      title: t.communicationBridge.parent,
      icon: <UserCheck className="w-16 h-16 mb-4" />,
      color: "from-teal-600/20 to-emerald-600/20",
      borderColor: "border-teal-500/30",
      hoverBorderColor: "hover:border-teal-500/50",
      description: "لأولياء الأمور: متابعة واجبات الطلاب والملاحظات والتواصل مع المعلمين"
    }
  ];

  const handleTypeSelect = (type: 'teacher' | 'parent') => {
    setSelectedType(type);
    if (type === 'teacher') {
      navigate('/teacher-registration');
    } else {
      navigate('/parent-registration');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="جسر التواصل"
        description="منصة تواصل تفاعلية بين المعلمين وأولياء الأمور لمتابعة الطلاب وإدارة الواجبات والملاحظات"
        keywords="جسر التواصل, تواصل معلمين, أولياء أمور, واجبات مدرسية, ملاحظات طلاب"
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
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                {t.communicationBridge.title}
              </h1>
              <div className="w-16 h-1 bg-teal-500/50 mx-auto mb-4"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                {t.communicationBridge.subtitle}
              </p>
            </div>
          </motion.div>

          {/* User Type Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
              {t.communicationBridge.selectUserType}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {userTypes.map((userType, index) => (
                <motion.div
                  key={userType.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  onClick={() => handleTypeSelect(userType.type)}
                  className={`group relative p-8 rounded-xl cursor-pointer ${userType.borderColor} ${userType.hoverBorderColor} border-2 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 hover:scale-105 bg-background/5 backdrop-blur-sm`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-radial ${userType.color} opacity-50 rounded-xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="text-teal-400 group-hover:text-teal-300 transition-colors">
                      {userType.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                      {userType.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-6">
                      {userType.description}
                    </p>
                    <Button 
                      className="bg-teal-600/30 border border-teal-500/50 text-teal-300 hover:bg-teal-600/50"
                    >
                      اختيار
                    </Button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-400/10 to-teal-500/0 rounded-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunicationBridge;