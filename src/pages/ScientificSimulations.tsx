
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Sparkles, Waves, Beaker, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScientificSimulations = () => {
  const navigate = useNavigate();

  const simulations = [
    {
      id: 'blackbody-radiation',
      title: 'محاكاة إشعاع الجسم الأسود المتطورة',
      description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي وأدوات حسابية ومساعد ذكي',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-purple-600 via-blue-600 to-cyan-600',
      route: '/simulation/blackbody-radiation',
      features: [
        'التمثيل البياني مع الطيف المرئي',
        'أدوات التكبير والتصغير المتطورة',
        'حاسبات الطول الموجي والتردد والطاقة',
        'مساعد ذكي للفيزياء المتخصص',
        'واجهة تفاعلية بثلاث تبويبات'
      ]
    },
    {
      id: 'build-atom',
      title: 'تجربة بناء الذرة التفاعلية',
      description: 'تجربة شاملة لبناء الذرات من خلال سحب وإفلات الجسيمات الذرية واكتشاف خصائص العناصر',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-orange-600 via-red-600 to-pink-600',
      route: '/simulation/build-atom',
      features: [
        'سحب وإفلات البروتونات والنيوترونات والإلكترونات',
        'تحديد العنصر والأيون تلقائياً',
        'بناء سريع للعناصر الشائعة',
        'معلومات تفصيلية عن الذرة المبنية',
        'واجهة ثلاثية الأبعاد جذابة'
      ]
    },
    {
      id: 'lhc-simulation',
      title: 'مصادم الهدرونات الكبير (LHC)',
      description: 'محاكاة متقدمة تفاعلية لمصادم الهدرونات الكبير مع تصادمات البروتونات والكشف عن الجسيمات',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'from-cyan-500 via-blue-600 to-purple-600',
      route: '/lhc-simulation',
      features: [
        'تسريع الجسيمات إلى سرعة الضوء',
        'تصادمات عالية الطاقة (13 TeV)',
        'كشف الجسيمات الناتجة والبوزونات',
        'مغناطيسات فائقة التوصيل',
        'سيناريوهات جاهزة واختبارات تفاعلية'
      ]
    },
    {
      id: 'electromagnetic-waves',
      title: 'الموجات الكهرومغناطيسية',
      description: 'استكشاف الطيف الكهرومغناطيسي الكامل من موجات الراديو إلى أشعة غاما مع تفاعلات حية',
      icon: <Waves className="w-12 h-12" />,
      color: 'from-red-500 via-green-500 to-purple-600',
      route: '/electromagnetic-waves',
      features: [
        'عرض الطيف الكامل بالألوان الحقيقية',
        'التحكم في التردد والطول الموجي',
        'تطبيقات عملية لكل نوع موجة',
        'رسوم متحركة للمجالات الكهربائية والمغناطيسية',
        'اختبارات تفاعلية وحقائق علمية'
      ]
    },
    {
      id: 'nuclear-reactions',
      title: 'التفاعلات النووية',
      description: 'محاكاة خرافية للانشطار والاندماج النووي مع تأثيرات بصرية مذهلة وطاقة هائلة',
      icon: <Atom className="w-12 h-12" />,
      color: 'from-green-500 via-purple-500 to-blue-500',
      route: '/nuclear-reactions',
      features: [
        'محاكاة انشطار اليورانيوم-235 بتفاصيل دقيقة',
        'اندماج الديوتيريوم-تريتيوم كما في الشمس',
        'رسوم متحركة خرافية للجسيمات النووية',
        'مقارنة الطاقة المنطلقة مع التفاعلات الكيميائية',
        'اختبارات تعليمية شاملة'
      ]
    },
    {
      id: 'chemical-reactions',
      title: 'التفاعلات الكيميائية ثلاثية الأبعاد',
      description: 'استكشف عالم الكيمياء من خلال محاكاة تفاعلية ثلاثية الأبعاد تُظهر تكوين الجزيئات والروابط الكيميائية بشكل مرئي',
      icon: <Beaker className="w-12 h-12" />,
      color: 'from-chemistry-primary via-purple-500 to-blue-500',
      route: '/chemical-reactions',
      features: [
        '30+ تفاعل كيميائي من البسيط للمعقد',
        'رسوم متحركة ثلاثية الأبعاد متقدمة',
        'تصور تكوين وكسر الروابط الكيميائية',
        'من تكوين الماء إلى جزيئات الجسم المعقدة',
        'اختبارات تفاعلية شاملة'
      ]
    },
    {
      id: 'fourier-series',
      title: 'سلسلة فورييه التفاعلية',
      description: 'حساب وتمثيل سلسلة فورييه مع كشف ظاهرة غيبس وتحليل الدوال القطعية',
      icon: <Activity className="w-12 h-12" />,
      color: 'from-indigo-500 via-purple-500 to-pink-600',
      route: '/fourier-series',
      features: [
        'إدخال دوال عادية أو قطعية (piecewise)',
        'لوحة رموز رياضية متقدمة',
        '10+ أمثلة جاهزة (موجة مربعة، مثلثية، منشارية)',
        'رسم بياني مقارن: الدالة الأصلية vs التقريب',
        'حساب تلقائي لمعاملات a₀, aₙ, bₙ',
        'كشف تلقائي لنقاط عدم الاستمرار',
        'كشف ظاهرة غيبس مع نسبة التجاوز',
        'عرض رمزي للصيغة الرياضية',
        'تحكم بعدد الحدود N (1-100)',
        'أنيميشن تطور التقريب',
        'دليل تعليمي شامل'
      ]
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
              تجارب علمية تفاعلية متطورة
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              مجموعة متكاملة من المحاكيات العلمية التفاعلية لفهم المفاهيم الفيزيائية بصورة عملية وممتعة
            </p>
          </div>
        </motion.div>

        {/* Simulations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {simulations.map((simulation, index) => (
            <motion.div
              key={simulation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card 
                className={`bg-gradient-to-br ${simulation.color} border-0 shadow-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 h-full`}
                onClick={() => navigate(simulation.route)}
              >
                <CardContent className="p-8 relative h-full flex flex-col">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center flex-1 flex flex-col">
                    <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm mx-auto">
                      {simulation.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {simulation.title}
                    </h3>
                    
                    <p className="text-white/90 text-base leading-relaxed mb-6 flex-1">
                      {simulation.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {simulation.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <span className="text-white/90 font-medium text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300 px-6 py-3 text-base mt-auto"
                    >
                      ابدأ التجربة التفاعلية
                    </Button>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Educational Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-blue-300">مميزات المحاكاة المتطورة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'تفاعلية كاملة', desc: 'تحكم كامل في جميع المعاملات والمتغيرات' },
              { title: 'رسوم بيانية متطورة', desc: 'تمثيل بصري دقيق للمفاهيم العلمية' },
              { title: 'حاسبات فيزيائية', desc: 'أدوات حسابية متقدمة للقوانين الفيزيائية' },
              { title: 'مساعد ذكي', desc: 'دعم تعليمي متخصص لكل تجربة' }
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
