import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Cpu, 
  Code2, 
  BrainCircuit, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Layers, 
  Award, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Terminal,
  Compass,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface PathwayLevel {
  id: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  tag: string;
  badgeName: string;
  color: string;
  glowColor: string;
  icon: any;
  duration: string;
  targetAudience: string;
  theorySkills: string[];
  hardwareSkills: string[];
  softwareSkills: string[];
  capstoneProject: {
    title: string;
    description: string;
    hardware: string[];
    outcome: string;
  };
}

export const PATHWAY_LEVELS: PathwayLevel[] = [
  {
    id: 'foundation',
    levelNumber: 1,
    title: 'المسار التأسيسي: المنطق البرمجي والميكانيكا الأولية',
    subtitle: 'Block Logic, Computational Thinking & Physical Computing',
    tag: 'مبتدئ / أساسي',
    badgeName: 'شارة مستكشف الروبوتات الأول',
    color: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    icon: Bot,
    duration: '4 - 6 أسابيع',
    targetAudience: 'المبتدئون وطلاب المدارس المهتمون بالروبوتات',
    theorySkills: [
      'مفهوم الحلقة المغلقة (Closed-Loop) وحلقة التحكم (Feedback Loop)',
      'الفرق بين المحركات (Motors) والحساسات (Sensors) والمتحكمات (Controllers)',
      'المنطق الشرطي وتفرع الأوامر (If-Else) والتكرار (Loops)',
      'مبادئ التروس ونسب السرعة والعزم (Gear Ratios & Torque)'
    ],
    hardwareSkills: [
      'توصيل حساس المسافة بالموجات فوق الصوتية (Ultrasonic)',
      'التحكم بمحرك سيرفو بزاوية محددة (Micro Servo 9g)',
      'لوحات التجارب (Breadboard) وتوصيل المقاومات وLEDs',
      'فهم الجهد (Voltage) والتيار (Current) وحماية الدائرة'
    ],
    softwareSkills: [
      'البرمجة الكتلية المرئية (Blockly / Scratch for Arduino)',
      'تحويل البلوكات إلى كود C++ خطوة بخطوة',
      'قراءة المتغيرات وطباعة القيم التسلسلية (Serial Monitor)',
      'محاكاة حركة روبوت ثنائي العجلات داخل مضمار افتراضي'
    ],
    capstoneProject: {
      title: 'روبوت تجنب العوائق الذكي (Smart Bumper Bot)',
      description: 'مركبة ذات عجلتين مع حساس مسافة أمامي، ترصد العقبة على بعد 20 سم، تتوقف، تقيس المسافة يساراً ويميناً ثم تنعطف نحو المسار الخالي.',
      hardware: ['Arduino Nano', 'HC-SR04', 'L298N Mini', '2x DC Motors', 'Battery 9V/18650'],
      outcome: 'فهم عملي كامل لدورة: استشعار ← معالجة منطقية ← استجابة حركية'
    }
  },
  {
    id: 'embedded-iot',
    levelNumber: 2,
    title: 'مسار الأنظمة المدمجة وإنترنت الأشياء (IoT & Embedded C++)',
    subtitle: 'Microcontrollers, Sensor Fusion & Cloud Connectivity',
    tag: 'متوسط / تطبيقي',
    badgeName: 'مهندس الأنظمة المدمجة وإنترنت الأشياء',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    icon: Cpu,
    duration: '6 - 8 أسابيع',
    targetAudience: 'المبرمجون وهواة العتاد الراغبون بربط الروبوت بالسحابة',
    theorySkills: [
      'المقاطعات البرمجية والعتادية (Hardware & Software Interrupts)',
      'بروتوكولات الاتصال التسلسلي الصناعية (UART, I2C, SPI)',
      'معمارية وحدات التحكم ESP32 ثنائية النواة وFreeRTOS',
      'بروتوكولات إنترنت الأشياء الخفيفة (MQTT, WebSockets, REST APIs)'
    ],
    hardwareSkills: [
      'برمجة شاشات I2C OLED لعرض حالة الروبوت والبطارية',
      'توصيل مصفوفة حساسات المسار بالأشعة تحت الحمراء (Line Tracking Array)',
      'التحكم الدقيق عبر إشارات التضمين النبضي (PWM) لتنظيم السرعة',
      'إدارة الطاقة وأنماط النوم العميق (Deep Sleep Mode) لترشيد الاستهلاك'
    ],
    softwareSkills: [
      'كتابة كود C++ نظيف ومنظم بدون دوال delay() المعطلة للمعالج',
      'إنشاء لوحة تحكم على المتصفح عبر Web Server داخلي بالـ ESP32',
      'نشر واستقبال رسائل القيادة عن بعد عبر وسيط MQTT السحابي',
      'تطبيق خوارزمية التحكم التناسبي التكاملي التفاضلي (PID) لتتبع الخط بسلاسة'
    ],
    capstoneProject: {
      title: 'محطة الرصد البيئي والروبوت الميداني المتصل بالسحابة',
      description: 'نظام متكامل يضم حساسات بيئية وروبوت استطلاع يبث قراءات الحرارة، الغاز، ومستوى البطارية إلى داشبورد سحابي حي مع إمكانية توجيهه عن بعد.',
      hardware: ['ESP32 NodeMCU', 'DHT22', 'MQ-135', 'OLED 0.96"', 'Servo Pan-Tilt', 'MQTT Broker'],
      outcome: 'ربط الآلات الحقيقية بالإنترنت واستقبال وإرسال الأوامر والقياسات فورياً'
    }
  },
  {
    id: 'kinematics-navigation',
    levelNumber: 3,
    title: 'مسار حركيات الروبوتات والملاحة الذاتية (ROS 2 & Kinematics)',
    subtitle: 'Kinematics, Path Planning, 2D LiDAR SLAM & ROS 2 Humble',
    tag: 'متقدم / هندسي',
    badgeName: 'خبير الحركيات والملاحة الذاتية',
    color: 'from-blue-600 to-indigo-600',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    icon: Compass,
    duration: '8 - 10 أسابيع',
    targetAudience: 'طلاب الهندسة والمطورون الطامحون لبناء روبوتات صناعية وذاتية القيادة',
    theorySkills: [
      'مصفوفات ديناميكا وحركيات الحركة المباشرة والعكسية (FK & IK - Denavit-Hartenberg)',
      'الخوارزميات الهندسية لمسار العمل (Trajectory Generation & Cubic Splines)',
      'نظرية الملاحة وبناء الخرائط المتزامن (SLAM - Simultaneous Localization and Mapping)',
      'خوارزميات أقصر مسار وتجنب التصادم (A* Search, Dijkstra & DWA Planner)'
    ],
    hardwareSkills: [
      'معايرة ومزامنة محركات السيرفو الصناعية وعزم الدوران',
      'دمج مستشعرات الليزر ثنائية الأبعاد (2D LiDAR 360°) عبر منفذ التسلسلي',
      'معايرة وحدة قياس القصور الذاتي (IMU 6-DOF) لتحديد الاتجاه الدقيق',
      'تصميم وبناء عجلات ميكانوم (Mecanum Wheels) للحركة الشاملة في كل الاتجاهات'
    ],
    softwareSkills: [
      'بناء حزم وعقد نظام تشغيل الروبوتات ROS 2 (Nodes, Topics, Services, Actions)',
      'محاكاة حركة الروبوتات داخل بيئات Gazebo و RViz ثلاثية الأبعاد',
      'برمجة الحركيات العكسية لحساب زوايا المفاصل لنقطة محددة في الفراغ',
      'تنفيذ حزم Nav2 للملاحة المستقلة التلقائية داخل الخرائط'
    ],
    capstoneProject: {
      title: 'ذراع مناولة آلية 4-DOF مع منصة متنقلة ذاتية التوجيه (AMR Manipulator)',
      description: 'ذراع آلية مثبتة على روبوت ملاحة بالليدار، يتلقى أمراً بالانتقال إلى إحداثيات محددة، يتفادى العوائق آلياً، ثم يحسب زوايا مفاصله لالتقاط صندوق بوضعية دقيقة.',
      hardware: ['Raspberry Pi 4 / Jetson Nano', 'RPLiDAR A1', 'Arduino Mega / ESP32', '4x Servos', 'Chassis Mecanum'],
      outcome: 'إتقان المنظومة المتكاملة للروبوتات المتنقلة الصناعية الحديثة'
    }
  },
  {
    id: 'applied-ai-vision',
    levelNumber: 4,
    title: 'مسار الذكاء الاصطناعي التطبيقي والرؤية الحاسوبية (Edge AI & Vision)',
    subtitle: 'Object Detection, Hand Gestures, Reinforcement Learning & Digital Twin',
    tag: 'احترافي / ريادي',
    badgeName: 'قائد هندسة الذكاء الاصطناعي والروبوتات',
    color: 'from-purple-600 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    icon: BrainCircuit,
    duration: '8 - 12 أسبوعاً',
    targetAudience: 'المتخصصون الراغبون ببناء أنظمة ذكاء اصطناعي روبوتية مدركة لمحيطها',
    theorySkills: [
      'معالجة الصور الرقمية والتحويلات الهندسية (Spatial Filtering & Color Spaces)',
      'الشبكات العصبية الالتفافية (CNNs) ونماذج كشف الكائنات في الوقت الحقيقي (YOLO)',
      'التحويل بين إحداثيات بيكسل الكاميرا وإحداثيات العالم الحقيقي للروبوت',
      'مبادئ التوأم الرقمي (Digital Twin) والتعلم بالتعزيز (Reinforcement Learning)'
    ],
    hardwareSkills: [
      'دمج كاميرات الذكاء الاصطناعي المدمجة (ESP32-CAM, USB Global Shutter, OAK-D)',
      'معالجة النماذج العصبية على أجهزة الحافة (Jetson Orin Nano / Google Coral Edge TPU)',
      'طباعة هياكل الروبوت بالطباعة ثلاثية الأبعاد ودمج الحوامل المحورية (Pan-Tilt Gimbal)',
      'ربط مصفوفة الحساسات المتعددة لتأكيد قرارات الرؤية باللمس والمسافة'
    ],
    softwareSkills: [
      'تدريب نماذج مخصصة لكشف ألوان وأشكال المنتجات عبر YOLOv8 / Edge Impulse',
      'تتبع حركات وإيماءات اليد بدقة 21 نقطة مفصلية بالمتصفح عبر MediaPipe',
      'توجيه الروبوت إيمائياً (Gesture Teleoperation) بدون لمس أي أزرار',
      'مزامنة الكيان المادي بملفات STL ثلاثية الأبعاد عبر الويب في الوقت الحقيقي'
    ],
    capstoneProject: {
      title: 'محطة الفرز والتحكم الذكية بالرؤية الحاسوبية والتوأم الرقمي',
      description: 'نظام متكامل يرصد الأجسام بواسطة الكاميرا، يصنفها بالذكاء الاصطناعي، يوجه الذراع لالتقاطها وفرزها، ويتيح للمستخدم التحكم بالذراع عن بُعد عبر حركات كف اليد أمام كاميرا اللابتوب.',
      hardware: ['Jetson Nano / Laptop Camera', 'ESP32', '6-DOF Robot Arm', 'PCA9685', 'Color Palette Items', '3D Printed Gripper'],
      outcome: 'بناء نظام روبوتي مستقل ذكي بالكامل يرى، يقرر، ويتحرك بدقة عالية'
    }
  }
];

