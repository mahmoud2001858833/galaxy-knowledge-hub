import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Cpu,
  BookOpen,
  ArrowRight,
  Layers,
  Wand2,
  Share2,
  Zap,
  RotateCcw,
  Target,
  FlaskConical,
  Binary
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface AISectionData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  analogy: string;
  coreConcept: string;
  theoryMath: {
    formula: string;
    variables: { sym: string; name: string; desc: string }[];
    notes: string;
  };
  industryApplication: string;
  studentSteps: string[];
  challengeQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  quickFaqs: { q: string; a: string }[];
  presets?: { id: string; label: string; description: string; actionData: any }[];
}

export const AI_SECTIONS_DATA: Record<string, AISectionData> = {
  pathways: {
    id: 'pathways',
    badge: 'خارطة الطريق الأكاديمية والمهنية',
    title: 'المعلم الذكي: كيف تبني مستقبلك كمهندس روبوتات وذكاء اصطناعي؟',
    subtitle: 'دليلك الشامل للانتقال من المفاهيم التأسيسية حتى قيادة مشاريع الأتمتة المتقدمة',
    analogy: 'تعلّم الروبوتات يشبه تعلّم بناء كائن حي اصطناعي: الميكانيكا هي الهيكل العظمي، الإلكترونيات هي الجهاز العصبي، البرمجة هي الدماغ، والذكاء الاصطناعي هو التفكير والإدراك.',
    coreConcept: 'تتطلب هندسة الروبوتات الحديثة تداخلاً فريداً بين الميكانيكا الكلاسيكية، الإلكترونيات المدمجة، وهندسة البرمجيات الذكية. بدلاً من دراسة كل تخصص بمعزل، تركز مساراتنا الأربعة على التطبيق التكاملي (Mechatronics & Embodied AI) لتجهيز الطالب لمتطلبات سوق العمل العالمي 2026 وما بعده.',
    theoryMath: {
      formula: 'Skill_Matrix = f(Mechanics, Embedded_C, ROS2, ML_Perception)',
      variables: [
        { sym: 'Mechanics', name: 'الميكانيكا والتصميم', desc: 'حساب الأحمال، عزوم الدوران، والطباعة ثلاثية الأبعاد' },
        { sym: 'Embedded_C', name: 'الأنظمة المدمجة', desc: 'برمجة المتحكمات الدقيقة، بروتوكولات الاتصال (I2C, SPI)' },
        { sym: 'ROS2', name: 'نظام تشغيل الروبوت', desc: 'هيكلية العقد والمواضيع وإدارة البيانات في الوقت الحقيقي' },
        { sym: 'ML_Perception', name: 'الإدراك بالذكاء الاصطناعي', desc: 'الرؤية الحاسوبية، التعرف على الأجسام، واتخاذ القرار' }
      ],
      notes: 'التوازن بين العتاد (Hardware) والبرمجيات (Software) هو ما يميّز مهندس الروبوتات المبدع عن المبرمج التقليدي.'
    },
    industryApplication: 'تعتمد كبرى الشركات العالمية مثل Tesla (Optimus)، Boston Dynamics، KUKA، وAmazon Robotics على هذا التدرج لبناء وتطوير روبوتات المستودعات المستقلة والأذرع الروبوتية الذكية.',
    studentSteps: [
      'حدد مستواك الحالي بالاطلاع على المتطلبات القبلية في كل مسار.',
      'ابدأ بمسار أساسيات العتاد والمتحكمات قبل الانتقال إلى الحركيات المعقدة.',
      'أكمل المشاريع العملية في نهاية كل مسار لتوثيقها في معرض أعمالك الهندسي (Portfolio).'
    ],
    challengeQuiz: {
      question: 'ما هو الترتيب المنطقي الأصح لدراسة وتطوير روبوت صناعي ذكي؟',
      options: [
        'تصميم الهيكل وحساب العزوم ← بناء الدوائر والتحكم بالمحركات ← برمجة الملاحة والرؤية بالذكاء الاصطناعي',
        'تدريب نموذج ذكاء اصطناعي أولاً قبل معرفة محركات الروبوت أو وزنه',
        'شراء روبوت جاهز دون فهم كيفية عمل إشارات PWM ومصفوفات الدوران'
      ],
      correctIndex: 0,
      explanation: 'ممتاز! الهندسة الروبوتية تبدأ دائماً من فهم القيود الفيزيائية والميكانيكية، ثم الإلكترونيات والتحكم، ثم طبقة البرمجيات والذكاء الاصطناعي.'
    },
    quickFaqs: [
      {
        q: 'هل أحتاج لشراء قطع عتاد حقيقية ومكلفة للبدء؟',
        a: 'إطلاقاً! المنصة توفر لك محاكيات متكاملة للدوائر (Wokwi)، وحركيات الأذرع ثلاثية الأبعاد، ومحاكي الرادار والـ LiDAR، مما يتيح لك تطبيق 90% من المشاريع افتراضياً ومجاناً.'
      },
      {
        q: 'ما هو نظام ROS 2 ولماذا هو مطلوب بشدة في وظائف الروبوتات؟',
        a: 'هو Robot Operating System، وهو إطار عمل مفتوح المصدر يوفر مكتبات وأدوات قياسية للتواصل بين أجزاء الروبوت (المستشعرات، الكاميرات، المحركات) وتعتمد عليه 80% من شركات الروبوتات العالمية.'
      }
    ]
  },

  wokwi: {
    id: 'wokwi',
    badge: 'مختبر العتاد والدوائر المدمجة',
    title: 'المعلم الذكي: كيف تتواصل المتحكمات الدقيقة مع المحركات والحساسات؟',
    subtitle: 'فهم إشارات PWM، بروتوكولات الاتصال التسلسلي، ومبادئ حماية الدوائر الإلكترونية',
    analogy: 'الميكروكنترولر مثل المايسترو في الفرقة الموسيقية: يرسل نبضات كهربائية دقيقة جداً (PWM) للمحركات لتحدد سرعتها، ويستقبل تقارير الحساسات عبر أسلاك الاتصال مثل خطوط الهاتف (I2C/SPI).',
    coreConcept: 'في محاكي Wokwi، نقوم بمحاكاة شريحة ESP32 أو Arduino مع المكونات الحقيقية. لفهم التحكم بمحرك السيرفو، لا نغير الجهد الكهربائي، بل نتحكم في عرض النبضة (Pulse Width Modulation - PWM). نبضة بعرض 1ms تعني 0 درجات، ونبضة بعرض 2ms تعني 180 درجة.',
    theoryMath: {
      formula: 'Duty_Cycle (%) = (T_on / T_period) × 100% | V_out = V_cc × Duty_Cycle',
      variables: [
        { sym: 'T_on', name: 'زمن تشغيل النبضة', desc: 'المدة الزمنية التي تكون فيها الإشارة الكهربائية عند 5V أو 3.3V' },
        { sym: 'T_period', name: 'فترة التردد الكاملة', desc: 'مقلوب التردد f (عادة 50Hz في السيرفو = 20ms)' },
        { sym: 'Duty_Cycle', name: 'دورة التشغيل', desc: 'النسبة المئوية التي تحدد الموضع الزاوي أو سرعة المحرك' }
      ],
      notes: 'تذكر دائماً قانون أوم (V = I × R) لحساب مقاومات الحماية للصمامات الثنائية (LEDs) لتفادي احتراق مخارج الميكروكنترولر.'
    },
    industryApplication: 'تعتمد سيارات القيادة الذاتية والمصانع المؤتمتة على متحكمات مثل STM32 وESP32 لقراءة مستشعرات السرعة والحرارة وتوجيه عجلات التوجيه بدقة متناهية ودون أي تأخير زمني.',
    studentSteps: [
      'اختر إحدى الدارات الجاهزة (رادار السيرفو أو تحكم البلوتوث الذكي).',
      'افتح كود المتحكم ولاحظ كيفية استخدام دالة pinMode و analogWrite أو مكتبة Servo.h.',
      'شغّل المحاكاة وحرك شريط المقاومة أو مستشعر المسافة وشاهد استجابة المحرك والشاشة فورياً.'
    ],
    challengeQuiz: {
      question: 'لماذا نستخدم إشارات PWM للتحكم في سرعة المحركات بدلاً من خفض الجهد الكهربائي عبر مقاومة متغيرة؟',
      options: [
        'لأن PWM يحافظ على كامل عزم الدوران (Torque) ويقلل الطاقة الضائعة على شكل حرارة',
        'لأن المقاومة المتغيرة تجعل المحرك يدور أسرع بكثير',
        'لأن التيار المتردد لا يعمل مع الميكروكنترولر إطلاقاً'
      ],
      correctIndex: 0,
      explanation: 'إجابة عبقرية! تقنية PWM تقوم بتشغيل وإطفاء الترانزستور بسرعة فائقة، مما يمنح المحرك عزماً قوياً حتى عند السرعات المنخفضة مع كفاءة طاقة تتجاوز 90%.'
    },
    quickFaqs: [
      {
        q: 'ما الفرق بين ESP32 و Arduino Uno في مشاريع الروبوتات؟',
        a: 'الأردوينو Uno ممتاز للمبتدئين وبسيط (معالج 16MHz أحادي النواة)، بينما ESP32 وحش تقني (معالج ثنائي النواة 240MHz مع Wi-Fi و Bluetooth مدمجين) مما يجعله مثالياً لإنترنت الأشياء والروبوتات الموجهة عبر الإنترنت.'
      },
      {
        q: 'ما هو بروتوكول I2C ولماذا يحتاج سلكين فقط (SDA / SCL)؟',
        a: 'بروتوكول تسلسلي ذكي يسمح للميكروكنترولر بالتواصل مع ما يصل إلى 127 حساس ومستشعر وشاشة باستخدام سلك بيانات واحد (SDA) وسلك نبضات ساعة (SCL).'
      }
    ]
  },

  arm: {
    id: 'arm',
    badge: 'حركيات الأذرع الروبوتية (Kinematics)',
    title: 'المعلم الذكي: حركيات الذراع الروبوتية والمحركات المؤازرة',
    subtitle: 'إتقان الحركيات المباشرة (FK) والعكسية (IK) لحساب مسارات العمل الدقيقة',
    analogy: 'الحركيات المباشرة تشبه أن تقيس زوايا مفاصلك لتعرف أين وصلت يدك في الغرفة. أما الحركيات العكسية، فتشبه أن تقرر لمس فنجان القهوة على الطاولة، فيقوم دماغك فوراً بحساب الزوايا التي يجب أن ينحني بها كتفك وكوعك.',
    coreConcept: 'تتكون الذراع الروبوتية من وصلات صلبة (Links) ومفاصل دورانية (Revolute Joints). الحركيات المباشرة (Forward Kinematics) تستخدم حساب المثلثات ومصفوفات التحويل الدوارة (D-H Parameters) لحساب إحداثيات نقطة العمل (TCP) بناءً على زوايا المفاصل (θ₁, θ₂, θ₃).',
    theoryMath: {
      formula: 'X = L₁·cos(θ₁) + L₂·cos(θ₁+θ₂) + L₃·cos(θ₁+θ₂+θ₃) | Y = L₁·sin(θ₁) + L₂·sin(θ₁+θ₂) + ...',
      variables: [
        { sym: 'L₁, L₂, L₃', name: 'أطوال الوصلات الميكانيكية', desc: 'L₁=110mm (القاعدة)، L₂=90mm (الساعد)، L₃=50mm (القابض)' },
        { sym: 'θ₁, θ₂, θ₃', name: 'زوايا المفاصل بالدرجات', desc: 'زوايا الدوران المقاسة بالنسبة لمحور الوصلة السابقة' },
        { sym: 'TCP', name: 'نقطة العمل المركزية', desc: 'إحداثيات الموضع الفعلي للملقط الميكانيكي (X, Y, Z) في الفضاء' }
      ],
      notes: 'تجنب وضعيات الانفراد (Singularity) التي تصبح فيها مصفوفة الجاكوبيان (Jacobian) غير قابلة للعكس وتفقد الذراع إحدى درجات حريتها.'
    },
    industryApplication: 'أذرع مصانع السيارات مثل KUKA وABB تلحم هياكل السيارات وتدهنها بدقة 0.05 مليمتر باستخدام هذه الخوارزميات الحسابية المتزامنة بمعدل 1000 مرة في الثانية.',
    studentSteps: [
      'حرك شريط مفصل القاعدة θ₁ وشاهد تغير إحداثي X و Y في لوحة الإحداثيات الآنية (HUD).',
      'اضغط على زر "تشغيل مسار آلي" لمراقبة تتبع الذراع لمسار دوراني ناعم ومستمر.',
      'جرب فتح وإغلاق القابض (Gripper) ولاحظ استجابة المحرك المؤازر في نهاية الذراع.'
    ],
    presets: [
      { id: 'pick', label: 'موضع الالتقاط الأرضي', description: 'زوايا منخفضة للوصول إلى قطعة عمل على طاولة العمل', actionData: { t1: 30, t2: 45, t3: -20, g: 100 } },
      { id: 'place', label: 'موضع الرفع والتخزين', description: 'رفع القطعة ووضعها على رف تخزين مرتفع', actionData: { t1: 90, t2: -35, t3: 65, g: 20 } },
      { id: 'home', label: 'موضع الاصطفاف والراحة', description: 'الوضعية القياسية الآمنة لإيقاف الذراع', actionData: { t1: 45, t2: -30, t3: 60, g: 40 } }
    ],
    challengeQuiz: {
      question: 'ما هي الحركيات العكسية (Inverse Kinematics) وما هي معضلتها الرياضية الشهيرة؟',
      options: [
        'حساب زوايا المفاصل للوصول لهدف معين، وصعوبتها تكمن في وجود حلول متعددة لنفس النقطة (Multiple Solutions)',
        'حساب وزن الروبوت، وصعوبتها هي استهلاك البطارية',
        'برمجة الذراع بلغة بايثون بدلاً من السي'
      ],
      correctIndex: 0,
      explanation: 'صحيح تماماً! يمكنك لمس نفس النقطة وكوعك لأعلى (Elbow-up) أو كوعك لأسفل (Elbow-down)، ولذلك تستخدم خوارزميات الاستمثال لاختيار الحل الأقل استهلاكاً للطاقة والأبعد عن العقبات.'
    },
    quickFaqs: [
      {
        q: 'ما هو المقصود بدرجات الحرية (Degrees of Freedom - DOF)؟',
        a: 'هو عدد المحركات أو المفاصل المستقلة في الروبوت. لتحديد موضع واتجاه أي جسم بحرية كاملة في الفضاء ثلاثي الأبعاد، نحتاج إلى 6 درجات حرية (3 للموضع X,Y,Z و 3 للزوايا Roll, Pitch, Yaw).'
      },
      {
        q: 'لماذا نستخدم مصفوفات Denavit-Hartenberg (D-H)؟',
        a: 'هي طريقة هندسية موحدة وعالمية تسمح لنا بتمثيل أي هيكل روبوتي مهما كان معقداً باستخدام 4 بارامترات فقط لكل مفصل (θ, d, a, α).'
      }
    ]
  },

  amr: {
    id: 'amr',
    badge: 'الملاحة الذاتية والليدار (Autonomous Navigation)',
    title: 'المعلم الذكي: كيف تبصر الروبوتات المتنقلة وترسم خرائط العالم المحيط؟',
    subtitle: 'مبادئ عمل مستشعر LiDAR، خوارزميات SLAM، وتجنب العقبات في الوقت الفعلي',
    analogy: 'مستشعر LiDAR مثل خفاش يطلق آلاف نبضات الصوت، لكن بدلاً من الصوت، يطلق الروبوت نبضات ليزر ضوئية غير مرئية ترتد من الجدران والعوائق وتقيس المسافة بسرعة الضوء.',
    coreConcept: 'يعمل مستشعر الليدار بتقنية زمن الطيران (Time of Flight - ToF). من خلال تدوير رأس الليزر 360 درجة، ينتج الروبوت سحابة نقاط (Point Cloud). باستخدام خوارزميات التعريب ورسم الخرائط في آن واحد (SLAM)، يحدد الروبوت موقعه بدقة بدون الحاجة إلى GPS داخل المستودعات والمستشفيات.',
    theoryMath: {
      formula: 'Distance (d) = (c × Δt) / 2 | f(n) = g(n) + h(n)',
      variables: [
        { sym: 'c', name: 'سرعة الضوء', desc: '300,000 كيلومتر في الثانية (3×10^8 m/s)' },
        { sym: 'Δt', name: 'زمن رحلة نبضة الليزر', desc: 'الزمن بالنانو ثانية بين إطلاق النبضة واستقبال انعكاسها' },
        { sym: 'SLAM', name: 'التعريب ورسم الخرائط المتزامن', desc: 'دمج قراءات العجلات (Odometry) مع قراءات الليزر لتحديث الخريطة' }
      ],
      notes: 'تستخدم خوارزمية Dynamic Window Approach (DWA) لاختيار أفضل سرعة خطية وزاوية تتفادى التصادم مع العوائق المتحركة.'
    },
    industryApplication: 'روبوتات المستودعات في أمازون (Kiva Systems) والسيارات ذاتية القيادة (Waymo) تعتمد على الـ LiDAR متعدد الطبقات للتنقل بين مئات العمال والعربات بأمان مطلق وبدون أي حوادث تصادم.',
    studentSteps: [
      'استخدم أزرار التوجيه (دوران يسار، تقدم للأمام، دوران يمين) لتحريك الروبوت نحو العوائق.',
      'لاحظ كيف تتغير أشعة الليزر الخضراء إلى حمراء عند الاقتراب من المكعبات والأعمدة.',
      'غيّر مدى شعاع الليدار باستخدام شريط التمرير وشاهد اتساع دائرة الرؤية الاستكشافية.'
    ],
    presets: [
      { id: 'wide-scan', label: 'مسح واسع المدى', description: 'ضبط مدى الليزر لأقصى مسافة لمراقبة القاعة بالكامل', actionData: { range: 190 } },
      { id: 'tight-maneuver', label: 'مناورة في ممر ضيق', description: 'تقليل مدى التحسس للتركيز على العوائق المباشرة الملاصقة', actionData: { range: 80 } }
    ],
    challengeQuiz: {
      question: 'لماذا يعتبر الجمع بين قراءات عدادات العجلات (Odometry) ومستشعر LiDAR ضرورياً لخوارزميات SLAM؟',
      options: [
        'لأن عدادات العجلات تعاني من تراكم الخطأ والانزلاق (Drift) مع الوقت، فيقوم الليزر بتصحيح هذا الانحراف باستمرار',
        'لأن الليزر يستهلك بطارية السيارة في ثوانٍ معدودة',
        'لأن عدادات العجلات تعمل فقط عند القيادة في خط مستقيم'
      ],
      correctIndex: 0,
      explanation: 'تحليل هندسي ممتاز! أي انزلاق بسيط في العجلات يُحدث خطأ يتضخم مع الوقت، ولهذا تستخدم مصفوفات مرشح كالمان (Kalman Filter) أو Graph-SLAM لدمج الحساسات وتصحيح الخريطة.'
    },
    quickFaqs: [
      {
        q: 'ما الفرق بين مستشعرات الموجات فوق الصوتية (Ultrasonic) والليدار (LiDAR)؟',
        a: 'الموجات فوق الصوتية رخيصة لكن مداها قصير وزاوية انتشارها واسعة وتتأثر بحرارة الجو، بينما الليدار يطلق حزمة ضوء فائقة الدقة والسرعة قادرة على رسم خريطة ثلاثية الأبعاد بتفاصيل دقيقة جداً.'
      },
      {
        q: 'هل يستطيع الروبوت التحرك في الظلام الدامس بالليدار؟',
        a: 'نعم بالتأكيد! لأن الليزر هو مصدر ضوء نشط (Active Sensor) يطلقه الروبوت بنفسه، فلا يحتاج لأي إضاءة خارجية ويعمل بكفاءة في الظلام التام.'
      }
    ]
  },

  vision: {
    id: 'vision',
    badge: 'الرؤية الحاسوبية والذكاء الاصطناعي (AI Vision)',
    title: 'المعلم الذكي: كيف تميز الروبوتات القطع الصناعية وتحدد موضع التقاطها؟',
    subtitle: 'معمارية شبكات YOLOv8، مربعات الإحاطة (Bounding Boxes)، ومعايرة الكاميرا مع الروبوت',
    analogy: 'العين البشرية ترسل إشارات عصبية للدماغ ليميز التفاحة عن البرتقالة. في الروبوت، الكاميرا الرقمية هي العين، وشبكة الأعصاب الالتفافية (Convolutional Neural Network) هي الدماغ الذي يرسم مستطيلاً حول القطعة ويحدد نوعها ونسبة الثقة.',
    coreConcept: 'في التطبيقات الصناعية الحديثة، تستخدم الروبوتات نماذج الرؤية السريعة مثل YOLO (You Only Look Once). تقوم الشبكة بتقسيم الصورة إلى شبكة خلايا والتنبؤ بمربعات الإحاطة (Bounding Boxes) وتصنيف القطع (تروس، محركات، عيوب تصنيعية) في خطوة واحدة فائقة السرعة تتجاوز 100 إطار في الثانية.',
    theoryMath: {
      formula: 'IoU = Area(Overlap) / Area(Union) | Conf = P(Object) × IoU',
      variables: [
        { sym: 'IoU', name: 'نسبة التقاطع إلى الاتحاد', desc: 'مقياس دقة تطابق المربع المتوقع مع المربع الحقيقي للقطعة' },
        { sym: 'Conf', name: 'درجة الثقة (Confidence)', desc: 'احتمالية وجود كائن ينتمي للفئة المحددة داخل المربع' },
        { sym: 'Homography (H)', name: 'مصفوفة التحويل الهندسي', desc: 'تحويل إحداثيات البكسل (u, v) في الكاميرا إلى مليمترات في عالم الروبوت (X, Y)' }
      ],
      notes: 'تستخدم خوارزمية Non-Maximum Suppression (NMS) لحذف المربعات المكررة المتداخلة والاحتفاظ فقط بالمربع الأكثر دقة.'
    },
    industryApplication: 'في خطوط إنتاج وتعبئة الهواتف والأدوية، تقوم كاميرات الذكاء الاصطناعي بفحص 60 قطعة في الثانية، والتعرف على أي خدش مجهري أو جزء مفقود وتوجيه ذراع آلية سريعة (Delta Robot) لفرزها فورياً.',
    studentSteps: [
      'اختر إحدى العينات الصناعية (ترس معدني، محور دوران، أو لوحة دوائر).',
      'اضبط عتبة الثقة (Confidence Threshold) وشاهد كيف تختفي التنبؤات غير المؤكدة.',
      'لاحظ إحداثيات مركز الثقل (Centroid) وكيف تترجم إلى أوامر حركة لمفاصل الذراع الروبوتية.'
    ],
    challengeQuiz: {
      question: 'إذا رأت كاميرا الروبوت قطعة بترس عند البكسل (x=320, y=240)، كيف يعرف المحرك أين يتحرك فيزيائياً؟',
      options: [
        'من خلال مصفوفة المعايرة (Eye-in-Hand Calibration) التي تحول إحداثيات الصورة إلى إحداثيات قاعدة الروبوت (Base Frame)',
        'يقوم المحرك بالتخمين والتحرك عشوائياً حتى يلمس القطعة',
        'لا يمكن للروبوت معرفة ذلك دون الاستعانة بالـ GPS'
      ],
      correctIndex: 0,
      explanation: 'إجابة هندسية احترافية! عملية المعايرة تحسب المصفوفة الانتقالية والدورانية بين الكاميرا وقاعدة الذراع، مما يسمح بتحويل أي بكسل في الصورة إلى موضع ميليمتري دقيق في الواقع.'
    },
    quickFaqs: [
      {
        q: 'ما هو نموذج YOLOv8 ولماذا يتفوق على النماذج السابقة؟',
        a: 'هو أحد أحدث نماذج التعرف على الأجسام، يتميز بأنه Anchor-free ويوفر سرعة استدلال فائقة تسمح بتشغيله على أجهزة الحافة المدمجة مثل Nvidia Jetson Nano و Raspberry Pi 5.'
      },
      {
        q: 'ما الفرق بين كشف الأجسام (Object Detection) والتجزئة (Segmentation)؟',
        a: 'الكشف يضع مستطيلاً حول الجسم فقط، بينما التجزئة تحدد الحواف الدقيقة بكسل ببكسل لشكل القطعة، وهو أمر ضروري للروبوتات لمعرفة زاوية الإمساك الصحيحة بالأجسام غير المنتظمة.'
      }
    ]
  },

  arena: {
    id: 'arena',
    badge: 'حلبة خوارزميات المتاهة والبحث (Pathfinding Arena)',
    title: 'المعلم الذكي: كيف يجد الروبوت أقصر مسار ويتفادى العوائق في المتاهات المعقدة؟',
    subtitle: 'مقارنة خوارزمية A* Search مع Dijkstra و BFS وكيفية تصميم الدوال الحدسية (Heuristics)',
    analogy: 'تخيل أنك في متاهة ومعك خريطة وبوصلة: إذا بحثت عشوائياً في كل اتجاه، فهذا يشبه البحث الأعمى (BFS). أما إذا كانت بوصلتك تشير دائماً نحو الهدف وتقودك نحو الممرات الواعدة، فأنت تطبق خوارزمية A* الذكية.',
    coreConcept: 'خوارزمية A* هي المعيار الذهبي في تخطيط مسارات الروبوتات والألعاب. تجمع بين تكلفة المسار المقطوع فعلياً g(n) والمسافة المتوقعة المتبقية إلى الهدف h(n). تضمن A* إيجاد أقصر مسار ممكن بأقل عدد من العمليات الحسابية مقارنة بالخوارزميات التقليدية.',
    theoryMath: {
      formula: 'f(n) = g(n) + h(n) | h(n) = |x_curr - x_goal| + |y_curr - y_goal|',
      variables: [
        { sym: 'g(n)', name: 'التكلفة الفعلية', desc: 'مجموع المسافة أو الطاقة المستهلكة من نقطة البداية حتى العقدة الحالية n' },
        { sym: 'h(n)', name: 'الدالة الحدسية (Heuristic)', desc: 'المسافة المقدرة من العقدة n إلى نقطة النهاية (مسافة مانهاتن أو إقليدس)' },
        { sym: 'f(n)', name: 'التكلفة الإجمالية المقدرة', desc: 'العقدة ذات القيمة f الأقل هي التي يتم اختيار استكشافها أولاً' }
      ],
      notes: 'شرط الدالة المقبولة (Admissible Heuristic): يجب ألا تبالغ الدالة الحدسية h(n) أبداً في تقدير المسافة المتبقية لضمان الحصول على المسار الأمثل (Optimality).'
    },
    industryApplication: 'تعتمد أنظمة الملاحة في سيارات تسلا ومكنسات الروبوت الذكية (iRobot Roomba) على خوارزميات مشتقة من A* (مثل Hybrid A* و D* Lite) لإعادة تخطيط المسار لحظياً إذا ظهر عائق مفاجئ كطفل أو حيوان أليف.',
    studentSteps: [
      'اختر نوع الخوارزمية (A* الذكية أو Dijkstra أو Breadth-First Search).',
      'انقر على شبكة المتاهة لإضافة جدران وعوائق وشاهد كيف يعيد الروبوت حساب مساره.',
      'اضغط على زر تشغيل السباق ولاحظ سرعة وصول الروبوت وعدد الخلايا المستكشفة في كل خوارزمية.'
    ],
    challengeQuiz: {
      question: 'ما الذي يجعل خوارزمية A* أسرع بكثير من خوارزمية Dijkstra في الوصول للهدف؟',
      options: [
        'لأن A* موجهة نحو الهدف بفضل الدالة الحدسية h(n)، بينما Dijkstra تبحث كروياً في جميع الاتجاهات دون معرفة اتجاه الهدف',
        'لأن A* تتجاهل الجدران والعوائق وتمر من خلالها',
        'لأن A* تعمل بلغة C++ فقط ولا يمكن كتابتها بلغات أخرى'
      ],
      correctIndex: 0,
      explanation: 'إصابة دقيقة في صلب هندسة الخوارزميات! ديكسترا تستكشف في دوائر متسعة متساوية في جميع الجهات كتموجات الماء، بينما A* تركز كل طاقتها الحسابية في الاتجاه المؤدي نحو الهدف مباشرة.'
    },
    quickFaqs: [
      {
        q: 'متى نستخدم مسافة مانهاتن (Manhattan) ومتى نستخدم مسافة إقليدس (Euclidean)؟',
        a: 'نستخدم مانهاتن عندما يتحرك الروبوت في 4 اتجاهات متعامدة فقط (أعلى، أسفل، يمين، يسار)، بينما نستخدم إقليدس عندما يستطيع الروبوت التحرك بزوايا حرة أو قطرياً (Diagonal).'
      },
      {
        q: 'ماذا يحدث إذا أغلقت العوائق جميع المسارات المؤدية إلى الهدف؟',
        a: 'ستقوم الخوارزمية باستكشاف جميع الخلايا المتاحة في القائمة المفتوحة (Open List)، وعندما تنفذ دون الوصول للهدف، ستصدر إشارة استجابة تفيد بعدم وجود مسار ممكن (Path Not Found) ويتوقف الروبوت بأمان.'
      }
    ]
  },

  'digital-twin': {
    id: 'digital-twin',
    badge: 'التوأم الرقمي والطباعة ثلاثية الأبعاد (Digital Twin & 3D STL)',
    title: 'المعلم الذكي: من النمذجة الحاسوبية إلى الطباعة ثلاثية الأبعاد والتجميع الميكانيكي',
    subtitle: 'قوائم المواد الهندسية (BOM)، تسامحات التجميع (Tolerances)، وإعدادات التقطيع (Slicing)',
    analogy: 'التوأم الرقمي مثل صورة طبق الأصل لروبوتك تعيش في الكمبيوتر: تختبر فيها الحركة والتصادم وتوافق البراغي والقطع قبل أن تشتري أي سلك أو تصرف قطرة واحدة من خيوط الطباعة البلاستيكية.',
    coreConcept: 'التوأم الرقمي (Digital Twin) يربط نموذج CAD ثلاثي الأبعاد بالبيانات الواقعية للمحركات والمستشعرات. لتصنيع هذه النماذج عبر طابعات 3D (بتقنية FDM أو SLA)، يجب اختيار كثافة التعبئة (Infill)، اتجاه الطباعة لضمان متانة الطبقات، وتسامح الفجوات (0.2mm - 0.4mm) لضمان حركة المفاصل بسلاسة.',
    theoryMath: {
      formula: 'Stress (σ) = Force / Area | FOS = Yield_Strength / Working_Stress',
      variables: [
        { sym: 'FOS', name: 'معامل الأمان الهندسي', desc: 'يجب أن يكون أكبر من 1.5 لضمان عدم انكسار أذرع الروبوت تحت الحمل' },
        { sym: 'Infill (%)', name: 'نسبة التعبئة الداخلية', desc: 'عادة 20-30% للقطع الهيكلية، و 100% للمسننات والمفاصل المحملة' },
        { sym: 'Layer Height', name: 'ارتفاع الطبقة', desc: '0.15mm إلى 0.2mm لتوازن مثالي بين سرعة الطباعة ونعومة الأسطح' }
      ],
      notes: 'انتبه لاتجاه القوى: قطع الطباعة تكون ضعيفة على طول محور التلاصق بين الطبقات (Z-axis)، لذا اطبع القطع في الاتجاه الذي يوازي الإجهاد الرئيسي.'
    },
    industryApplication: 'وكالة ناسا وشركات الطيران تستخدم التوائم الرقمية لاختبار مسبارات المريخ وأقمارها الصناعية في محاكيات تحاكي جاذبية وحرارة الفضاء بدقة متناهية قبل الإطلاق الفعلي.',
    studentSteps: [
      'استعرض المشاريع الخمسة المتاحة (ذراع 6-DOF، مكنسة ذكية، متتبع الطاقة الشمسية، إلخ).',
      'تصفح قائمة المواد الهندسية (BOM) ولاحظ كلفة كل قطعة ورقم الموديل الدقيق لها.',
      'حمل ملفات STL ثلاثية الأبعاد وافتحها في برنامج التقطيع (Cura أو PrusaSlicer) لمشاهدة محاكاة مسار رأس الطباعة.'
    ],
    challengeQuiz: {
      question: 'لماذا لا نطبع الأجزاء الروبوتية الميكانيكية بتعبئة كاملة 100% (Solid Infill) دائماً؟',
      options: [
        'لأن ذلك يزيد وزن الروبوت بشكل كبير ويهدر المواد والوقت، بينما توفر تعبئة 30-40% بنمط خلايا النحل (Gyroid) قوة هائلة بثلث الوزن',
        'لأن الطابعات ثلاثية الأبعاد تنفجر إذا طبعت بنسبة 100%',
        'لأن البلاستيك المصمت لا يوصل الكهرباء للمحركات'
      ],
      correctIndex: 0,
      explanation: 'تفكير مهندسين محترف! تخفيف الوزن (Lightweighting) أمر حيوي في الروبوتات لتقليل عزم القصور الذاتي والسماح للمحركات بالتحرك بسرعة ودون إجهاد حراري.'
    },
    quickFaqs: [
      {
        q: 'ما هي المادة الأنسب لطباعة أجزاء الروبوت: PLA أم PETG أم ABS؟',
        a: 'خام PLA ممتاز وسهل الطباعة للمبتدئين والنماذج الأولية. لكن للأذرع التي تتعرض لإجهاد ميكانيكي وحرارة المحركات، نوصي بخام PETG أو نايلون مقوى بألياف الكربون (Carbon Fiber PLA).'
      },
      {
        q: 'ما هو ملف STL وما الفرق بينه وبين ملف STEP؟',
        a: 'ملف STL يمثل السطح الخارجي للجسم كمجموعة مثلثات شبكية مناسبة للطابعات، بينما ملف STEP هو ملف هندسي أصلي بارامتري يحفظ الأقواس والأبعاد الدقيقة ومناسب للتعديل في برامج CAD مثل Fusion 360.'
      }
    ]
  },

  code: {
    id: 'code',
    badge: 'استوديو برمجة الروبوتات ROS 2 & Python',
    title: 'المعلم الذكي: البنية التحتية لبرمجة الروبوتات وهندسة النظم الموزعة',
    subtitle: 'مخطط الحوسبة في ROS 2، نموذج الناشر والمشترك (Pub/Sub)، وحساب المصفوفات بلغة Python',
    analogy: 'تخيل الروبوت كمدينة ذكية: العقد (Nodes) هي الإدارات والمصالح المتخصصة، والمواضيع (Topics) هي قنوات الإذاعة التي تبث عليها الكاميرات وحساسات السرعة، بحيث يستمع إليها محرك التوجيه ويقرر مساره فورياً.',
    coreConcept: 'نظام ROS 2 (Robot Operating System) ليس نظام تشغيل كـ Windows، بل هو إطار عمل وسيط (Middleware) يربط مئات البرامج المستقلة عبر بروتوكول DDS في الوقت الحقيقي. في هذا الاستوديو، تكتب عقدة بايثون تنشر زوايا المفاصل على موضوع `/joint_states`، وتستمع لعقدة تخطيط المسار لتنفيذ الحركة دون تصادم.',
    theoryMath: {
      formula: 'T_0^n = ∏_{i=1}^n A_i | Rate = 1 / dt = 50 Hz',
      variables: [
        { sym: 'Node', name: 'عقدة المعالجة (Node)', desc: 'برنامج بايثون أو C++ مستقل يؤدي وظيفة واحدة محددة (مثل قراءة الكاميرا أو التحكم بالسيرفو)' },
        { sym: 'Topic', name: 'الموضوع (Topic)', desc: 'قناة بث غير متزامنة ذات اتجاه واحد لنشر الرسائل (مثل بيانات الليزر /scan)' },
        { sym: 'D-H Matrix', name: 'مصفوفة التحويل', desc: 'مصفوفة 4x4 تحسب الموضع والاتجاه الفضائي المتراكم لجميع المفاصل' }
      ],
      notes: 'تتيح خدمات ROS 2 (Services) الاتصال المتزامن (طلب واستجابة - Request/Response) لأوامر مثل إعادة تصفير الذراع أو التقاط صورة.'
    },
    industryApplication: 'أحدث روبوتات الجراحة الطبية (Da Vinci) وروبوتات ناسا في الفضاء الخارجي تعمل بنواة ROS 2 لضمان عدم توقف النظام حتى لو تعطلت إحدى العقد البرمجية، حيث يتم استئنافها ذاتياً ومستقلاً.',
    studentSteps: [
      'اختر لغة البرمجة أو الموضوع المراد استكشافه (ROS 2 Node، Kinematics Solver، أو YOLOv8).',
      'تأمل كود الناشر والمشترك ولاحظ استدعاء دالة `create_publisher` ونشر إحداثيات المفاصل.',
      'اضغط على زر "تنفيذ الكود" وشاهد مخرجات الطرفية الصناعية في الوقت الحقيقي مع حساب مصفوفات التحويل.'
    ],
    challengeQuiz: {
      question: 'لماذا تم استبدال ROS 1 بـ ROS 2 في التطبيقات الهندسية والصناعية المتقدمة؟',
      options: [
        'لأن ROS 2 يعتمد على معيار DDS، ويدعم الأنظمة متعددة الروبوتات، ويوفر تحكماً حقيقياً في الوقت الفعلي (Real-Time)، ولا يحتاج لخادم مركزي (Masterless)',
        'لأن ROS 1 كان لا يدعم إلا لغة بيسك القديمة',
        'لأن ROS 2 أصبح تطبيقاً على الهواتف فقط'
      ],
      correctIndex: 0,
      explanation: 'إجابة عبقرية تستحق درجة مهندس برمجيات روبوتات! نظام ROS 2 أزال نقطة الفشل الفردية (Master Node) وأضاف طبقات أمان وتشفير وتوافق كامل مع أنظمة التحكم الصارم في الوقت الحقيقي.'
    },
    quickFaqs: [
      {
        q: 'هل يمكنني برمجة الروبوتات بلغة بايثون بدلاً من C++؟',
        a: 'نعم بالتأكيد! لغة بايثون عبر مكتبة `rclpy` رائعة وسريعة جداً في التطوير والذكاء الاصطناعي ومعالجة البيانات. بينما تُستخدم C++ عبر `rclcpp` في طبقات التحكم منخفضة المستوى التي تتطلب سرعة استجابة ميكروثانية.'
      },
      {
        q: 'ما هي رسالة JointState وماذا تحتوي؟',
        a: 'هي رسالة معيارية في ROS 2 تحتوي على مصفوفة بأسماء مفاصل الروبوت، ومواقعها الزاوية الحالية (Position بالراديان)، وسرعاتها (Velocity)، وعزوم المحركات (Effort).'
      }
    ]
  }
};

