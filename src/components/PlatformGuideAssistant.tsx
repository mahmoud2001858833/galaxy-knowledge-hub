import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { 
  Send, X, Brain, User, Sparkles, Zap, Volume2, VolumeX, 
  Maximize2, Minimize2, RotateCcw, Compass, Atom, FlaskConical, 
  Dna, Rocket, ArrowRight, ExternalLink, HelpCircle, Check, 
  Bot, RefreshCw, Mic, MicOff, Copy, ThumbsUp, GraduationCap, 
  Target, Eye, Cpu, BookOpen, Layers, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { resilientStreamingService } from '@/services/resilientStreamingService';

export type MentorPersona = 'academic' | 'explorer' | 'quiz' | 'navigator';

export interface SimulationRecommendation {
  id: string;
  title: string;
  category: string;
  route: string;
  icon: 'physics' | 'chemistry' | 'biology' | 'astronomy' | 'damij' | 'robotics' | 'curriculum' | 'general';
  description: string;
  tags?: string[];
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  navigationPath?: string;
  recommendations?: SimulationRecommendation[];
  suggestions?: string[];
  persona?: MentorPersona;
}

// Complete Exhaustive Platform Knowledge Registry for 1-click navigation & contextual AI recommendations
export const SIMULATION_REGISTRY: SimulationRecommendation[] = [
  // 1. Damij Platform (التربية الخاصة والدمج والتأهيل)
  {
    id: 'damij-overview',
    title: 'منصة دامج للتربية الخاصة والدمج',
    category: 'التربية الخاصة والتأهيل',
    route: '/damij',
    icon: 'damij',
    description: 'المنظومة الوطنية الشاملة للأشخاص ذوي الإعاقة: برايل، عين المكفوفين، التوحد، ADHD، ولغة الإشارة.',
    tags: ['دامج', 'إعاقة', 'تربية خاصة', 'تأهيل', 'شمول']
  },
  {
    id: 'blind-eye',
    title: 'نظام عين المكفوفين (Blind Eye AI)',
    category: 'التربية الخاصة - البصري',
    route: '/damij/blind-eye',
    icon: 'damij',
    description: 'مساعد ملاحة ذكي بالكاميرا والذكاء الاصطناعي لرصد العوائق، قراءة النصوص، ووصف البيئة المحيطة صوتياً.',
    tags: ['مكفوفين', 'بصري', 'ملاحة', 'كاميرا', 'ذكاء اصطناعي']
  },
  {
    id: 'braille-hub',
    title: 'نظام برايل المتكامل والمترجم الشامل',
    category: 'التربية الخاصة - برايل',
    route: '/damij/braille',
    icon: 'damij',
    description: 'محرر برايل التفاعلي، تحويل النصوص العربية والإنجليزية إلى خلايا برايل 6-نقاط والرسومات اللمسية.',
    tags: ['برايل', 'لمس', 'قراءة', 'كتابة']
  },
  {
    id: 'autism-hub',
    title: 'عيادة وبرامج طيف التوحد (Autism Suite)',
    category: 'التربية الخاصة - التوحد',
    route: '/damij/autism',
    icon: 'damij',
    description: 'أدوات التشخيص وفق DSM-5، خطط علاجية فردية (IEP)، ألعاب تنمية المهارات الاجتماعية والتواصلية.',
    tags: ['توحد', 'autism', 'خطة علاجية', 'dsm-5', 'تواصل']
  },
  {
    id: 'adhd-hub',
    title: 'مركز تقييم وتدريب تشتت الانتباه (ADHD)',
    category: 'التربية الخاصة - ADHD',
    route: '/damij/adhd',
    icon: 'damij',
    description: 'اختبارات CPT و N-Back و Stroop، أدوات تدريب التركيز الذهني والتثبيط الاستجابي مع تقارير سريرية.',
    tags: ['adhd', 'تشتت', 'تركيز', 'cpt', 'stroop', 'n-back']
  },
  {
    id: 'sign-language-hub',
    title: 'مترجم وقاموس لغة الإشارة الذكي',
    category: 'التربية الخاصة - السمعي',
    route: '/damij/sign',
    icon: 'damij',
    description: 'تحويل الصوت والنصوص إلى إشارات بالذكاء الاصطناعي، قاموس الإشارات المعتمد، ومترجم فيديوهات يوتيوب.',
    tags: ['إشارة', 'صم', 'سمعي', 'قاموس', 'مترجم']
  },
  {
    id: 'sensory-bridge',
    title: 'الجسر الحسي والتواصل المتعدد (Sensory Bridge)',
    category: 'التربية الخاصة - الحسي',
    route: '/damij/sensory',
    icon: 'damij',
    description: 'توليد الرسومات اللمسية، التغذية اللمسية الارتجاعية (Haptic)، وواجهات حسية متكيفة متوافقة مع WCAG 2.1.',
    tags: ['حسي', 'لمسي', 'اهتزاز', 'نفاذية']
  },
  {
    id: 'clinical-cases',
    title: 'المختبر السريري والحالات الافتراضية',
    category: 'التربية الخاصة - تدريب سريري',
    route: '/damij/clinical',
    icon: 'damij',
    description: 'محاكاة سريرية لتدريب الأخصائيين والأطباء على تشخيص الحالات المعقدة ووضع بروتوكولات التدخل.',
    tags: ['سريري', 'طبي', 'تشخيص', 'أخصائي']
  },

  // 2. Robotics, AI & Smart City (الروبوتات، الذكاء الاصطناعي، والمدينة الذكية)
  {
    id: 'robotics-lab',
    title: 'مختبر الروبوتات والذكاء الاصطناعي',
    category: 'الروبوتات والذكاء الاصطناعي',
    route: '/robotics',
    icon: 'robotics',
    description: 'محاكاة الحركية العكسية (IK)، بيئة ROS 2، محرر بايثون في المتصفح، ورسم الخرائط بالليزر LiDAR SLAM.',
    tags: ['روبوت', 'ik', 'ros', 'بايثون', 'slam', 'ذراع']
  },
  {
    id: 'smart-city-hub',
    title: 'مجمع المدينة الذكية والتقنيات التوليدية',
    category: 'المدينة الذكية والهندسة',
    route: '/smart-city',
    icon: 'robotics',
    description: 'منظومة العمارة الذكية: التصميم المعماري التوليدي، الطباعة الإنشائية ثلاثية الأبعاد، والتصميم الداخلي AI.',
    tags: ['مدينة ذكية', 'عمارة', 'إنشاء', 'طباعة 3d']
  },
  {
    id: 'future-store',
    title: 'متجر المستقبل والدفع بالوجه (FacePay AI)',
    category: 'الذكاء الاصطناعي والتجارة',
    route: '/future-store',
    icon: 'robotics',
    description: 'محاكاة التعرف البيومتري على الوجوه، السلال الذكية، ونقاط البيع المستقلة بدون كاشير.',
    tags: ['facepay', 'متجر', 'بصمة وجه', 'دفع']
  },
  {
    id: 'cancer-detection',
    title: 'منظومة الكشف المبكر عن الأورام بالذكاء الاصطناعي',
    category: 'الذكاء الاصطناعي الطبي',
    route: '/cancer-detection',
    icon: 'robotics',
    description: 'شبكات عصبية عميقة لتحليل الصور الطبية والأشعة السينية وتحديد الكتل المشتبه بها بدقة فائقة.',
    tags: ['سرطان', 'أورام', 'أشعة', 'طبي', 'ذكاء اصطناعي']
  },
  {
    id: 'jordan-digital-twin',
    title: 'التوأم الرقمي للمدن والبنى التحتية',
    category: 'المدن الذكية والتوائم الرقمية',
    route: '/jordan-digital-twin',
    icon: 'robotics',
    description: 'محاكاة تفاعلية للشبكات الحضرية، إدارة الطاقة، تدفق المرور، والاستجابة للطوارئ في الأردن.',
    tags: ['توأم رقمي', 'مدن', 'مرور', 'طاقة']
  },

  // 3. National Curriculum, Tawjihi & BTEC (المنهاج الأردني، التوجيهي، وبيلد تيك IT)
  {
    id: 'jordanian-assistant',
    title: 'المرشد الوزاري للمنهاج الأردني (توجيهي)',
    category: 'المناهج والتوجيهي',
    route: '/jordanian-assistant',
    icon: 'curriculum',
    description: 'مساعد ذكي مدرب على الكتب المدرسية الأردنية الرسمية، أسئلة الامتحانات الوزارية، وشرح الدروس بالتفصيل.',
    tags: ['توجيهي', 'أردني', 'منهاج', 'وزاري', 'امتحانات']
  },
  {
    id: 'math-question-bank',
    title: 'بنك أسئلة الرياضيات الوزارية',
    category: 'الرياضيات والتوجيهي',
    route: '/math-question-bank',
    icon: 'curriculum',
    description: 'مئات الأسئلة الوزارية المصنفة للفرعين العلمي والأدبي مع خطوات الحل النموذجية والمخططات التوضيحية.',
    tags: ['رياضيات', 'توجيهي', 'بنك أسئلة', 'تفاضل', 'تكامل']
  },
  {
    id: 'btec-it-hub',
    title: 'منصة بيرسون BTEC لتكنولوجيا المعلومات',
    category: 'التعليم التقني والمهني',
    route: '/btec-it',
    icon: 'curriculum',
    description: 'الوحدات الدراسية المعتمدة لدبلوم BTEC IT، مشاريع البرمجة، هندسة البرمجيات، والشبكات وقواعد البيانات.',
    tags: ['btec', 'بيرسون', 'it', 'برمجة', 'شبكات']
  },
  {
    id: 'tech-coding-platform',
    title: 'مختبر البرمجة وكتابة الأكواد التفاعلي',
    category: 'الحوسبة والبرمجة',
    route: '/tech-coding',
    icon: 'curriculum',
    description: 'بيئة تطوير متكاملة للمبرمجين مع محرر أكواد ومترجم فوري للغات JavaScript و Python و HTML/CSS.',
    tags: ['برمجة', 'كود', 'بايثون', 'جافاسكريبت']
  },
  {
    id: 'spaced-repetition',
    title: 'نظام الحفظ والتكرار المتباعد (Spaced Repetition)',
    category: 'أدوات التفوق الدراسي',
    route: '/spaced-repetition',
    icon: 'curriculum',
    description: 'خوارزمية SuperMemo SM-2 لمقاومة منحنى النسيان وضمان ترسيخ المفاهيم والمعادلات في الذاكرة طويلة الأمد.',
    tags: ['تكرار متباعد', 'حفظ', 'ذاكرة', 'مذاكرة']
  },

  // 4. Astrophysics & Space (الفيزياء الفلكية والنسبية)
  {
    id: 'black-hole',
    title: 'محاكاة الثقب الأسود الدوّار (Kerr)',
    category: 'الفيزياء الفلكية والنسبية',
    route: '/black-hole',
    icon: 'astronomy',
    description: 'استكشف أفق الحدث، قرص التنامي فائق السخونة، النفاثات النسبية وانحناء الزمكان ثلاثي الأبعاد.',
    tags: ['ثقب أسود', 'أفق الحدث', 'تنامي', 'زمكان', 'جاذبية']
  },
  {
    id: 'special-relativity',
    title: 'محاكاة النسبية الخاصة لآينشتاين',
    category: 'الفيزياء الحديثة والنسبية',
    route: '/special-relativity',
    icon: 'physics',
    description: 'شاهد تمدد الزمن عبر الساعة الضوئية، انكماش لورنتز للأطوال، ونفق الالتواء عند الاقتراب من سرعة الضوء.',
    tags: ['نسبية', 'آينشتاين', 'تمدد الزمن', 'لورنتز', 'ضوء']
  },
  {
    id: 'orbital-mechanics',
    title: 'الميكانيكا المدارية وقوانين كبلر',
    category: 'علوم الفضاء والميكانيكا السماوية',
    route: '/orbital-mechanics',
    icon: 'astronomy',
    description: 'تتبع مدارات الأقمار الصناعية حول الأرض، سرعة الإفلات، ومناورات هومان الانتقالية ثلاثية الأبعاد.',
    tags: ['مدار', 'كبلر', 'أقمار', 'إفلات', 'جاذبية']
  },
  {
    id: 'solar-system',
    title: 'المجموعة الشمسية والمدارات الكوكبية 3D',
    category: 'علم الفلك',
    route: '/solar-system',
    icon: 'astronomy',
    description: 'جولة ثلاثية الأبعاد تفاعلية بين الشمس والكواكب الثمانية مع حلقات زحل ومسارات الكواكب الحقيقية.',
    tags: ['شمس', 'كواكب', 'فلك', 'أرض', 'مريخ']
  },
  {
    id: 'advanced-astronomy',
    title: 'الفلك المتقدم: الكسوف والخسوف وأطوار القمر',
    category: 'علم الفلك الرصدي',
    route: '/advanced-astronomy',
    icon: 'astronomy',
    description: 'محاكاة هندسية ثلاثية الأبعاد لكسوف الشمس، خسوف القمر، ومخاريط الظل التام وشبه الظل وخاتم الماس.',
    tags: ['كسوف', 'خسوف', 'قمر', 'ظل']
  },
  {
    id: 'rocket-science',
    title: 'علم الصواريخ والدفع الفضائي 3D',
    category: 'هندسة الفضاء',
    route: '/rocket-science',
    icon: 'astronomy',
    description: 'صاروخ متعدد المراحل، معادلة تسيولكوفسكي للدفع، عقد ماخ النفاثة، والهبوط الموجه العمودي.',
    tags: ['صاروخ', 'دفع', 'تسيولكوفسكي', 'فضاء']
  },

  // 5. Mechanics, Waves & Aerodynamics (الميكانيكا والموائع والأمواج)
  {
    id: 'wind-tunnel',
    title: 'نفق الرياح والديناميكا الهوائية (NACA)',
    category: 'هندسة الطيران والموائع',
    route: '/aerodynamics-wind-tunnel',
    icon: 'physics',
    description: 'أجنحة NACA الرياضية، خطوط انسياب برنولي، ظاهرة الانهيار (Stall)، ومخروط ماخ الصوتي الأسرع من الصوت.',
    tags: ['رياح', 'طيران', 'برنولي', 'نفق', 'أيروديناميكا']
  },
  {
    id: 'projectile-motion',
    title: 'محاكاة حركة المقذوفات والباليستيات 3D',
    category: 'الميكانيكا الكلاسيكية',
    route: '/projectile-motion',
    icon: 'physics',
    description: 'مدفع ثلاثي الأبعاد يطلق قذائف مع حساب مقاومة الهواء، متجهات الرياح، وزوايا الإطلاق المثالية.',
    tags: ['مقذوفات', 'مدفع', 'باليستي', 'حركة', 'جاذبية']
  },
  {
    id: 'fluid-mechanics',
    title: 'ميكانيكا الموائع والهيدروليكا',
    category: 'الفيزياء الميكانيكية',
    route: '/fluid-mechanics',
    icon: 'physics',
    description: 'قاعدة أرخميدس للطفو، المكبس الهيدروليكي لباسكال، وأنبوب فنتوري لقياس تدفق السوائل والضغط.',
    tags: ['موائع', 'أرخميدس', 'باسكال', 'طفو', 'هيدروليك']
  },
  {
    id: 'waves-sound',
    title: 'الموجات والصوتيات وتأثير دوبلر',
    category: 'فيزياء الأمواج والصوت',
    route: '/waves-sound',
    icon: 'physics',
    description: 'أمواج طولية ومستعرضة، تأثير دوبلر الصوتي الأسرع من الصوت، وتداخل الأمواج ثلاثي الأبعاد.',
    tags: ['أمواج', 'صوت', 'دوبلر', 'تردد']
  },
  {
    id: 'circular-motion',
    title: 'الحركة الدائرية والقوة المركزية 3D',
    category: 'الميكانيكا الكلاسيكية',
    route: '/circular-motion',
    icon: 'physics',
    description: 'البندول المخروطي، متجهات التسارع المركزي، وحساب قوى الشد والسرعة الزاوية في مسارات دائرية.',
    tags: ['دائرية', 'قوة مركزية', 'بندول', 'تسارع']
  },
  {
    id: 'interference-diffraction',
    title: 'التداخل والحيود البصري وتجربة يونغ',
    category: 'البصريات الموجية',
    route: '/interference-diffraction',
    icon: 'physics',
    description: 'تجربة شقي يونغ، حيود فرانهوفر، وحلقات نيوتن التداخلية مع ليزر أحادي اللون فائق الدقة.',
    tags: ['تداخل', 'حيود', 'يونغ', 'ضوء', 'ليزر']
  },

  // 6. Electricity, Magnetism & Quantum (الكهرباء وميكانيكا الكم)
  {
    id: 'circuit-builder',
    title: 'مختبر بناء الدوائر الكهربائية 3D',
    category: 'الكهرومغناطيسية والدوائر',
    route: '/circuit-builder',
    icon: 'physics',
    description: 'بناء وتوصيل الدوائر الكهربائية (توالي وتوازي)، قانون كيرشوف، وتحليل فرق الجهد والتيار والمقاومة.',
    tags: ['دارة', 'دائرة', 'كهرباء', 'أوم', 'كيرشوف']
  },
  {
    id: 'quantum-mechanics',
    title: 'ميكانيكا الكم والنفق الكمومي',
    category: 'الفيزياء الكمية',
    route: '/quantum-mechanics',
    icon: 'physics',
    description: 'دالة الموجة لشرودنجر، مبدأ عدم اليقين لهايزنبرغ، وظاهرة النفاذ الكمومي عبر الحواجز المجهرية.',
    tags: ['كم', 'هايزنبرغ', 'شرودنجر', 'نفق كمومي']
  },
  {
    id: 'photoelectric-effect',
    title: 'الظاهرة الكهروضوئية لألبرت آينشتاين',
    category: 'فيزياء الكم والضوء',
    route: '/photoelectric-effect',
    icon: 'physics',
    description: 'انبعاث الإلكترونات من سطح المعدن بواسطة الفوتونات، تردد العتبة، ودالة الشغل التي نال بها آينشتاين نوبل.',
    tags: ['كهروضوئية', 'فوتون', 'عتبة', 'إلكترون']
  },
  {
    id: 'superconductivity',
    title: 'الموصلية الفائقة وتأثير مايسنر',
    category: 'فيزياء الحالة الصلبة',
    route: '/superconductivity',
    icon: 'physics',
    description: 'الرفع المغناطيسي الكمومي، طرد خطوط الفيض المغناطيسي، وانعدام المقاومة الكهربائية عند التبريد.',
    tags: ['موصلية فائقة', 'مايسنر', 'رفع مغناطيسي', 'مغناطيس']
  },
  {
    id: 'lhc-simulation',
    title: 'مصادم الهادرونات الكبير (LHC) وبوزون هيغز',
    category: 'فيزياء الجسيمات الأولية',
    route: '/lhc-simulation',
    icon: 'physics',
    description: 'تسريع البروتونات في أنبوب مغناطيسي فائق بطول 27 كم، تصادمات طاقة التيرافولت، واكتشاف جسيم هيغز.',
    tags: ['lhc', 'سيرن', 'هيغز', 'جسيمات', 'بروتون']
  },
  {
    id: 'build-atom',
    title: 'بناء الذرة ونموذج بور ثلاثي الأبعاد',
    category: 'الفيزياء الذرية',
    route: '/build-atom',
    icon: 'physics',
    description: 'تجميع البروتونات والنيوترونات والإلكترونات في مستويات الطاقة الكمومية واستكشاف نظائر العناصر.',
    tags: ['ذرة', 'بور', 'بروتون', 'إلكترون', 'طاقة']
  },
  {
    id: 'advanced-nuclear',
    title: 'المفاعل النووي وإشعاع شيرينكوف',
    category: 'الفيزياء النووية',
    route: '/advanced-nuclear',
    icon: 'physics',
    description: 'الانشطار المتسلسل لليورانيوم، قضبان التحكم، ووميض شيرينكوف الأزرق داخل حوض المفاعل المهدئ بالماء.',
    tags: ['نووي', 'مفاعل', 'انشطار', 'شيرينكوف']
  },
  {
    id: 'static-electricity',
    title: 'الكهرباء الساكنة ومولد فان دي غراف',
    category: 'الكهرومغناطيسية',
    route: '/static-electricity',
    icon: 'physics',
    description: 'توزيع الشحنات الكهربائية، قانون كولوم للتنافر والتجاذب، وحقل الجهد الكهربائي الشديد.',
    tags: ['ساكنة', 'فان دي غراف', 'كولوم', 'شحنة']
  },

  // 7. Chemistry & Material Science (الكيمياء والمواد)
  {
    id: 'acids-bases',
    title: 'مختبر الأحماض والقواعد والمعايرة',
    category: 'الكيمياء العامة',
    route: '/acids-bases',
    icon: 'chemistry',
    description: 'مقياس الرقم الهيدروجيني pH، تراكيز أيونات الهيدرونيوم والهيدروكسيد، ومنحنيات المعايرة الحجمية.',
    tags: ['أحماض', 'قواعد', 'ph', 'معايرة', 'كيمياء']
  },
  {
    id: 'chemical-equilibrium',
    title: 'الاتزان الكيميائي ومبدأ لوشاتيليه',
    category: 'الكيمياء الفيزيائية',
    route: '/chemical-equilibrium',
    icon: 'chemistry',
    description: 'غرفة تصادم الجزيئات (تفاعل هابر-بوش)، تأثير الضغط والحرارة والتركيز على موضع الاتزان.',
    tags: ['اتزان', 'لوشاتيليه', 'هابر', 'تفاعل']
  },
  {
    id: 'organic-chemistry',
    title: 'الكيمياء العضوية وتشكيل الجزيئات 3D',
    category: 'الكيمياء العضوية',
    route: '/organic-chemistry',
    icon: 'chemistry',
    description: 'نماذج الكرات والعصي ثلاثية الأبعاد للألكانات والألكينات والمركبات الحلقية والعطرية مع زوايا الروابط.',
    tags: ['عضوية', 'كربون', 'جزيء', 'ألكان', 'روابط']
  },
  {
    id: 'electrochemistry',
    title: 'الكيمياء الكهربائية والخلايا الجلفانية',
    category: 'الكيمياء الفيزيائية',
    route: '/electrochemistry',
    icon: 'chemistry',
    description: 'الأنود والكاثود، نصف تفاعلات التأكسد والاختزال، حركة الإلكترونات، ومعادلة نيرنست للجهد.',
    tags: ['كيمياء كهربائية', 'جلفانية', 'تأكسد', 'اختزال']
  },

  // 8. Biology, Genetics & Earth Sciences (الأحياء والجينات وعلوم الأرض)
  {
    id: 'molecular-biology',
    title: 'علم الأحياء الجزيئي وتضاعف DNA',
    category: 'البيولوجيا الجزيئية',
    route: '/molecular-biology',
    icon: 'biology',
    description: 'محاكاة تضاعف DNA بإنزيم الهيليكاز والبوليمريز، النسخ الجيني mRNA، وترجمة عديد الببتيد في الريبوسوم.',
    tags: ['dna', 'جينات', 'تضاعف', 'ترجمة', 'ريبوسوم']
  },
  {
    id: 'crispr-simulation',
    title: 'مختبر التعديل الجيني كريسبر (CRISPR-Cas9)',
    category: 'التكنولوجيا الحيوية والجينات',
    route: '/crispr-simulation',
    icon: 'biology',
    description: 'تصميم RNA الدليل (gRNA)، رصد تسلسل PAM، والقطع الجراحي الدقيق لجينات الطفرات الوراثية.',
    tags: ['crispr', 'كريسبر', 'جينات', 'تعديل جيني', 'cas9']
  },
  {
    id: 'photosynthesis-respiration',
    title: 'البناء الضوئي والتنفس ومحرك ATP',
    category: 'الطاقة الحيوية والأيض',
    route: '/photosynthesis-respiration',
    icon: 'biology',
    description: 'أقراص الثايلاكويد، سيل الفوتونات، وتوربين ATP Synthase الدوار في الميتوكوندريا لتوليد طاقة الحياة.',
    tags: ['بناء ضوئي', 'تنفس', 'atp', 'ميتوكوندريا', 'كلوروفيل']
  },
  {
    id: 'immune-system',
    title: 'الجهاز المناعي والأجسام المضادة 3D',
    category: 'علم المناعة والطب',
    route: '/immune-system',
    icon: 'biology',
    description: 'البلعمة الفطرية، إفراز الأجسام المضادة Y-shaped، وتحييد أشواك الفيروسات والخلايا التائية والبائية.',
    tags: ['مناعة', 'أجسام مضادة', 'فيروس', 'بلعمة', 'لقاح']
  },
  {
    id: 'living-cell',
    title: 'الخلية الحية وعضياتها ثلاثية الأبعاد',
    category: 'علم الأحياء الدقيقة',
    route: '/living-cell',
    icon: 'biology',
    description: 'استكشف الميتوكوندريا، النواة، الشبكة الإندوبلازمية، وجهاز جولجي بتكبير مجهري دقيق ثلاثي الأبعاد.',
    tags: ['خلية', 'عضيات', 'نواة', 'مجهر']
  },
  {
    id: 'human-body',
    title: 'تشريح جسم الإنسان التفاعلي 3D',
    category: 'التشريح والفسيولوجيا',
    route: '/human-body',
    icon: 'biology',
    description: 'أجهزة الدوران والقلب، الهيكل العظمي، العضلات، والجهاز العصبي بدقة ثلاثية الأبعاد وطبقات تشريحية.',
    tags: ['جسم الإنسان', 'تشريح', 'قلب', 'هيكل عظمي', 'عضلات']
  },
  {
    id: 'earth-sciences',
    title: 'علوم الأرض والجيولوجيا التفاعلية 3D',
    category: 'علوم الأرض والجيوفيزياء',
    route: '/earth-sciences',
    icon: 'physics',
    description: 'بؤرة الزلازل وموجات P و S، حجرة الصهارة وثوران البراكين، وانغراز الصفائح التكتونية على مقياس ريختر.',
    tags: ['زلزال', 'بركان', 'صفائح', 'جيولوجيا', 'ريختر']
  },

  // 9. Documentation & Scientific References (المراجع والتوثيق)
  {
    id: 'sources-library',
    title: 'المكتبة العلمية والمصادر الموثقة',
    category: 'المراجع والأبحاث',
    route: '/damij/sources',
    icon: 'general',
    description: 'أكثر من 70 مرجعاً علمياً ودولياً محكماً (DSM-5, APA, Nature, Science, W3C WCAG) مع توثيق أكاديمي.',
    tags: ['مصادر', 'مراجع', 'أبحاث', 'توثيق', 'dsm-5']
  }
];

// Offline-First Intelligent Scientific Knowledge Engine with Persona Awareness
export function generateIntelligentResponse(
  query: string, 
  userName: string,
  persona: MentorPersona = 'academic'
): { 
  answer: string; 
  recommendations: SimulationRecommendation[];
  suggestions: string[];
  navigationPath?: string;
} {
  const q = query.toLowerCase().trim();
  const matchedRecs: SimulationRecommendation[] = [];

  // Semantic matcher across registry tags, title and description
  for (const sim of SIMULATION_REGISTRY) {
    const inTitle = sim.title.toLowerCase().includes(q) || q.includes(sim.title.toLowerCase());
    const inCategory = sim.category.toLowerCase().includes(q) || q.includes(sim.category.toLowerCase());
    const inTags = sim.tags?.some(tag => q.includes(tag.toLowerCase()) || tag.toLowerCase().includes(q));

    if (inTitle || inCategory || inTags) {
      if (!matchedRecs.some(r => r.id === sim.id)) {
        matchedRecs.push(sim);
      }
    }
  }

  // Persona Mode: Quiz Master
  if (persona === 'quiz') {
    if (q.includes('كم') || q.includes('quantum') || q.includes('فوتون') || q.includes('كهروضوئية')) {
      return {
        answer: `### 🎯 تحدي المرشد في فيزياء الكم!\n\nأهلاً بك يا ${userName}! إليك سؤال التحدي الكمومي:\n\n**السؤال:** في تجربة الظاهرة الكهروضوئية، عند مضاعفة شدة الضوء الساقط (Intensity) مع تثبيت تردده فوق تردد العتبة، ماذا يحدث للإلكترونات المنبعثة؟\n\n1. تتضاعف طاقتها الحركية العظمى ($K_{max}$).\n2. يتضاعف عدد الإلكترونات المنبعثة (شدة تيار الإشباع) وتبقى الطاقة الحركية ثابتة.\n3. يتضاعف تردد العتبة للمعدن.\n\n💡 *ما هو رقم الإجابة الصحيحة؟ يمكنك اختبار هذه الظاهرة في محاكاتنا ثلاثية الأبعاد!*`,
        recommendations: [
          SIMULATION_REGISTRY.find(s => s.id === 'photoelectric-effect')!,
          SIMULATION_REGISTRY.find(s => s.id === 'quantum-mechanics')!
        ],
        suggestions: ['الإجابة هي رقم 2 (يتضاعف عدد الإلكترونات)', 'لماذا لا تتغير الطاقة الحركية مع الشدة؟', 'اطرح علي تحدياً في النسبية'],
        navigationPath: '/photoelectric-effect'
      };
    }

    if (q.includes('دامج') || q.includes('توحد') || q.includes('adhd') || q.includes('برايل')) {
      return {
        answer: `### 🎯 تحدي المرشد في علوم التربية الخاصة والدمج!\n\nأهلاً بك يا ${userName}! إليك سؤال التحدي في المعايير السريرية العالمية:\n\n**السؤال:** ما هو الغرض السريري الرئيسي من اختبار (Stroop Color-Word Task) المطبق في قسم ADHD بمنصة دامج؟\n\n1. قياس حدة الإبصار لدى الأطفال.\n2. قياس القدرة على التثبيط الاستجابي (Inhibitory Control) والمرونة الإدراكية.\n3. تدريب حاسة اللمس على خلايا برايل.\n\n💡 *فكر بالإجابة أو افتح مركز تقييم ADHD لتجربته بنفسك!*`,
        recommendations: [
          SIMULATION_REGISTRY.find(s => s.id === 'adhd-hub')!,
          SIMULATION_REGISTRY.find(s => s.id === 'sensory-bridge')!
        ],
        suggestions: ['الإجابة رقم 2 (التثبيط الاستجابي)', 'ما هو اختبار CPT في المنصة؟', 'افتح مركز تقييم ADHD'],
        navigationPath: '/damij/adhd'
      };
    }

    return {
      answer: `### 🎯 تحدي المرشد الذكي العلمي!\n\nأهلاً بك يا ${userName} في وضع **مدرب التحديات والمسابقات**! إليك هذا السؤال الذكي لاختبار عمق تفكيرك:\n\n**السؤال:** عند إطلاق قذيفة في الفراغ بدون مقاومة هواء، ما هي زاوية الإطلاق التي تحقق أقصى مدى أفقي ممكن؟ ولماذا يتناقص هذا المدى في الواقع؟\n\n1. زاوية 30° بسبب تقليل زمن التحليق.\n2. زاوية 45° نظراً لتساوي مركبتي السرعة الأفقية والرأسية وتحقيق القيمة العظمى لدالة $\\sin(2\\theta) = 1$.\n3. زاوية 60° لزيادة أقصى ارتفاع ممكن.\n\n💡 *اكتب رقم الإجابة الصحيحة أو افتح محاكاة المقذوفات لتختبرها عملياً بالمدفع ثلاثي الأبعاد!*`,
      recommendations: matchedRecs.length > 0 ? matchedRecs.slice(0, 2) : [SIMULATION_REGISTRY.find(s => s.id === 'projectile-motion')!],
      suggestions: ['الإجابة هي رقم 2 (زاوية 45 درجة)', 'اطرح علي تحدياً في فيزياء الكم', 'اطرح علي تحدياً في منصة دامج'],
      navigationPath: '/projectile-motion'
    };
  }

  // 1. Platform Founder / Architect: Mahmoud Jawarna
  if (q.includes('محمود') || q.includes('جوارنة') || q.includes('مؤسس') || q.includes('من بنى') || q.includes('من طور') || q.includes('من صمم')) {
    return {
      answer: `### 🏛️ المهندس والمصمم المعماري للمنصة: محمود جوارنة\n\nمنصة **«ذروة العلم»** ومنظومة **«دامج»** هي ثمرة رؤية وتنفيذ وإشراف **المهندس والمطور محمود جوارنة**.\n\n**محاور الرؤية والتطوير التي أرساها:**\n• **التحول التعليمي التفاعلي:** نقل التعليم العربي من التلقين النظري إلى المحاكاة التفاعلية ثلاثية الأبعاد (WebGL / Three.js).\n• **الشمول الرقمي الإنساني (دامج):** بناء أول منظومة عربية متكاملة لدمج ذوي الإعاقة (مكفوفين، صم، توحد، تشتت انتباه) بأحدث خوارزميات الذكاء الاصطناعي والمعايير الطبية.\n• **الربط بين المنهاج الوطني وتقنيات المستقبل:** تغطية المنهاج الأردني، امتحانات التوجيهي، ودبلوم BTEC، مع مختبرات متقدمة في الروبوتات والمدن الذكية.\n\n💡 *يسعدني إرشادك لأي قسم من الأقسام التي صممها وبناها في المنصة!*`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'damij-overview')!,
        SIMULATION_REGISTRY.find(s => s.id === 'robotics-lab')!,
        SIMULATION_REGISTRY.find(s => s.id === 'sources-library')!
      ],
      suggestions: ['أرني أقسام منصة دامج للتربية الخاصة', 'أرني مختبرات الروبوتات والذكاء الاصطناعي', 'أرني مجمع التجارب ثلاثية الأبعاد'],
      navigationPath: '/'
    };
  }

  // 2. Damij Platform & Special Education
  if (q.includes('دامج') || q.includes('تربية خاصة') || q.includes('إعاقة') || q.includes('ذوي الاحتياجات') || q.includes('تأهيل') || q.includes('damij')) {
    return {
      answer: `### 🌟 منظومة «دامج» الوطنية الشاملة للتربية الخاصة والدمج الرقمي\n\nأهلاً بك يا ${userName}! منصة **دامج** هي البيئة الرقمية الأكثر تكاملاً لتمكين ودعم الأفراد ذوي الإعاقة والأخصائيين وأولياء الأمور:\n\n**الأقسام الرئيسية لمنظومة دامج:**\n• **عين المكفوفين (Blind Eye AI):** نظام توجيه ذكي للمكفوفين عبر الكاميرا والتعرف الفوري على العقبات والنصوص.\n• **نظام برايل المتكامل:** محرر ومترجم برايل العربي والإنجليزي 6-نقاط مع طباعة الرسومات اللمسية.\n• **جناح طيف التوحد (Autism Suite):** أدوات تقييم وفق DSM-5، خطط تربوية فردية (IEP)، وألعاب تنمية المهارات الاجتماعية.\n• **مركز تقييم وتدريب تشتت الانتباه (ADHD):** اختبارات مقننة (CPT, N-Back, Stroop) وتدريب التركيز الذهني.\n• **مترجم لغة الإشارة الذكي:** قاموس الإشارات المعتمد، ومترجم فوري للصوت والنصوص وفيديوهات يوتيوب.\n• **الجسر الحسي (Sensory Bridge):** واجهات متكيفة لمسياً وصوتياً متوافقة مع معايير W3C WCAG 2.1 AAA.\n• **المكتبة العلمية والمصادر:** أكثر من 70 مرجعاً علمياً وطبياً محكماً.\n\nانقر على أي أداة بالأسفل للانتقال إليها فوراً!`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'damij-overview')!,
        SIMULATION_REGISTRY.find(s => s.id === 'blind-eye')!,
        SIMULATION_REGISTRY.find(s => s.id === 'autism-hub')!,
        SIMULATION_REGISTRY.find(s => s.id === 'adhd-hub')!
      ],
      suggestions: ['كيف يعمل نظام عين المكفوفين؟', 'أرني أدوات تشخيص وتدريب ADHD', 'أرني نظام برايل التفاعلي', 'افتح بوابة منصة دامج'],
      navigationPath: '/damij'
    };
  }

  // 3. Blind Eye AI
  if (q.includes('عين المكفوفين') || q.includes('مكفوف') || q.includes('بصري') || q.includes('blind eye') || q.includes('ملاحة المكفوفين')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'blind-eye');
    return {
      answer: `### 👁️ نظام عين المكفوفين الذكي (Blind Eye Navigator)\n\nنظام ثوري مخصص لتمكين الأشخاص ذوي الإعاقة البصرية من الحركة المستقلة والتفاعل مع العالم:\n\n**القدرات والوظائف التقنية:**\n• **كشف العوائق بالرؤية الحاسوبية:** استخدام شبكات عصبية (TensorFlow) لرصد الأبواب، السلالم، والأشخاص وتحديد مسافاتها.\n• **القراءة الفورية للنصوص (OCR):** توجيه الكاميرا نحو أي لافتة أو كتاب ليتم قراءته صوتياً باللغة العربية.\n• **إرشاد صوتي مكاني (Spatial Audio):** توجيه المستخدم باتجاهات دقيقة (يمين، يسار، توقف، تقدم).\n• **متوافق مع أجهزة الجوال:** يعمل بكفاءة وسرعة عبر كاميرا الهاتف المحمول مباشرة.\n\nيمكنك تجربة النظام أو تهيئته عبر النقر أدناه!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح نظام عين المكفوفين', 'كيف تعمل قراءة النصوص للمكفوفين؟', 'أرني محرر برايل التفاعلي'],
      navigationPath: '/damij/blind-eye'
    };
  }

  // 4. Braille System
  if (q.includes('برايل') || q.includes('braille') || q.includes('خلايا برايل') || q.includes('رسومات لمسية')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'braille-hub');
    return {
      answer: `### ⠃⠗⠁⠊⠇ نظام برايل المتكامل في منصة دامج\n\nبيئة متطورة لتعليم وتحويل لغة برايل بطريقة بصرية ولمسية تفاعلية:\n\n**مكونات النظام:**\n• **المترجم الشامل:** تحويل فوري للنصوص العربية والإنجليزية إلى خلايا برايل القياسية (6-نقاط) بدقة متناهية.\n• **التحويل العكسي:** إدخال خلايا برايل وتحويلها إلى نصوص مقروءة ومسموعة.\n• **المعلم التفاعلي:** تدريب خطوة بخطوة للطلاب والمعلمين على قراءة وكتابة حروف برايل وعلامات الترقيم.\n• **الرسومات اللمسية (Tactile Graphics):** تحويل المخططات والرسومات الهندسية إلى أنماط نقطية بارزة قابلة للطباعة اللمسية.`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح محرر ومترجم برايل', 'كيف أتعلم حروف برايل التفاعلية؟', 'أرني الجسر الحسي والرسومات اللمسية'],
      navigationPath: '/damij/braille'
    };
  }

  // 5. Autism & Sensory
  if (q.includes('توحد') || q.includes('autism') || q.includes('طيف التوحد') || q.includes('تواصل بصري')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'autism-hub');
    return {
      answer: `### 🧩 عيادة وبرامج طيف التوحد (Autism Care Suite)\n\nمنظومة متكاملة مبنية على أحدث المعايير العلمية (DSM-5) لدعم الأطفال المصابين بطيف التوحد وأسرهم:\n\n**المميزات الأساسية:**\n• **استبيانات التشخيص المقننة:** تقييم التواصل الاجتماعي، السلوكيات النمطية، والحساسية الحسية.\n• **الخطط العلاجية الفردية (IEP):** توليد خطة تدريبية مخصصة لكل طفل مع تقويم أسبوعي وشهري.\n• **ألعاب التأهيل الإدراكي:** ألعاب مصممة خصيصاً لتحفيز التواصل البصري، تمييز المشاعر، وتوسيع الحصيلة اللغوية.\n• **لوحة متابعة تطور الطفل:** تقارير بيانية ترصد مدى استجابة الطفل وتطوره مع مرور الوقت.`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح قسم طيف التوحد', 'أرني ألعاب التأهيل التفاعلية', 'ما هي معايير تشخيص التوحد DSM-5؟'],
      navigationPath: '/damij/autism'
    };
  }

  // 6. ADHD
  if (q.includes('adhd') || q.includes('تشتت') || q.includes('فرط الحركة') || q.includes('تركيز') || q.includes('انتباه')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'adhd-hub');
    return {
      answer: `### 🎯 مركز تقييم وتدريب تشتت الانتباه وفرط الحركة (ADHD)\n\nأدوات سريرية واختبارات نفسية-عصبية محوسبة لتقييم وتدريب الوظائف التنفيذية:\n\n**الاختبارات والمهام المعتمدة المتاحة:**\n• **مهمة الأداء المستمر (CPT):** قياس استدامة الانتباه، وسرعة الاستجابة، وزلات السهو.\n• **مهمة N-Back:** تقييم وتدريب الذاكرة العاملة اللحظية (Working Memory).\n• **اختبار ستروب (Stroop Task):** قياس كفاءة التثبيط الإدراكي ومقاومة المشتتات البصرية.\n• **مهمة Go / No-Go:** قياس القدرة على كبح الاندفاعية وضبط السلوك.\n• **ألعاب بناء التركيز اليومية:** تدريبات تفاعلية متدرجة الصعوبة لتعزيز الانتباه المستمر.`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح مركز تقييم ADHD', 'ابدأ اختبار مهمة الأداء المستمر CPT', 'ما هي استراتيجيات التعامل مع تشتت الانتباه؟'],
      navigationPath: '/damij/adhd'
    };
  }

  // 7. Robotics & Artificial Intelligence
  if (q.includes('روبوت') || q.includes('robotics') || q.includes('ros') || q.includes('بايثون') || q.includes('حركية عكسية') || q.includes('slam')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'robotics-lab');
    return {
      answer: `### 🤖 مختبر الروبوتات والأنظمة الذكية 3D\n\nأحدث مختبر افتراضي متكامل لهندسة وبرمجة الروبوتات في بيئة الويب مباشرة:\n\n**أبرز التقنيات والمحاكيات المدعومة:**\n• **الحركية المباشرة والعكسية (Forward & Inverse Kinematics):** ذراع روبوتي صناعي 6 درجات حرية (6-DOF) مع تحريك دقيق للمفاصل والمحدد النهائي.\n• **بيئة بايثون السحابية في المتصفح (Pyodide):** كتابة أكواد بايثون الحقيقية والتحكم في محركات الروبوت لحظياً.\n• **نظام تشغيل الروبوتات ROS 2:** محاكاة عقد النشر والاشتراك (Publish/Subscribe Topics) وتدفق الحساسات.\n• **الملاحة ورسم الخرائط (LiDAR SLAM):** مسح البيئة المحيطة بشعاع الليزر وبناء خريطة رقمية 2D/3D وتجنب العوائق.\n• **فحص العيوب بالذكاء الاصطناعي (Computer Vision):** رصد العيوب الصناعية على خطوط الإنتاج آلياً.\n\nانقر بالأسفل لفتح مختبر الروبوتات والبدء بكتابة الكود وتحريك الذراع!`,
      recommendations: [
        sim!,
        SIMULATION_REGISTRY.find(s => s.id === 'smart-city-hub')!
      ],
      suggestions: ['افتح مختبر الروبوتات 3D', 'كيف تعمل الحركية العكسية (Inverse Kinematics)؟', 'أرني محاكي رسم الخرائط LiDAR SLAM'],
      navigationPath: '/robotics'
    };
  }

  // 8. Smart City & Generative Architecture
  if (q.includes('مدينة ذكية') || q.includes('smart city') || q.includes('عمارة') || q.includes('بناء ثلاثي') || q.includes('تصميم داخلي')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'smart-city-hub');
    return {
      answer: `### 🏙️ مجمع المدينة الذكية والتقنيات التوليدية\n\nمنظومة هندسية مستقبلية تدمج الذكاء الاصطناعي في قطاع البناء والعمارة الذكية:\n\n**الأقسام الثلاثة للمدينة الذكية:**\n1. **التصميم المعماري التوليدي (AI Architecture):** خوارزميات توليد الكتل المعمارية بناءً على معايير الاستدامة وكفاءة الطاقة والشمس.\n2. **الطباعة الإنشائية ثلاثية الأبعاد (3D Construction):** محاكاة روبوتات صب الخرسانة بدقة مليمترية وتشييد المباني المستدامة.\n3. **التصميم الداخلي الذكي (AI Interior Design):** توزيع الفراغات، الإضاءة الطبيعية، وتأثيث الغرف آلياً بالذكاء الاصطناعي.\n\nيمكنك استكشاف مجمع المدينة الذكية وتجربة التصميم التوليدي الآن!`,
      recommendations: [
        sim!,
        SIMULATION_REGISTRY.find(s => s.id === 'robotics-lab')!
      ],
      suggestions: ['افتح قسم المدينة الذكية', 'كيف تعمل الطباعة الإنشائية ثلاثية الأبعاد؟', 'أرني التصميم المعماري التوليدي'],
      navigationPath: '/smart-city'
    };
  }

  // 9. Jordanian Curriculum & Tawjihi
  if (q.includes('توجيهي') || q.includes('منهاج أردني') || q.includes('وزاري') || q.includes('امتحان وزاري') || q.includes('ثانوية عامة') || q.includes('توجيهي علمي')) {
    return {
      answer: `### 🇯🇴 المرشد الوزاري وبنك أسئلة التوجيهي الأردني\n\nقسم متخصص صُمم لمساعدة طلبة الثانوية العامة الأردنية (التوجيهي) في تحقيق أعلى المعدلات:\n\n**الأدوات المتوفرة لطلبة التوجيهي:**\n• **المرشد الوزاري الذكي (/jordanian-assistant):** إجابات نموذجية مستندة حرفياً للكتب المدرسية المعتمدة لوزارة التربية والتعليم الأردنية.\n• **بنك أسئلة الرياضيات الوزارية (/math-question-bank):** أرشيف ضخم لأسئلة السنوات السابقة مرتبة حسب الدروس (تفاضل، تطبيقات التفاضل، تكامل، متجهات) مع حلول تفصيلية.\n• **نظام التكرار المتباعد (/spaced-repetition):** مراجعة القوانين والنظريات ومصطلحات الأحياء والفيزياء قبل الامتحانات.\n• **منظم جدول الدراسة الذكي (/study-schedule):** توزيع ساعات المذاكرة تلقائياً بحسب صعوبة المادة وأيام الامتحانات.\n\nاختر وجهتك من الروابط أدناه للبدء فوراً!`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'jordanian-assistant')!,
        SIMULATION_REGISTRY.find(s => s.id === 'math-question-bank')!,
        SIMULATION_REGISTRY.find(s => s.id === 'spaced-repetition')!
      ],
      suggestions: ['افتح المرشد الوزاري للتوجيهي', 'أرني بنك أسئلة الرياضيات الوزارية', 'كيف أستخدم نظام التكرار المتباعد للحفظ؟'],
      navigationPath: '/jordanian-assistant'
    };
  }

  // 10. BTEC IT & Tech Coding
  if (q.includes('btec') || q.includes('بيرسون') || q.includes('دبلوم') || q.includes('تقني') || q.includes('كود') || q.includes('برمجة')) {
    return {
      answer: `### 💻 منصة بيرسون BTEC لتكنولوجيا المعلومات والبرمجة\n\nبيئة تعليمية تقنية احترافية مخصصة لطلبة دبلوم BTEC Information Technology المعتمد دولياً:\n\n**محتويات القسم:**\n• **الوحدات الدراسية (Units):** شرح وحدات تكنولوجيا المعلومات، هندسة البرمجيات، قواعد البيانات، وأمن الشبكات.\n• **محرر الأكواد التفاعلي (/tech-coding):** تدرب على كتابة برامج JavaScript و Python وتصميم واجهات الويب مباشرة.\n• **مشاريع الطلبة التطبيقية:** نماذج استرشادية لتقارير ومشاريع التقييم العملي المعتمدة من بيرسون.\n• **مصحح الأكواد الذكي:** تحليل الأخطاء البرمجية وتقديم نصائح تحسين الأداء.\n\nانقر بالأسفل لفتح منصة BTEC أو تجربة مختبر البرمجة!`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'btec-it-hub')!,
        SIMULATION_REGISTRY.find(s => s.id === 'tech-coding-platform')!
      ],
      suggestions: ['افتح منصة BTEC لتكنولوجيا المعلومات', 'افتح محرر الأكواد والبرمجة', 'أرني الوحدات الدراسية لـ BTEC IT'],
      navigationPath: '/btec-it'
    };
  }

  // 11. Special Relativity
  if (q.includes('نسبية') || q.includes('اينشتاين') || q.includes('آينشتاين') || q.includes('تمدد الزمن') || q.includes('سرعة الضوء') || q.includes('لورنتز')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'special-relativity');
    const academicText = `### 🌌 نظرية النسبية الخاصة (Special Relativity)\n\nأهلاً بك يا ${userName}! النسبية الخاصة التي صاغها ألبرت آينشتاين عام 1905 غيرت فهمنا الجذري للمكان والزمان.\n\n**المبادئ والمعادلات الرياضية الأساسية:**\n• **معامل لورنتز التحويلي (Lorentz Factor):** $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$ حيث $c \\approx 3 \\times 10^8\\text{ m/s}$.\n• **تمدد الزمن الحركي (Time Dilation):** $\\Delta t = \\gamma \\Delta t_0$، مما يعني أن الزمن في إطار الإسناد المتحرك يمر أبطأ بالنسبة لمراقب ساكن.\n• **انكماش الأطوال (Length Contraction):** $L = \\frac{L_0}{\\gamma}$ في اتجاه الحركة فقط.\n• **مكافئ الكتلة والطاقة النسبي:** $E^2 = (pc)^2 + (m_0 c^2)^2$.\n\n💡 **في مختبرنا التفاعلي ثلاثي الأبعاد:** يمكنك تجربة الساعة الضوئية الحقيقية ومشاهدة ارتداد الفوتون وانكماش المركبة الفضائية مع نفق لورنتز فائق السرعة!`;
    const explorerText = `### 🚀 رحلة في عالم النسبية العجيب مع آينشتاين!\n\nتخيل يا ${userName} أنك تركب قطاراً فضائياً يسير بسرعة قريبة جداً من سرعة الضوء:\n\n• **ساعتك تبطئ:** إذا مر عليك داخل القطار أسبوع واحد، قد تجد أن سنوات كاملة قد مرت على أصدقائك في كوكب الأرض!\n• **الأجسام تنكمش:** إذا نظرت لمركبتك من الخارج ستراها مضغوطة وقصيرة جداً في اتجاه الحركة.\n• **الضوء لا يتغير:** مهما بلغت سرعتك، ستظل ترى شعاع الضوء يسبقك بنفس السرعة دائماً!\n\nانقر بالأسفل لتركب سفينة الفضاء وتختبر الساعة الضوئية بنفسك!`;
    return {
      answer: persona === 'explorer' ? explorerText : academicText,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['كيف تعمل الساعة الضوئية ثلاثية الأبعاد؟', 'ماذا يحدث إذا تجاوزنا سرعة الضوء؟', 'افتح محاكاة النسبية الخاصة 3D'],
      navigationPath: '/special-relativity'
    };
  }

  // 12. Black Hole
  if (q.includes('ثقب') || q.includes('black hole') || q.includes('أفق الحدث') || q.includes('انحناء الزمكان') || q.includes('تنامي')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'black-hole');
    return {
      answer: `### 🕳️ الثقوب السوداء الدوّارة (Kerr Black Holes)\n\nالثقب الأسود هو تركيز هائل للكتلة ينتج عنه انحناء لا نهائي تقريباً في نسيج الزمكان وفق معادلات النسبية العامة لآينشتاين.\n\n**المعالم الفيزيائية ثلاثية الأبعاد:**\n• **نصف قطر شفارتزشيلد (Schwarzschild Radius):** $r_s = \\frac{2GM}{c^2}$، وهو أفق الحدث الذي تنعدم عنده سرعة الإفلات حتى للفوتونات.\n• **منطقة الإرغوسفير (Ergosphere):** في الثقوب الدوارة، يُجبر الزمكان على الدوران مع الثقب (ظاهرة سحب الإطار Lense-Thirring).\n• **قرص التنامي فائق الحرارة (Accretion Disk):** تصادم وضغط الغازات الدوارة يولد درجات حرارة تصل ملايين الكلفن لتبث أشعة سينية متوهجة.\n• **عدسة الجاذبية (Gravitational Lensing):** انحناء مسار الضوء الآتي من النجوم الخلفية ليشكل حلقة آينشتاين الضوئية.\n\n🚀 يمكنك التحكم مباشرة في كتلة الثقب الأسود وسرعة دورانه النسبي في مختبرنا ثلاثي الأبعاد!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['ما هي عدسة الجاذبية؟', 'كيف تنطلق النفاثات النسبية من القطبين؟', 'افتح محاكاة الثقب الأسود ثلاثية الأبعاد'],
      navigationPath: '/black-hole'
    };
  }

  // 13. Aerodynamics & Wind Tunnel
  if (q.includes('رياح') || q.includes('طيران') || q.includes('أيروديناميك') || q.includes('برنولي') || q.includes('جناح') || q.includes('ماخ') || q.includes('نفق')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'wind-tunnel');
    return {
      answer: `### ✈️ نفق الرياح والديناميكا الهوائية (Aerodynamics)\n\nمحاكاة هندسية تفاعلية لدراسة جريان الهواء وتوليد قوى الرفع والسحب على أجنحة الطائرات:\n\n**المفاهيم الفيزيائية ثلاثية الأبعاد:**\n• **مبدأ برنولي:** سرعة الهواء العالية أعلى السطح المنحني للجناح تولد ضغطاً منخفضاً، مما يولد قوة الرفع ($L = \\frac{1}{2} C_L \\rho v^2 S$).\n• **زاوية الهجوم وظاهرة الانهيار (Stall):** زيادة زاوية الجناح عن الحد الحرج تسبب انفصال طبقة الهواء الحدودية وفقدان الرفع فجأة.\n• **مخروط ماخ الصوتي:** عند تجاوز سرعة الصوت ($Mach > 1$) تتراكم موجات الضغط لتشكل جدار الصوت وموجة الصدمة المائلة.\n\n🚀 يمكنك تغيير سرعة الهواء وزاوية الجناح واختبار أشكال NACA ثلاثية الأبعاد في نفق الرياح!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح نفق الرياح 3D', 'كيف تتولد قوة الرفع على الجناح؟', 'ما هو رقم ماخ ومخروط الصدمة الصوتي؟'],
      navigationPath: '/aerodynamics-wind-tunnel'
    };
  }

  // 14. Quantum & Photoelectric
  if (q.includes('كم') || q.includes('quantum') || q.includes('نفق كمومي') || q.includes('هايزنبرغ') || q.includes('كهروضوئية') || q.includes('فوتون')) {
    return {
      answer: `### ⚛️ عالم فيزياء الكم والظاهرة الكهروضوئية\n\nفي المقياس الذري ودون الذري، تتصرف الجسيمات وفق مبادئ ميكانيكا الكم المذهلة:\n\n**أهم المبادئ في مختبراتنا:**\n• **الظاهرة الكهروضوئية:** أثبت آينشتاين أن الضوء كمّات طاقة (فوتونات) معادلته $E = hf$، وأن طاقة الإلكترون المحرر تعتمد على التردد وليس الشدة.\n• **النفق الكمومي (Quantum Tunneling):** احتمال رياضي ناتج عن دالة الموجة لشرودنجر يسمح للجسيم باختراق حاجز طاقة مستحيل كلاسيكياً.\n• **مبدأ عدم اليقين لهايزنبرغ:** $\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$، يستحيل قياس موقع الجسيم وزخمه بدقة مطلقة في آنٍ واحد.\n\nانقر بالأسفل لتجربة محاكاة الظاهرة الكهروضوئية أو النفق الكمومي!`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'photoelectric-effect')!,
        SIMULATION_REGISTRY.find(s => s.id === 'quantum-mechanics')!,
        SIMULATION_REGISTRY.find(s => s.id === 'lhc-simulation')!
      ],
      suggestions: ['افتح محاكاة الظاهرة الكهروضوئية', 'افتح محاكاة النفق الكمومي', 'كيف تم اكتشاف بوزون هيغز في مصادم LHC؟'],
      navigationPath: '/photoelectric-effect'
    };
  }

  // 15. Molecular Biology & Genetics & CRISPR
  if (q.includes('dna') || q.includes('جين') || q.includes('وراثة') || q.includes('كريسبر') || q.includes('crispr') || q.includes('ريبوسوم') || q.includes('ترجمة')) {
    return {
      answer: `### 🧬 الأحياء الجزيئية ومختبر التعديل الجيني كريسبر\n\nاستكشف أسرار الشفرة الوراثية وتطبيقات الهندسة الجينية الحديثة في مختبراتنا ثلاثية الأبعاد:\n\n**المحاكيات الحيوية المتاحة:**\n• **تضاعف DNA والترجمة:** تتبع إنزيم الهيليكاز أثناء فك السلسلة المزدوجة، وعملية الترجمة في الريبوسوم لإنتاج سلاسل الأحماض الأمينية.\n• **مختبر كريسبر (CRISPR-Cas9):** استخدام مقص الـ Cas9 مع شريط الـ RNA الدليل لاستهداف طفرة وراثية وقطعها وإصلاحها بدقة فائقة.\n• **الجهاز المناعي:** مهاجمة الأجسام المضادة للفيروسات وتنشيط خلايا الدم البيضاء والبلعمة.\n\nانقر بالأسفل لخوض التجربة الحيوية الجزيئية مباشرة!`,
      recommendations: [
        SIMULATION_REGISTRY.find(s => s.id === 'molecular-biology')!,
        SIMULATION_REGISTRY.find(s => s.id === 'crispr-simulation')!,
        SIMULATION_REGISTRY.find(s => s.id === 'immune-system')!
      ],
      suggestions: ['افتح محاكاة تضاعف DNA والترجمة', 'كيف يعمل مقص كريسبر Cas9؟', 'افتح محاكاة الجهاز المناعي 3D'],
      navigationPath: '/molecular-biology'
    };
  }

  // 16. Sources & Research Library
  if (q.includes('مصادر') || q.includes('مراجع') || q.includes('أبحاث') || q.includes('مكتبة') || q.includes('source') || q.includes('توثيق')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'sources-library');
    return {
      answer: `### 📚 المكتبة العلمية والمصادر الموثقة في منصة «ذروة العلم»\n\nتعتمد منصتنا على أكثر من **70 مرجعاً علمياً ودولياً محكماً** لضمان الدقة الأكاديمية والسريرية المطلقة:\n\n**تصنيفات المراجع في المنصة:**\n• **المعايير الطبية الدولية:** الدليل التشخيصي والإحصائي DSM-5 للجمعية الأمريكية للطب النفسي.\n• **معايير النفاذية والشمول:** معايير W3C Web Content Accessibility Guidelines (WCAG 2.1 AAA).\n• **الأبحاث الفيزيائية والفلكية:** دوريات Nature و Physical Review ومطبوعات مختبرات سيرن (CERN) ووكالة ناسا (NASA).\n• **علوم الروبوتات والذكاء الاصطناعي:** أوراق مؤتمرات IEEE و ROS 2 Architecture Guidelines.\n\nيمكنك استعراض ونسخ التوثيق العلمي بنقرة واحدة من المكتبة أدناه!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح المكتبة العلمية الموثقة', 'أرني مصادر منصة دامج للتربية الخاصة', 'كيف تم التحقق من دقة التجارب الفيزيائية؟'],
      navigationPath: '/damij/sources'
    };
  }

  // 17. General Simulations Catalog Request
  if (q.includes('تجارب') || q.includes('أحدث') || q.includes('3d') || q.includes('محاكاة') || q.includes('مختبر') || q.includes('فهرس') || q.includes('أقسام')) {
    return {
      answer: `### 🚀 مجمع المختبرات الافتراضية ثلاثية الأبعاد والشاملة\n\nتحتوي منصة **«ذروة العلم»** على أكثر من 50 محاكاة تفاعلية وتطبيقاً ذكياً مقسمة عبر المحاور التالية:\n\n1. **منصة دامج للتربية الخاصة:** عين المكفوفين، محرر برايل، طيف التوحد، ADHD، ولغة الإشارة.\n2. **الروبوتات والتقنيات الذكية:** ذراع الروبوتات الصناعي، بايثون السحابي، ROS 2، LiDAR SLAM، والمدينة الذكية.\n3. **الفيزياء الفلكية والنسبية:** الثقب الأسود Kerr، النسبية الخاصة، الميكانيكا المدارية، والمجموعة الشمسية.\n4. **الميكانيكا والموائع وهندسة الطيران:** نفق الرياح NACA، المقذوفات 3D، وميكانيكا أرخميدس وباسكال.\n5. **فيزياء الكم والجسيمات والنووي:** النفق الكمومي، الكهروضوئية، مصادم LHC، والمفاعل النووي.\n6. **الكيمياء والأحياء والجينات:** كريسبر Cas9، تضاعف DNA، الاتزان الكيميائي، والمناعة.\n7. **المنهاج الأردني والتوجيهي و BTEC:** المرشد الوزاري، بنك الرياضيات، ودبلوم BTEC IT.\n\nاختر أي تجربة بالأسفل للانطلاق إليها بنقرة واحدة!`,
      recommendations: matchedRecs.length > 0 ? matchedRecs.slice(0, 4) : [
        SIMULATION_REGISTRY.find(s => s.id === 'damij-overview')!,
        SIMULATION_REGISTRY.find(s => s.id === 'robotics-lab')!,
        SIMULATION_REGISTRY.find(s => s.id === 'black-hole')!,
        SIMULATION_REGISTRY.find(s => s.id === 'wind-tunnel')!
      ],
      suggestions: ['أرني أدوات منصة دامج للتربية الخاصة', 'أرني مختبر الروبوتات والذكاء الاصطناعي', 'أرني تجارب الفيزياء الفلكية والنسبية', 'أرني أدوات التوجيهي والمنهاج الأردني'],
      navigationPath: '/scientific-simulations'
    };
  }

  // 18. Matched specific simulation by keyword
  if (matchedRecs.length > 0) {
    const topRec = matchedRecs[0];
    return {
      answer: `### 🔍 نتيجة البحث عن: «${query}»\n\nوجدت لك في المنصة مختبر: **${topRec.title}** (${topRec.category})!\n\n**نبذة عن المختبر:**\n${topRec.description}\n\n💡 يمكنك البدء مباشرة بالنقر على زر «بدء التجربة» بالأسفل أو سؤالي عن أي معادلة أو قانون فيزيائي يتعلق بها!`,
      recommendations: matchedRecs.slice(0, 3),
      suggestions: [`افتح ${topRec.title}`, `ما هي القوانين الفيزيائية في ${topRec.title}؟`, 'أرني تجارب أخرى مشابهة'],
      navigationPath: topRec.route
    };
  }

  // General Fallback
  return {
    answer: `### 🎓 مرحباً بك يا ${userName} في مرشدك الذكي 2.0!\n\nأنا مساعدك الأكاديمي والتقني الشامل في منصة «ذروة العلم» ومنظومة «دامج»، ولدي إحاطة كاملة بجميع أركان المنصة:\n\n• 🌟 **منصة دامج للتربية الخاصة:** عين المكفوفين، برايل، التوحد، ADHD، لغة الإشارة، والجسر الحسي.\n• 🤖 **الروبوتات والذكاء الاصطناعي:** محاكاة الحركية العكسية، بيئة ROS 2، بايثون، ورسم خرائط SLAM.\n• 🔬 **المختبرات ثلاثية الأبعاد (50+ تجربة):** النسبية، الثقب الأسود، نفق الرياح، كريسبر، الكم، والمفاعل النووي.\n• 🇯🇴 **المنهاج الأردني والتوجيهي و BTEC:** بنك أسئلة الوزارة، المرشد الوزاري، ودبلوم بيرسون IT.\n• 📚 **المكتبة العلمية والمصادر:** أكثر من 70 مرجعاً دولياً معتمداً وموثقاً.\n\nما هو القسم أو الموضوع العلمي الذي تود استكشافه الآن؟ 🚀`,
    recommendations: [
      SIMULATION_REGISTRY.find(s => s.id === 'damij-overview')!,
      SIMULATION_REGISTRY.find(s => s.id === 'robotics-lab')!,
      SIMULATION_REGISTRY.find(s => s.id === 'black-hole')!,
      SIMULATION_REGISTRY.find(s => s.id === 'jordanian-assistant')!
    ],
    suggestions: [
      'أرني أقسام منصة دامج للتربية الخاصة',
      'كيف يعمل مختبر الروبوتات والـ ROS 2؟',
      'اشرح لي نظرية النسبية الخاصة وآينشتاين',
      'أرني بنك أسئلة التوجيهي والمنهاج الأردني'
    ]
  };
}