export const RoboticsPathways: React.FC<{
  onSelectLevel?: (levelId: string) => void;
  onLaunchLab?: (labType: 'wokwi' | 'kinematics' | 'vision' | 'arena' | 'digital-twin') => void;
}> = ({ onSelectLevel, onLaunchLab }) => {
  const [activeLevelId, setActiveLevelId] = useState<string>('foundation');
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({
    'foundation-0': true,
    'foundation-1': true,
    'foundation-2': true,
    'embedded-iot-0': true,
  });

  const activeLevel = PATHWAY_LEVELS.find(l => l.id === activeLevelId) || PATHWAY_LEVELS[0];

  const toggleSkill = (key: string) => {
    setCompletedSkills(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calculate total progress
  const allSkillCount = PATHWAY_LEVELS.reduce(
    (acc, lvl) => acc + lvl.theorySkills.length + lvl.hardwareSkills.length + lvl.softwareSkills.length,
    0
  );
  const doneSkillCount = Object.values(completedSkills).filter(Boolean).length;
  const overallProgress = Math.round((doneSkillCount / allSkillCount) * 100);

  return (
    <div className="space-y-8">
      {/* Header & Overall Progress Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-slate-200 dark:border-blue-500/20 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خارطة المسارات التعليمية المعتمدة (EdTech Robotics Curriculum)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            رحلة التدرج من الصفر إلى هندسة الروبوتات والذكاء الاصطناعي
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
            منهاج متدرج يجمع بين النظريات الفيزيائية والحركية، بناء الدوائر والأنظمة المدمجة، البرمجة المتقدمة بنظام ROS 2، وتطبيقات الرؤية الحاسوبية على أجهزة الحافة.
          </p>
        </div>

        {/* Global Progress Card */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-full md:w-64 shrink-0 space-y-3 text-right">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">التقدم الإجمالي للمهارات</span>
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 font-mono">
              {overallProgress}%
            </Badge>
          </div>
          <Progress value={overallProgress} className="h-2.5 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{doneSkillCount} من {allSkillCount} مهارة مكتملة</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Award className="w-3.5 h-3.5" /> 4 شارات
            </span>
          </div>
        </div>
      </div>

      {/* Pathway Level Selector Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PATHWAY_LEVELS.map((level, idx) => {
          const Icon = level.icon;
          const isSelected = level.id === activeLevelId;

          // count skills done for this level
          const totalInLevel = level.theorySkills.length + level.hardwareSkills.length + level.softwareSkills.length;
          const doneInLevel = Array.from({ length: totalInLevel }).filter(
            (_, i) => completedSkills[`${level.id}-${i}`]
          ).length;
          const levelProgress = Math.round((doneInLevel / totalInLevel) * 100);

          return (
            <motion.div
              key={level.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveLevelId(level.id);
                onSelectLevel?.(level.id);
              }}
              className={`p-5 rounded-2xl cursor-pointer border transition-all duration-300 text-right space-y-3 relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30'
                  : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Level indicator stripe */}
              <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${level.color} opacity-80`} />

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-slate-700">
                  {level.duration}
                </Badge>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${level.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  المستوى {level.levelNumber} • {level.tag}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {level.title}
                </h3>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>الإنجاز</span>
                  <span className="font-mono">{levelProgress}%</span>
                </div>
                <Progress value={levelProgress} className="h-1.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Level Detailed Blueprint */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-8 text-right"
        >
          {/* Level Header Detail */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`bg-gradient-to-r ${activeLevel.color} text-white border-none font-bold text-xs`}>
                  المستوى {activeLevel.levelNumber}: {activeLevel.tag}
                </Badge>
                <Badge variant="outline" className="text-slate-600 dark:text-slate-300 text-xs">
                  المدة المقترحة: {activeLevel.duration}
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs">
                  <Award className="w-3 h-3 ml-1" />
                  {activeLevel.badgeName}
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeLevel.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                {activeLevel.subtitle}
              </p>
            </div>

            {/* Quick Action Button for Lab */}
            <div className="flex flex-wrap gap-2.5">
              {activeLevel.id === 'foundation' && (
                <Button
                  onClick={() => onLaunchLab?.('arena')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md"
                >
                  <Bot className="w-4 h-4" />
                  <span>بدء محاكي المتاهة الأساسي</span>
                </Button>
              )}
              {activeLevel.id === 'embedded-iot' && (
                <Button
                  onClick={() => onLaunchLab?.('wokwi')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md"
                >
                  <Cpu className="w-4 h-4" />
                  <span>فتح محاكي Wokwi والدوائر</span>
                </Button>
              )}
              {activeLevel.id === 'kinematics-navigation' && (
                <Button
                  onClick={() => onLaunchLab?.('kinematics')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md"
                >
                  <Compass className="w-4 h-4" />
                  <span>مختبر الحركيات والليدار</span>
                </Button>
              )}
              {activeLevel.id === 'applied-ai-vision' && (
                <Button
                  onClick={() => onLaunchLab?.('vision')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>مختبر الرؤية والوكلاء الذكاء</span>
                </Button>
              )}
            </div>
          </div>

          {/* Core Skills Columns: Theory, Hardware, Software */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theory Column */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <BookOpen className="w-4 h-4" />
                <h4>1. الجانب المعرفي والنظري</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {activeLevel.theorySkills.map((skill, sIdx) => {
                  const key = `${activeLevel.id}-${sIdx}`;
                  const isDone = !!completedSkills[key];
                  return (
                    <li 
                      key={sIdx} 
                      onClick={() => toggleSkill(key)}
                      className="flex items-start gap-2 cursor-pointer group hover:text-blue-600 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-500" />
                      )}
                      <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {skill}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Hardware Column */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <Cpu className="w-4 h-4" />
                <h4>2. العتاد والمكونات المادية</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {activeLevel.hardwareSkills.map((skill, sIdx) => {
                  const key = `${activeLevel.id}-${activeLevel.theorySkills.length + sIdx}`;
                  const isDone = !!completedSkills[key];
                  return (
                    <li 
                      key={sIdx} 
                      onClick={() => toggleSkill(key)}
                      className="flex items-start gap-2 cursor-pointer group hover:text-cyan-600 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-cyan-500" />
                      )}
                      <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {skill}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Software Column */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <Code2 className="w-4 h-4" />
                <h4>3. البرمجيات والخوارزميات</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {activeLevel.softwareSkills.map((skill, sIdx) => {
                  const key = `${activeLevel.id}-${activeLevel.theorySkills.length + activeLevel.hardwareSkills.length + sIdx}`;
                  const isDone = !!completedSkills[key];
                  return (
                    <li 
                      key={sIdx} 
                      onClick={() => toggleSkill(key)}
                      className="flex items-start gap-2 cursor-pointer group hover:text-purple-600 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-purple-500" />
                      )}
                      <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {skill}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Capstone Project Card for this level */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    مشروع التخرج للمستوى {activeLevel.levelNumber} (Capstone Project)
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeLevel.capstoneProject.title}
                  </h4>
                </div>
              </div>
              <Badge className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs">
                جاهز للتطبيق العملي
              </Badge>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeLevel.capstoneProject.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">المكونات والقطع المطلوبة:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeLevel.capstoneProject.hardware.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-[11px] bg-slate-50 dark:bg-slate-800 font-mono">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">المخرج التعليمي النهائي:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeLevel.capstoneProject.outcome}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
