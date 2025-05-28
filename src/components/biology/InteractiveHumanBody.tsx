import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Info, X, Eye, EyeOff, Heart, Brain, Activity } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface OrganInfo {
  id: string;
  name: string;
  description: string;
  function: string;
  components: string[];
  anatomicalLocation: string;
  commonDiseases: string[];
  funFacts: string[];
}

const InteractiveHumanBody = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [showSkinLayer, setShowSkinLayer] = useState(true);
  const [highlightedOrgan, setHighlightedOrgan] = useState<string | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // بيانات الأعضاء المحسّنة
  const organs: OrganInfo[] = [
    {
      id: 'brain',
      name: 'الدماغ',
      description: 'مركز التحكم الرئيسي في الجسم والمسؤول عن جميع العمليات العقلية',
      function: 'التحكم في جميع وظائف الجسم، التفكير، الذاكرة، العواطف، والحركة',
      components: ['المخ الكبير', 'المخيخ', 'جذع الدماغ', 'الغدة النخامية', 'المهاد', 'الحصين'],
      anatomicalLocation: 'داخل الجمجمة في الرأس',
      commonDiseases: ['السكتة الدماغية', 'الصداع النصفي', 'الزهايمر', 'الصرع'],
      funFacts: ['يستهلك 20% من طاقة الجسم', 'يحتوي على 86 مليار خلية عصبية', 'يزن حوالي 1.4 كيلوغرام']
    },
    {
      id: 'heart',
      name: 'القلب',
      description: 'العضلة المسؤولة عن ضخ الدم إلى جميع أنحاء الجسم',
      function: 'ضخ الدم المحمل بالأكسجين والمواد الغذائية إلى كافة أعضاء الجسم',
      components: ['الأذين الأيمن', 'الأذين الأيسر', 'البطين الأيمن', 'البطين الأيسر', 'الصمامات القلبية'],
      anatomicalLocation: 'في القفص الصدري، خلف عظم القص وإلى اليسار قليلاً',
      commonDiseases: ['النوبة القلبية', 'قصور القلب', 'عدم انتظام ضربات القلب', 'ارتفاع ضغط الدم'],
      funFacts: ['ينبض حوالي 100,000 مرة يومياً', 'يضخ 5-6 لترات من الدم في الدقيقة', 'بحجم قبضة اليد تقريباً']
    },
    {
      id: 'lungs',
      name: 'الرئتان',
      description: 'أعضاء التنفس المسؤولة عن تبادل الغازات',
      function: 'استقبال الأكسجين من الهواء وطرد ثاني أكسيد الكربون من الدم',
      components: ['الفصوص الرئوية', 'الحويصلات الهوائية', 'الشعب الهوائية', 'الغشاء الجنبي'],
      anatomicalLocation: 'في القفص الصدري، على جانبي القلب',
      commonDiseases: ['الالتهاب الرئوي', 'الربو', 'السل', 'سرطان الرئة'],
      funFacts: ['تحتوي على 300 مليون حويصلة هوائية', 'مساحة السطح الداخلي تعادل ملعب تنس', 'نتنفس حوالي 20,000 مرة يومياً']
    },
    {
      id: 'liver',
      name: 'الكبد',
      description: 'أكبر غدة في الجسم والمسؤولة عن مئات الوظائف الحيوية',
      function: 'تنقية الدم، إنتاج البروتينات، تخزين الطاقة، وتصنيع الصفراء',
      components: ['الفص الأيمن', 'الفص الأيسر', 'الأوردة الكبدية', 'القنوات الصفراوية'],
      anatomicalLocation: 'في الجزء العلوي الأيمن من البطن، تحت الحجاب الحاجز',
      commonDiseases: ['التهاب الكبد', 'تشمع الكبد', 'الكبد الدهني', 'حصوات المرارة'],
      funFacts: ['يؤدي أكثر من 500 وظيفة', 'يمكنه تجديد نفسه', 'يزن حوالي 1.5 كيلوغرام']
    },
    {
      id: 'stomach',
      name: 'المعدة',
      description: 'كيس عضلي يقوم بهضم الطعام كيميائياً وميكانيكياً',
      function: 'هضم الطعام بواسطة الأحماض والإنزيمات وتحويله إلى كتلة طعامية',
      components: ['القاع', 'الجسم', 'الغار', 'العضلة العاصرة', 'الغدد المعدية'],
      anatomicalLocation: 'في الجزء العلوي الأيسر من البطن، تحت الحجاب الحاجز',
      commonDiseases: ['قرحة المعدة', 'التهاب المعدة', 'ارتجاع المريء', 'سرطان المعدة'],
      funFacts: ['تنتج 1.5-3 لترات من العصارة المعدية يومياً', 'يمكنها التمدد لتتسع لـ 1.5 لتر من الطعام', 'تتجدد بطانتها كل 3-5 أيام']
    },
    {
      id: 'kidneys',
      name: 'الكليتان',
      description: 'أعضاء تنقية الدم وتنظيم توازن السوائل في الجسم',
      function: 'تنقية الدم من السموم، تنظيم ضغط الدم، وإنتاج البول',
      components: ['القشرة الكلوية', 'اللب الكلوي', 'الحوض الكلوي', 'النيفرونات'],
      anatomicalLocation: 'في الجزء الخلفي من البطن، على جانبي العمود الفقري',
      commonDiseases: ['حصوات الكلى', 'التهاب الكلى', 'الفشل الكلوي', 'ارتفاع ضغط الدم الكلوي'],
      funFacts: ['تنقيان 180 لتراً من الدم يومياً', 'تحتوي كل كلية على مليون نيفرون', 'يمكن العيش بكلية واحدة فقط']
    }
  ];

  // إعدادات التكبير
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5));
  const handleReset = () => {
    setZoom(1);
    setSelectedOrgan(null);
    setHighlightedOrgan(null);
  };

  // معالجة النقر على الأعضاء
  const handleOrganClick = (organ: OrganInfo) => {
    setSelectedOrgan(organ);
    setHighlightedOrgan(organ.id);
  };

  // مكون القلب النابض
  const HeartComponent = () => (
    <g id="heart-container">
      <motion.path
        d="M220 180 C210 170 195 170 195 185 C195 200 220 220 220 220 C220 220 245 200 245 185 C245 170 230 170 220 180 Z"
        fill="#ff4757"
        stroke="#ff3742"
        strokeWidth="2"
        animate={animationsEnabled ? {
          scale: [1, 1.1, 1],
          fill: ["#ff4757", "#ff6b7a", "#ff4757"]
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'heart')!)}
        onMouseEnter={() => setHighlightedOrgan('heart')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
      {/* أوعية دموية */}
      <motion.path
        d="M220 170 Q200 160 190 150 M220 170 Q240 160 250 150"
        stroke="#ff4757"
        strokeWidth="4"
        fill="none"
        animate={animationsEnabled ? {
          strokeDashoffset: [0, -20, 0]
        } : {}}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
        strokeDasharray="10 10"
      />
    </g>
  );

  // مكون الرئتين المتنفستين
  const LungsComponent = () => (
    <g id="lungs-container">
      {/* الرئة اليمنى */}
      <motion.ellipse
        cx="190" cy="190" rx="25" ry="40"
        fill="#ff9ff3"
        stroke="#f368e0"
        strokeWidth="2"
        animate={animationsEnabled ? {
          rx: [25, 28, 25],
          ry: [40, 43, 40],
          fill: ["#ff9ff3", "#fbc2eb", "#ff9ff3"]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'lungs')!)}
        onMouseEnter={() => setHighlightedOrgan('lungs')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
      {/* الرئة اليسرى */}
      <motion.ellipse
        cx="250" cy="190" rx="25" ry="40"
        fill="#ff9ff3"
        stroke="#f368e0"
        strokeWidth="2"
        animate={animationsEnabled ? {
          rx: [25, 28, 25],
          ry: [40, 43, 40],
          fill: ["#ff9ff3", "#fbc2eb", "#ff9ff3"]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'lungs')!)}
        onMouseEnter={() => setHighlightedOrgan('lungs')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
      {/* القصبة الهوائية */}
      <rect x="218" y="140" width="4" height="30" fill="#f368e0" rx="2" />
    </g>
  );

  // مكون الدماغ
  const BrainComponent = () => (
    <g id="brain-container">
      <motion.path
        d="M220 70 C200 60 180 70 185 90 C180 95 185 105 200 100 C210 110 230 110 240 100 C255 105 260 95 255 90 C260 70 240 60 220 70 Z"
        fill="#a29bfe"
        stroke="#6c5ce7"
        strokeWidth="2"
        animate={animationsEnabled ? {
          fill: ["#a29bfe", "#fd79a8", "#a29bfe"]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'brain')!)}
        onMouseEnter={() => setHighlightedOrgan('brain')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
      {/* خطوط النشاط العصبي */}
      <motion.g
        animate={animationsEnabled ? {
          opacity: [0.3, 1, 0.3]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      >
        <path d="M200 80 Q220 75 240 80" stroke="#74b9ff" strokeWidth="1" fill="none" />
        <path d="M190 90 Q220 85 250 90" stroke="#74b9ff" strokeWidth="1" fill="none" />
      </motion.g>
    </g>
  );

  // مكون الكبد
  const LiverComponent = () => (
    <g id="liver-container">
      <motion.path
        d="M250 250 L300 250 Q320 250 320 270 L320 290 Q320 310 300 310 L260 310 Q250 310 250 300 Z"
        fill="#ffeaa7"
        stroke="#fdcb6e"
        strokeWidth="2"
        animate={animationsEnabled ? {
          fill: ["#ffeaa7", "#ffeaa7", "#fff200", "#ffeaa7"]
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'liver')!)}
        onMouseEnter={() => setHighlightedOrgan('liver')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
    </g>
  );

  // مكون المعدة
  const StomachComponent = () => (
    <g id="stomach-container">
      <motion.path
        d="M180 250 Q170 240 175 255 Q170 270 180 275 Q190 280 200 275 Q210 270 205 255 Q200 240 190 245 Q185 240 180 250 Z"
        fill="#ff7675"
        stroke="#e84393"
        strokeWidth="2"
        animate={animationsEnabled ? {
          fill: ["#ff7675", "#fd79a8", "#ff7675"]
        } : {}}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'stomach')!)}
        onMouseEnter={() => setHighlightedOrgan('stomach')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
    </g>
  );

  // مكون الكليتين
  const KidneysComponent = () => (
    <g id="kidneys-container">
      {/* الكلية اليمنى */}
      <motion.ellipse
        cx="180" cy="320" rx="15" ry="25"
        fill="#74b9ff"
        stroke="#0984e3"
        strokeWidth="2"
        animate={animationsEnabled ? {
          fill: ["#74b9ff", "#a29bfe", "#74b9ff"]
        } : {}}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'kidneys')!)}
        onMouseEnter={() => setHighlightedOrgan('kidneys')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
      {/* الكلية اليسرى */}
      <motion.ellipse
        cx="260" cy="320" rx="15" ry="25"
        fill="#74b9ff"
        stroke="#0984e3"
        strokeWidth="2"
        animate={animationsEnabled ? {
          fill: ["#74b9ff", "#a29bfe", "#74b9ff"]
        } : {}}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="cursor-pointer drop-shadow-lg"
        onClick={() => handleOrganClick(organs.find(o => o.id === 'kidneys')!)}
        onMouseEnter={() => setHighlightedOrgan('kidneys')}
        onMouseLeave={() => setHighlightedOrgan(null)}
      />
    </g>
  );

  // طبقة الجلد الشفافة
  const SkinLayer = () => (
    <g id="skin-layer" opacity={showSkinLayer ? 0.8 : 0}>
      {/* الرأس */}
      <circle cx="220" cy="70" r="45" fill="rgba(222, 195, 175, 0.6)" stroke="rgba(205, 175, 155, 0.8)" strokeWidth="2" />
      {/* الرقبة */}
      <rect x="210" y="115" width="20" height="25" fill="rgba(222, 195, 175, 0.6)" />
      {/* الجذع */}
      <ellipse cx="220" cy="220" rx="60" ry="80" fill="rgba(222, 195, 175, 0.6)" stroke="rgba(205, 175, 155, 0.8)" strokeWidth="2" />
      {/* الذراعان */}
      <ellipse cx="140" cy="180" rx="15" ry="50" fill="rgba(222, 195, 175, 0.6)" />
      <ellipse cx="300" cy="180" rx="15" ry="50" fill="rgba(222, 195, 175, 0.6)" />
      {/* الساقان */}
      <ellipse cx="190" cy="350" rx="18" ry="60" fill="rgba(222, 195, 175, 0.6)" />
      <ellipse cx="250" cy="350" rx="18" ry="60" fill="rgba(222, 195, 175, 0.6)" />
    </g>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          جسم الإنسان التفاعلي المتطور
        </h2>
        <p className="text-white/80 text-lg">
          استكشف جسم الإنسان بتقنية ثلاثية الأبعاد مع أنيميشنات حية وتفاصيل دقيقة
        </p>
      </div>

      {/* شريط الأدوات */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <Button onClick={handleZoomIn} className="bg-green-600 hover:bg-green-700 transition-all duration-300">
          <ZoomIn className="w-4 h-4 mr-2" />
          تكبير
        </Button>
        <Button onClick={handleZoomOut} className="bg-green-600 hover:bg-green-700 transition-all duration-300">
          <ZoomOut className="w-4 h-4 mr-2" />
          تصغير
        </Button>
        <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
          <RotateCcw className="w-4 h-4 mr-2" />
          إعادة تعيين
        </Button>
        <Button 
          onClick={() => setShowSkinLayer(!showSkinLayer)} 
          variant={showSkinLayer ? "default" : "outline"}
          className="bg-purple-600 hover:bg-purple-700 transition-all duration-300"
        >
          {showSkinLayer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showSkinLayer ? 'إخفاء الجلد' : 'إظهار الجلد'}
        </Button>
        <Button 
          onClick={() => setAnimationsEnabled(!animationsEnabled)} 
          variant={animationsEnabled ? "default" : "outline"}
          className="bg-pink-600 hover:bg-pink-700 transition-all duration-300"
        >
          <Heart className="w-4 h-4 mr-2" />
          {animationsEnabled ? 'إيقاف الحركة' : 'تشغيل الحركة'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* المجسم الرئيسي */}
        <div className="flex-1">
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-green-500/30 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <motion.div
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                  className="transition-transform duration-300"
                >
                  <svg
                    width="440"
                    height="500"
                    viewBox="0 0 440 500"
                    className="max-w-full h-auto drop-shadow-2xl"
                  >
                    {/* خلفية متدرجة */}
                    <defs>
                      <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.1)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                      </radialGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <rect width="100%" height="100%" fill="url(#bodyGradient)" />
                    
                    {/* الهيكل العظمي الخفيف */}
                    <g opacity="0.2">
                      <rect x="215" y="140" width="10" height="200" fill="#e0e0e0" /> {/* العمود الفقري */}
                      <ellipse cx="220" cy="170" rx="50" ry="20" fill="#e0e0e0" /> {/* القفص الصدري */}
                    </g>
                    
                    {/* الأعضاء */}
                    <BrainComponent />
                    <HeartComponent />
                    <LungsComponent />
                    <LiverComponent />
                    <StomachComponent />
                    <KidneysComponent />
                    
                    {/* طبقة الجلد */}
                    <SkinLayer />
                    
                    {/* تأثيرات الإضاءة */}
                    {highlightedOrgan && (
                      <motion.circle
                        cx="220" cy="250" r="150"
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.5)"
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </svg>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نافذة المعلومات */}
        <AnimatePresence>
          {selectedOrgan && (
            <motion.div
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full lg:w-96"
            >
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/30 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Info className="w-6 h-6 mr-3 text-green-400" />
                      </motion.div>
                      {selectedOrgan.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrgan(null)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="font-semibold text-green-400 mb-3 text-lg">📍 الموقع التشريحي:</h4>
                      <p className="text-white/90 text-sm leading-relaxed bg-green-900/20 p-3 rounded-lg">
                        {selectedOrgan.anatomicalLocation}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-semibold text-blue-400 mb-3 text-lg">📋 الوصف:</h4>
                      <p className="text-white/90 text-sm leading-relaxed bg-blue-900/20 p-3 rounded-lg">
                        {selectedOrgan.description}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-semibold text-purple-400 mb-3 text-lg">⚙️ الوظيفة:</h4>
                      <p className="text-white/90 text-sm leading-relaxed bg-purple-900/20 p-3 rounded-lg">
                        {selectedOrgan.function}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="font-semibold text-yellow-400 mb-3 text-lg">🔧 المكونات الرئيسية:</h4>
                      <div className="bg-yellow-900/20 p-3 rounded-lg">
                        <ul className="list-disc list-inside text-white/90 text-sm space-y-2">
                          {selectedOrgan.components.map((component, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="hover:text-yellow-300 transition-colors"
                            >
                              {component}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h4 className="font-semibold text-red-400 mb-3 text-lg">🚨 أمراض شائعة:</h4>
                      <div className="bg-red-900/20 p-3 rounded-lg">
                        <ul className="list-disc list-inside text-white/90 text-sm space-y-2">
                          {selectedOrgan.commonDiseases.map((disease, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="hover:text-red-300 transition-colors"
                            >
                              {disease}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h4 className="font-semibold text-cyan-400 mb-3 text-lg">💡 حقائق مدهشة:</h4>
                      <div className="bg-cyan-900/20 p-3 rounded-lg">
                        <ul className="list-disc list-inside text-white/90 text-sm space-y-2">
                          {selectedOrgan.funFacts.map((fact, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="hover:text-cyan-300 transition-colors"
                            >
                              {fact}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="text-center text-white/60 text-sm bg-slate-800/50 p-4 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="mb-2">🖱️ انقر على أي عضو لاستكشاف تفاصيله • 🔍 استخدم أزرار التكبير والتصغير</p>
        <p>👁️ تحكم في طبقة الجلد • ❤️ شاهد الأعضاء وهي تعمل بشكل حي</p>
      </motion.div>
    </div>
  );
};

export default InteractiveHumanBody;
