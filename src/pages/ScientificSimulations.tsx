import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Flame, Beaker, Magnet, Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScientificSimulations = () => {
  const navigate = useNavigate();

  const simulations = [
    {
      id: 'blackbody-radiation',
      title: 'محاكاة إشعاع الجسم الأسود المتقدمة',
      description: 'محاكاة تفاعلية لإشعاع الجسم الأسود مع أدوات متقدمة لتحليل الطيف والحرارة',
      icon: <Atom className="w-8 h-8" />,
      color: 'from-purple-600 to-blue-600',
      available: true
    },
    {
      id: 'chemical-reactions',
      title: 'محاكاة التفاعلات الكيميائية',
      description: 'تجارب كيميائية تفاعلية مع رسوم متحركة ثلاثية الأبعاد',
      icon: <Beaker className="w-8 h-8" />,
      color: 'from-green-600 to-teal-600',
      available: false
    },
    {
      id: 'newton-laws',
      title: 'قوانين نيوتن للحركة',
      description: 'محاكاة تفاعلية لقوانين الحركة والقوى',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-yellow-600 to-orange-600',
      available: false
    },
    {
      id: 'electromagnetic',
      title: 'الكهرباء والمغناطيسية',
      description: 'محاكاة المجالات الكهربائية والمغناطيسية',
      icon: <Magnet className="w-8 h-8" />,
      color: 'from-red-600 to-pink-600',
      available: false
    },
    {
      id: 'wave-physics',
      title: 'فيزياء الموجات',
      description: 'محاكاة انتشار الموجات والتداخل',
      icon: <Waves className="w-8 h-8" />,
      color: 'from-cyan-600 to-blue-600',
      available: false
    },
    {
      id: 'thermodynamics',
      title: 'الديناميكا الحرارية',
      description: 'محاكاة الحرارة وانتقالها والغازات المثالية',
      icon: <Flame className="w-8 h-8" />,
      color: 'from-orange-600 to-red-600',
      available: false
    }
  ];

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
              <p className="text-blue-200 mt-2">استكشف عالم العلوم من خلال المحاكاة التفاعلية المتطورة</p>
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
              منصة المحاكاة العلمية التفاعلية
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              اكتشف أسرار الفيزياء والكيمياء من خلال تجارب محاكاة متطورة تتيح لك التحكم في المتغيرات 
              ومشاهدة النتائج فوراً. منصة تعليمية مصممة خصيصاً للطلاب من المرحلة الأساسية حتى الثانوية.
            </p>
          </div>
        </motion.div>

        {/* Simulations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {simulations.map((simulation, index) => (
            <motion.div
              key={simulation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full bg-gradient-to-br ${simulation.color} border-0 shadow-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 ${!simulation.available ? 'opacity-60' : ''}`}
                onClick={() => simulation.available && navigate(`/simulation/${simulation.id}`)}
              >
                <CardContent className="p-8 relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                      {simulation.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {simulation.title}
                    </h3>
                    
                    <p className="text-white/90 text-sm leading-relaxed mb-6">
                      {simulation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        simulation.available 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {simulation.available ? 'متاح الآن' : 'قريباً'}
                      </span>
                      
                      {simulation.available && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 transition-colors"
                        >
                          ابدأ المحاكاة
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-blue-300">مميزات المنصة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'واجهة تفاعلية', desc: 'تحكم كامل في المتغيرات' },
              { title: 'رسوم بيانية متقدمة', desc: 'تمثيل بصري للبيانات' },
              { title: 'أدوات القياس', desc: 'أدوات دقيقة للتحليل' },
              { title: 'تصدير البيانات', desc: 'حفظ ومشاركة النتائج' }
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
