
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScientificSimulations = () => {
  const navigate = useNavigate();

  const simulation = {
    id: 'blackbody-radiation',
    title: 'محاكاة إشعاع الجسم الأسود المتقدمة',
    description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع أدوات حسابية ومساعد ذكي',
    icon: <Atom className="w-12 h-12" />,
    color: 'from-purple-600 via-blue-600 to-cyan-600',
    features: [
      'الطيف المرئي الملون',
      'أدوات التكبير والتصغير',
      'حاسبات الطول الموجي والتردد',
      'مساعد ذكي للفيزياء',
      'واجهة تفاعلية متطورة'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة للرئيسية
            </Button>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                فلك المعرفة - محاكاة التجارب العلمية
              </h1>
              <p className="text-blue-200 mt-2">استكشف عالم الفيزياء من خلال المحاكاة التفاعلية المتطورة</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-300">
              محاكاة إشعاع الجسم الأسود التفاعلية
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              تجربة فيزيائية متكاملة لفهم قوانين بلانك وفين وستيفان-بولتزمان مع أدوات حسابية متطورة ومساعد ذكي
            </p>
          </div>
        </motion.div>

        {/* Simulation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className={`bg-gradient-to-br ${simulation.color} border-0 shadow-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105`}
            onClick={() => navigate(`/simulation/${simulation.id}`)}
          >
            <CardContent className="p-12 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8 backdrop-blur-sm mx-auto">
                  {simulation.icon}
                </div>
                
                <h3 className="text-3xl font-bold mb-6 text-white">
                  {simulation.title}
                </h3>
                
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  {simulation.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {simulation.features.map((feature, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <span className="text-white/90 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300 px-8 py-3 text-lg"
                >
                  ابدأ المحاكاة التفاعلية
                </Button>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Educational Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-blue-300">مميزات المحاكاة المتطورة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'الطيف المرئي', desc: 'عرض الألوان الحقيقية للطيف الكهرومغناطيسي' },
              { title: 'أدوات تفاعلية', desc: 'تكبير وتصغير وتحليل دقيق للبيانات' },
              { title: 'حاسبات فيزيائية', desc: 'حساب التردد والطول الموجي والطاقة' },
              { title: 'مساعد ذكي', desc: 'الإجابة على جميع الأسئلة الفيزيائية' }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScientificSimulations;