export const PlatformGuideAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<MentorPersona>('academic');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | '3d' | 'damij' | 'robotics' | 'curriculum' | 'physics' | 'chemistry'>('all');
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastBotMessageRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch current user profile
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.username) setUserName(profile.username);
        }
      } catch {
        // Continue silently with guest
      }
    };
    getUser();
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-JO';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        toast.success(`تم التعرف على صوتك: "${transcript}"`);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('تعذر التقاط الصوت، يرجى المحاولة ثانية');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Welcome message initialization
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initial = generateIntelligentResponse('مرحبا', userName || 'صديقي', activePersona);
      setMessages([
        {
          id: 'welcome-msg',
          text: initial.answer,
          isUser: false,
          timestamp: new Date(),
          recommendations: initial.recommendations,
          suggestions: initial.suggestions,
          persona: activePersona
        }
      ]);
    }
  }, [isOpen]);

  // Scroll smoothly on new message: top of bot message when assistant answers, or bottom when user types
  useEffect(() => {
    if (!isOpen) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.isUser && messages.length > 1) {
      setTimeout(() => {
        lastBotMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Handle Speech Toggle
  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('خاصية التعرف الصوتي غير مدعومة في متصفحك الحالي');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('تحدث الآن، المساعد يستمع لصوتك...');
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text to Speech playback
  const handleSpeakText = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      toast.error('خاصية النطق الصوتي غير متوفرة في هذا المتصفح');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);

    const cleanText = text
      .replace(/[#*`$]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/•/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) utterance.voice = arabicVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Send message handler with true resilient streaming AI & smart reasoning
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMessageId,
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 1. Detect matching simulations or quick navigation path from platform catalog
    const lower = textToSend.toLowerCase();
    const isDirectNav = textToSend.includes('افتح') || textToSend.includes('انتقل') || textToSend.includes('اذهب');
    
    // Find matching simulations for rich cards
    const matchedSims = SIMULATION_REGISTRY.filter(sim => 
      sim.tags?.some(tag => lower.includes(tag.toLowerCase())) ||
      lower.includes(sim.title.toLowerCase())
    ).slice(0, 3);

    // Initial placeholder bot message
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      recommendations: matchedSims.length > 0 ? matchedSims : undefined,
      suggestions: [],
      persona: activePersona
    };

    setMessages(prev => [...prev, initialBotMessage]);

    // Build rich, intelligent system prompt
    const personaDescription = activePersona === 'academic' 
      ? 'النمط الأكاديمي المنهجي والتوجيهي: الشرح المنهجي العلمي، المعادلات والقوانين المنظمة، وخطوات الحل النموذجية.' 
      : activePersona === 'quiz' 
      ? 'نمط التحدي والمنافسة العلمية: اختبار الفهم، التفكير النقدي، وطرح أسئلة ذكية ملهمة.' 
      : activePersona === 'explorer' 
      ? 'نمط الاستكشاف العلمي: ربط العلوم بالكون، الفضاء، التكنولوجيا الحديثة، والروبوتات.' 
      : 'نمط الإرشاد والملاحة: التوجيه الذكي في المنصة وشرح الأدوات الأكاديمية.';

    const systemInstruction = `أنت "المرشد الذكي الشامل" (Omniscient Educational Mentor) والمسؤول الأكاديمي لمنصة "ذروة العلم 2.0" بمدرسة عنبه الثانوية الشاملة للبنين، وزارة التربية والتعليم الأردنية.
المتعلم: ${userName || 'المتعلم'}.
النمط النشط: ${personaDescription}.

المعايير الصارمة للإجابة والتفكير:
1. التفكير العميق والإجابة المخصصة: حلل سؤال المستخدم بعناية فائقة وأجب بطريقة علمية وبيداغوجية حقيقية مفصلة ومصممة بدقة حسب السؤال المطروح. تجنب تماماً القوالب الجاهزة أو الردود النمطية المتكررة.
2. الهيكل الأكاديمي الأنيق:
   - ابدأ بتمهيد لطيف ومفهوم جوهري واضح.
   - إذا كان السؤال عن الفيزياء أو الكيمياء أو الرياضيات أو الفلك: استخرج القوانين بالرموز الرياضية $E = mc^2$ واشرح مدلول كل رمز، مع إيراد خطوات حل نموذجية أو مثال واقعي.
   - إذا كان السؤال عن برمجة أو تقنية BTEC: نسق الكود بوضوح واشرح منطق الخوارزمية.
   - إذا كان استفساراً نفسياً أو عن إدارة الوقت وقلق الامتحانات: قدّم استراتيجيات عملية قائمة على علم النفس العصبي والعلاج المعرفي السلوكي (CBT).
   - إذا كان السؤال عن أقسام ومختبرات المنصة: اشرح كيف يفيده القسم وأين يجده في المنصة.
3. اختتم بنصيحة ذهبية وسؤال تفكيري تحفيزي يفتح مدارك الطالب.
اللغة: لغة عربية فصحى راقية، واضحة، وخالية من الركاكة.`;

    // Extract recent conversation history for deep context
    const recentHistory = messages.slice(-6).map(m => ({
      role: (m.isUser ? 'user' : 'model') as 'user' | 'model',
      content: m.text
    }));

    try {
      await resilientStreamingService.streamAI({
        prompt: textToSend,
        systemInstruction,
        chatHistory: recentHistory,
        onChunk: (_delta, fullText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: fullText } : msg
          ));
        },
        onComplete: (completedText) => {
          // Generate 2 contextual follow-up suggestions
          const dynamicSuggestions = [
            `اشرح لي تطبيقاً عملياً إضافياً على هذا المفهوم 🔬`,
            `ما هي التجربة ثلاثية الأبعاد المرتبطة بهذا الموضوع؟ 🚀`
          ];
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { 
              ...msg, 
              text: completedText,
              suggestions: dynamicSuggestions,
              navigationPath: matchedSims[0]?.route
            } : msg
          ));
          if (isVoiceActive) {
            handleSpeakText(completedText, botMessageId);
          }
        }
      });

      if (isDirectNav && matchedSims[0]?.route) {
        toast.success(`جاري توجيهك إلى: ${matchedSims[0].title}`);
        setTimeout(() => {
          navigate(matchedSims[0].route);
        }, 1500);
      }
    } catch (streamError) {
      console.warn('Streaming had an issue, falling back to instant local brain...', streamError);
      const fallbackResult = generateIntelligentResponse(textToSend, userName || 'صديقي', activePersona);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? {
          ...msg,
          text: fallbackResult.answer,
          recommendations: fallbackResult.recommendations,
          suggestions: fallbackResult.suggestions,
          navigationPath: fallbackResult.navigationPath
        } : msg
      ));
      if (isVoiceActive) {
        handleSpeakText(fallbackResult.answer, botMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render markdown text cleanly without hardcoded neon colors
  const renderMessageText = (text: string) => {
    const html = text
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-sm sm:text-base font-bold text-blue-700 dark:text-cyan-400 my-2 flex items-center gap-1.5"><bdi>$1</bdi></h3>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-base sm:text-lg font-extrabold text-blue-800 dark:text-cyan-300 my-2"><bdi>$1</bdi></h2>')
      .replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white my-2.5"><bdi>$1</bdi></h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white"><bdi>$1</bdi></strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300"><bdi>$1</bdi></em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60" dir="ltr">$1</code>')
      .replace(/\$([^\$]+)\$/g, '<span class="px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60" dir="ltr">$1</span>')
      .replace(/• (.*?)(?=\n|$)/g, '<div class="my-1.5 pr-3 relative text-slate-700 dark:text-slate-200 leading-relaxed"><span class="absolute right-0 text-blue-600 dark:text-cyan-400 font-bold">•</span><bdi>$1</bdi></div>')
      .replace(/\n/g, '<br/>');

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['br', 'h1', 'h2', 'h3', 'strong', 'em', 'code', 'span', 'div', 'p', 'bdi'],
      ALLOWED_ATTR: ['class', 'style', 'dir']
    });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص إلى الحافظة');
  };

  // Filtered simulations for bottom drawer tabs
  const filteredSims = useMemo(() => {
    if (activeCategoryFilter === 'all') return SIMULATION_REGISTRY;
    if (activeCategoryFilter === '3d') return SIMULATION_REGISTRY.filter(s => s.icon === 'physics' || s.icon === 'astronomy');
    if (activeCategoryFilter === 'damij') return SIMULATION_REGISTRY.filter(s => s.icon === 'damij');
    if (activeCategoryFilter === 'robotics') return SIMULATION_REGISTRY.filter(s => s.icon === 'robotics');
    if (activeCategoryFilter === 'curriculum') return SIMULATION_REGISTRY.filter(s => s.icon === 'curriculum');
    if (activeCategoryFilter === 'physics') return SIMULATION_REGISTRY.filter(s => s.icon === 'physics' || s.icon === 'astronomy');
    if (activeCategoryFilter === 'chemistry') return SIMULATION_REGISTRY.filter(s => s.icon === 'chemistry' || s.icon === 'biology');
    return SIMULATION_REGISTRY;
  }, [activeCategoryFilter]);

  const clearChatHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setMessages([]);
    toast.info('تمت إعادة ضبط محادثة المرشد الذكي');
  };

  return (
    <>
      {/* Enterprise Floating Trigger Pill */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 start-5 z-40 flex items-center gap-2"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:scale-102 transition-all duration-200"
              aria-label="فتح المرشد الذكي"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Brain className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold tracking-tight block text-slate-900 dark:text-white">المرشد الذكي</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/80">
                AI 2.0
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enterprise Modular Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Ambient Backdrop on Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Modular Sidebar / Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`fixed z-50 flex flex-col bg-white dark:bg-[#070B19] border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300
                ${isExpanded 
                  ? 'inset-4 md:inset-10' 
                  : 'bottom-4 start-4 end-4 sm:end-auto sm:w-[440px] h-[640px] max-h-[88vh]'
                }
              `}
            >
              {/* Header Bar */}
              <div className="h-16 px-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                      <Brain className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        المرشد الذكي الشامل
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 font-bold">
                        ذروة العلم + دامج
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">محمود جوارنة</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">نطق وإملاء صوتي فوري</span>
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsVoiceActive(!isVoiceActive);
                      if (speakingMessageId) {
                        window.speechSynthesis.cancel();
                        setSpeakingMessageId(null);
                      }
                      toast.info(!isVoiceActive ? 'تم تفعيل القراءة الصوتية التلقائية' : 'تم تعطيل القراءة الصوتية التلقائية');
                    }}
                    title={isVoiceActive ? 'تعطيل الصوت' : 'تفعيل القراءة الصوتية'}
                    className={`w-8 h-8 rounded-lg ${isVoiceActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChatHistory}
                    title="إعادة ضبط المحادثة"
                    className="w-8 h-8 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'تصغير' : 'تكبير'}
                    className="w-8 h-8 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:flex"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Persona Switcher Bar */}
              <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0 ml-1">النمط:</span>
                {[
                  { id: 'academic', label: '🎓 أكاديمي', desc: 'معادلات وشرح جامعي رصين' },
                  { id: 'explorer', label: '🚀 مستكشف', desc: 'تبسيط وتشبيهات ممتعة' },
                  { id: 'quiz', label: '🎯 مسابقات', desc: 'تحديات علمية وأسئلة ذكاء' },
                  { id: 'navigator', label: '🧭 مرشد', desc: 'توجيه سريع لأقسام المنصة' },
                ].map(p => {
                  const isActive = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePersona(p.id as MentorPersona);
                        toast.info(`تم تفعيل نمط: ${p.label}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={p.desc}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick Category Filter Bar */}
              <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0 ml-1">المحور:</span>
                {[
                  { id: 'all', label: 'الكل', icon: Compass },
                  { id: 'damij', label: 'دامج والتربية الخاصة', icon: HeartHandshake },
                  { id: 'robotics', label: 'روبوتات وذكاء اصطناعي', icon: Cpu },
                  { id: 'curriculum', label: 'توجيهي و BTEC', icon: GraduationCap },
                  { id: '3d', label: 'مختبرات 3D', icon: Zap },
                  { id: 'physics', label: 'فيزياء وفلك', icon: Atom },
                  { id: 'chemistry', label: 'كيمياء وأحياء', icon: FlaskConical },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isCurrent = activeCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 border ${
                        isCurrent 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/60 shadow-xs' 
                          : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Messages Scroll View */}
              <EnhancedScrollArea className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-[#070B19]">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isSpeakingThis = speakingMessageId === message.id;
                    const isLastBotMessage = !message.isUser && index === messages.length - 1;
                    return (
                      <motion.div
                        key={message.id}
                        ref={isLastBotMessage ? lastBotMessageRef : undefined}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2.5 max-w-[94%] sm:max-w-[88%] ${message.isUser ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-xs ${
                            message.isUser
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-indigo-600 border-indigo-500 text-white'
                          }`}>
                            {message.isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>

                          {/* Message Content Bubble */}
                          <div className={`rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed border space-y-2.5 ${
                            message.isUser
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/40 rounded-br-sm shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-800 rounded-bl-sm shadow-sm'
                          }`}>
                            {/* Rich sanitized text */}
                            <div
                              className="leading-relaxed select-text"
                              dangerouslySetInnerHTML={{ __html: renderMessageText(message.text) }}
                            />

                            {/* Actions Footer for Assistant Messages */}
                            {!message.isUser && (
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  {/* Speech Audio Button */}
                                  <button
                                    onClick={() => handleSpeakText(message.text, message.id)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                                      isSpeakingThis 
                                        ? 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 font-bold' 
                                        : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                    title="استمع للإجابة بالصوت"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>{isSpeakingThis ? 'جاري القراءة...' : 'قراءة صوتية'}</span>
                                  </button>

                                  {/* Copy Button */}
                                  <button
                                    onClick={() => copyMessage(message.text)}
                                    className="p-1 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="نسخ الإجابة"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Feedback Button */}
                                  <button
                                    onClick={() => toast.success('شكراً على تقييمك الإيجابي! 👍')}
                                    className="p-1 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                    title="مفيد"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <span className="text-[10px] text-slate-400">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}

                            {/* Interactive Simulation Action Cards */}
                            {message.recommendations && message.recommendations.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>مختبرات وأقسام مقترحة للتطبيق الفوري:</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {message.recommendations.map(rec => (
                                    <div
                                      key={rec.id}
                                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group/card"
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                                            {rec.title}
                                          </span>
                                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            {rec.category}
                                          </Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                          {rec.description}
                                        </p>
                                      </div>

                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setIsOpen(false);
                                          navigate(rec.route);
                                        }}
                                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 shrink-0 flex items-center gap-1 self-start sm:self-auto shadow-xs font-medium"
                                      >
                                        <span>بدء التجربة</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Follow-up Questions Chips */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="pt-2 flex flex-wrap gap-1.5">
                                {message.suggestions.map((sug, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSendMessage(sug)}
                                    className="px-2.5 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-right font-medium"
                                  >
                                    💡 {sug}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Thinking Loading State */}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">المرشد الذكي يستحضر البيانات العلمية...</span>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </EnhancedScrollArea>

              {/* Bottom Quick Recommendations Carousel */}
              {messages.length <= 1 && (
                <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>تجارب ومواضيع مقترحة:</span>
                    </p>
                    <span className="text-[10px] text-slate-500">انقر للتشغيل فوراً</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filteredSims.slice(0, 6).map((sim) => (
                      <button
                        key={sim.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(sim.route);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-right shrink-0 transition-all group shadow-xs"
                      >
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
                          <span>{sim.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{sim.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Message Area with Speech-to-Text Microphone */}
              <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleToggleVoiceInput}
                    size="icon"
                    className={`h-10 w-10 rounded-xl shrink-0 transition-all border ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                    title={isListening ? 'إيقاف الاستماع' : 'تحدث بصوتك مباشرة'}
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? 'جاري الاستماع لصوتك... 🎙️' : 'تحدث أو اكتب سؤالك عن أي قسم بالمنصة... 🚀'}
                    className={`flex-1 text-xs sm:text-sm h-10 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 transition-all ${
                      isListening ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20'
                    }`}
                    disabled={isLoading}
                  />

                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 text-white shrink-0 disabled:opacity-40 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlatformGuideAssistant;