interface AIRoboticsExplainerProps {
  sectionKey: string;
  onApplyPreset?: (actionData: any) => void;
}

export const AIRoboticsExplainer: React.FC<AIRoboticsExplainerProps> = ({
  sectionKey,
  onApplyPreset
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const section = AI_SECTIONS_DATA[sectionKey] || AI_SECTIONS_DATA.pathways;

  // Reset quiz and speech state when section changes
  useEffect(() => {
    setSelectedQuizIndex(null);
    setQuizSubmitted(false);
    setActiveFaqIndex(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [sectionKey]);

  // Handle Text-to-Speech
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'تنبيه',
        description: 'المتصفح لا يدعم ميزة قراءة النصوص الصوتية.',
        variant: 'destructive'
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const speechText = `${section.title}. ${section.subtitle}. ${section.analogy}. ${section.coreConcept}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    // Try finding Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);

    toast({
      title: '🔊 المعلم الذكي يتحدث',
      description: 'جاري تشغيل الشرح الصوتي التفاعلي لهذا القسم...',
    });
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizIndex(idx);
    setQuizSubmitted(true);

    if (idx === section.challengeQuiz.correctIndex) {
      toast({
        title: '🎉 إجابة صحيحة ومتميزة!',
        description: section.challengeQuiz.explanation,
      });
    } else {
      toast({
        title: '💡 محاولة جيدة - راجع الشرح',
        description: 'راجع المفهوم الأساسي أعلاه واكتشف الإجابة الدقيقة.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 dark:border-blue-500/30 bg-white dark:bg-[#0c132a] shadow-xl dark:shadow-blue-950/40 mb-8 transition-all">
      {/* Decorative Top Accent Glow Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

      {/* Header Bar */}
      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs px-2.5 py-0.5 font-bold">
                <Sparkles className="w-3 h-3 ml-1 text-blue-500" />
                {section.badge}
              </Badge>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                المساعد الذكي متصل ومفعل
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {section.title}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Audio Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleSpeech}
            className={`rounded-xl text-xs gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 animate-pulse'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                <span>إيقاف الصوت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                <span>استمع للشرح الصوتي</span>
              </>
            )}
          </Button>

          {/* Expand / Collapse Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isExpanded ? (
              <>
                <span>طي الشرح</span>
                <ChevronUp className="w-4 h-4 mr-1" />
              </>
            ) : (
              <>
                <span>توسيع الشرح الذكي</span>
                <ChevronDown className="w-4 h-4 mr-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5 sm:p-7 space-y-6"
          >
            {/* Analogy Box: Simplified Intuitive Mental Model */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-400/30 dark:border-amber-600/30 text-slate-800 dark:text-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                    💡 التشبيه الذهني المبسط (Mental Model):
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {section.analogy}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Explanation & Industrial Value */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Core Concept Breakdown */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  المفهوم الهندسي الجوهري:
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {section.coreConcept}
                </p>

                {/* Practical Steps for the Student */}
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    ماذا تفعل الآن خطوة بخطوة في هذا المختبر؟
                  </h4>
                  <ul className="space-y-1.5">
                    {section.studentSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Theory Math & Formula Card */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5" />
                    المعادلة / القاعدة الرياضية
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    قاعدة علمية
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-cyan-600 dark:text-cyan-300 dir-ltr text-center font-bold overflow-x-auto">
                  {section.theoryMath.formula}
                </div>

                <div className="space-y-1.5">
                  {section.theoryMath.variables.map((v, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-[11px] leading-tight">
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold shrink-0">{v.sym}:</span>
                      <span className="text-slate-600 dark:text-slate-400 text-right flex-1">{v.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-bold text-blue-600 dark:text-blue-400">ملاحظة هندسية: </span>
                  {section.theoryMath.notes}
                </div>
              </div>
            </div>

            {/* Presets Action Buttons (if available for this section) */}
            {section.presets && section.presets.length > 0 && onApplyPreset && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Wand2 className="w-4 h-4 text-indigo-500" />
                  <span>تطبيق إعدادات جاهزة موصى بها من الذكاء الاصطناعي للمحاكي فوراً:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.presets.map((preset) => (
                    <Button
                      key={preset.id}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onApplyPreset(preset.actionData);
                        toast({
                          title: `✅ تم تطبيق: ${preset.label}`,
                          description: preset.description,
                        });
                      }}
                      className="rounded-xl text-xs border-indigo-300 dark:border-indigo-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      <Zap className="w-3 h-3 ml-1 text-amber-500" />
                      <span>{preset.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Student Understanding Quiz */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    تحدي الفهم السريع مع المعلم الذكي:
                  </h4>
                </div>
                {quizSubmitted && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedQuizIndex(null);
                    }}
                    className="text-[11px] h-7 px-2 text-slate-500"
                  >
                    <RotateCcw className="w-3 h-3 ml-1" /> إعادة المحاولة
                  </Button>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {section.challengeQuiz.question}
              </p>

              <div className="grid grid-cols-1 gap-2">
                {section.challengeQuiz.options.map((opt, optIdx) => {
                  const isSelected = selectedQuizIndex === optIdx;
                  const isCorrect = optIdx === section.challengeQuiz.correctIndex;

                  let btnStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';
                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleQuizAnswer(optIdx)}
                      disabled={quizSubmitted}
                      className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${btnStyle}`}
                    >
                      <span className="flex-1 leading-relaxed">{opt}</span>
                      {quizSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {quizSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="font-bold text-blue-600 dark:text-blue-400">💡 توضيح الذكاء الاصطناعي: </span>
                  {section.challengeQuiz.explanation}
                </motion.div>
              )}
            </div>

            {/* Quick Interactive FAQ Chips */}
            {section.quickFaqs.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  أسئلة ذكية شائعة يطرحها الطلاب (انقر لعرض الإجابة الفورية):
                </span>
                <div className="space-y-2">
                  {section.quickFaqs.map((faq, fIdx) => {
                    const isOpen = activeFaqIndex === fIdx;
                    return (
                      <div
                        key={fIdx}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40"
                      >
                        <button
                          onClick={() => setActiveFaqIndex(isOpen ? null : fIdx)}
                          className="w-full text-right p-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between gap-2"
                        >
                          <span>❓ {faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                        </button>
                        {isOpen && (
                          <div className="p-3 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
