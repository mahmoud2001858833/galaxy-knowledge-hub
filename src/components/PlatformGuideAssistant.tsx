import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { 
  Send, X, Brain, User, Sparkles, Zap, Volume2, VolumeX, 
  Maximize2, Minimize2, RotateCcw, Compass, Atom, FlaskConical, 
  Dna, Rocket, ArrowRight, ExternalLink, HelpCircle, Check, 
  Bot, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface SimulationRecommendation {
  id: string;
  title: string;
  category: string;
  route: string;
  icon: 'physics' | 'chemistry' | 'biology' | 'astronomy' | 'general';
  description: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  navigationPath?: string;
  recommendations?: SimulationRecommendation[];
  suggestions?: string[];
}

// Complete Simulation Knowledge Catalog for 1-click navigation & contextual AI recommendations
const SIMULATION_REGISTRY: SimulationRecommendation[] = [
  // Astrophysics & Space
  {
    id: 'black-hole',
    title: 'محاكاة الثقب الأسود الدوّار (Kerr)',
    category: 'الفيزياء الفلكية والنسبية',
    route: '/black-hole',
    icon: 'astronomy',
    description: 'استكشف أفق الحدث، قرص التنامي فائق السخونة، النفاثات النسبية وانحناء الزمكان ثلاثي الأبعاد.'
  },
  {
    id: 'special-relativity',
    title: 'محاكاة النسبية الخاصة لآينشتاين',
    category: 'الفيزياء الحديثة',
    route: '/special-relativity',
    icon: 'physics',
    description: 'شاهد تمدد الزمن عبر الساعة الضوئية، انكماش لورنتز للأطوال، ونفق الالتواء الفضائي عند الاقتراب من سرعة الضوء.'
  },
  {
    id: 'orbital-mechanics',
    title: 'محاكاة الميكانيكا المدارية وقوانين كبلر',
    category: 'علوم الفضاء والميكانيكا السماوية',
    route: '/orbital-mechanics',
    icon: 'astronomy',
    description: 'تتبع مدارات الأقمار الصناعية حول الأرض، سرعة الإفلات، ومناورات هومان الانتقالية ثلاثية الأبعاد.'
  },
  {
    id: 'solar-system',
    title: 'المجموعة الشمسية والمدارات الكوكبية',
    category: 'علم الفلك',
    route: '/solar-system',
    icon: 'astronomy',
    description: 'جولة ثلاثية الأبعاد تفاعلية بين الشمس والكواكب الثمانية مع حلقات زحل ومسارات الكواكب الحقيقية.'
  },
  {
    id: 'advanced-astronomy',
    title: 'الفلك المتقدم: الكسوف والخسوف وأطوار القمر',
    category: 'علم الفلك الرصدي',
    route: '/advanced-astronomy',
    icon: 'astronomy',
    description: 'محاكاة هندسية ثلاثية الأبعاد لكسوف الشمس، خسوف القمر، ومخاريط الظل التام وشبه الظل.'
  },

  // Classical Mechanics, Waves & Aerodynamics
  {
    id: 'projectile-motion',
    title: 'محاكاة حركة المقذوفات والباليستيات',
    category: 'الميكانيكا الكلاسيكية',
    route: '/projectile-motion',
    icon: 'physics',
    description: 'مدفع ثلاثي الأبعاد يطلق قذائف مع حساب مقاومة الهواء، متجهات الرياح، وزوايا الإطلاق المثالية.'
  },
  {
    id: 'wind-tunnel',
    title: 'نفق الرياح والديناميكا الهوائية (Aerodynamics)',
    category: 'هندسة الطيران والموائع',
    route: '/aerodynamics-wind-tunnel',
    icon: 'physics',
    description: 'أجنحة NACA الرياضية، خطوط انسياب برنولي، ظاهرة الانهيار (Stall)، ومخروط ماخ الصوتي.'
  },
  {
    id: 'fluid-mechanics',
    title: 'ميكانيكا الموائع والهيدروليكا',
    category: 'الفيزياء الميكانيكية',
    route: '/fluid-mechanics',
    icon: 'physics',
    description: 'قاعدة أرخميدس للطفو، المكبس الهيدروليكي لباسكال، وأنبوب فنتوري لقياس تدفق السوائل.'
  },
  {
    id: 'waves-sound',
    title: 'الموجات والصوتيات وغرفة الصدى',
    category: 'فيزياء الأمواج',
    route: '/waves-sound',
    icon: 'physics',
    description: 'أمواج طولية ومستعرضة، تأثير دوبلر الصوتي الأسرع من الصوت، وتداخل الأمواج ثلاثي الأبعاد.'
  },
  {
    id: 'interference-diffraction',
    title: 'التداخل والحيود البصري',
    category: 'البصريات الموجية',
    route: '/interference-diffraction',
    icon: 'physics',
    description: 'تجربة شقي يونغ، حيود فرانهوفر، وحلقات نيوتن التداخلية مع ليزر أحادي اللون.'
  },
  {
    id: 'rocket-science',
    title: 'علم الصواريخ والدفع الفضائي',
    category: 'هندسة الفضاء',
    route: '/rocket-science',
    icon: 'astronomy',
    description: 'صاروخ متعدد المراحل، معادلة تسيولكوفسكي، ألسنة اللهب النفاثة مع عقد ماخ، والهبوط الموجه.'
  },
  {
    id: 'circular-motion',
    title: 'الحركة الدائرية والقوة المركزية',
    category: 'الميكانيكا الكلاسيكية',
    route: '/circular-motion',
    icon: 'physics',
    description: 'البندول المخروطي، متجهات التسارع المركزي، وحساب قوى الشد والسرعة الزاوية.'
  },

  // Electricity, Magnetism & Circuits
  {
    id: 'circuit-builder',
    title: 'مختبر الدوائر الكهربائية التفاعلي',
    category: 'الكهرومغناطيسية',
    route: '/circuit-builder',
    icon: 'physics',
    description: 'بناء وتوصيل الدوائر الكهربائية (توالي وتوازي)، قانون كيرشوف، وتحليل فرق الجهد والتيار.'
  },
  {
    id: 'superconductivity',
    title: 'محاكاة الموصلية الفائقة وتأثير مايسنر',
    category: 'فيزياء الحالة الصلبة',
    route: '/superconductivity',
    icon: 'physics',
    description: 'الرفع المغناطيسي الكمومي، طرد خطوط الفيض المغناطيسي، وانعدام المقاومة الكهربائية عند درجات حرارة منخفضة.'
  },
  {
    id: 'static-electricity',
    title: 'الكهرباء الساكنة ومولد فان دي غراف',
    category: 'الكهرومغناطيسية',
    route: '/static-electricity',
    icon: 'physics',
    description: 'توزيع الشحنات الكهربائية، قانون كولوم للتنافر والتجاذب، وحقل الجهد الكهربائي.'
  },

  // Quantum, Nuclear & Advanced Physics
  {
    id: 'quantum-mechanics',
    title: 'ميكانيكا الكم والنفق الكمومي',
    category: 'الفيزياء الكمية',
    route: '/quantum-mechanics',
    icon: 'physics',
    description: 'دالة الموجة، مبدأ عدم اليقين لهايزنبرغ، وظاهرة النفاذ الكمومي عبر الحواجز المستحيلة كلاسيكياً.'
  },
  {
    id: 'photoelectric-effect',
    title: 'الظاهرة الكهروضوئية لألبرت آينشتاين',
    category: 'فيزياء الكم',
    route: '/photoelectric-effect',
    icon: 'physics',
    description: 'انبعاث الإلكترونات من سطح المعدن بواسطة الفوتونات، تردد العتبة، ودالة الشغل.'
  },
  {
    id: 'lhc-simulation',
    title: 'مصادم الهادرونات الكبير (LHC) وبوزون هيغز',
    category: 'فيزياء الجسيمات الأولية',
    route: '/lhc-simulation',
    icon: 'physics',
    description: 'تسريع البروتونات في أنبوب مغناطيسي فائق، تصادم الطاقة العالية، واكتشاف جسيم هيغز.'
  },
  {
    id: 'build-atom',
    title: 'بناء الذرة ونموذج بور ثلاثي الأبعاد',
    category: 'الفيزياء الذرية',
    route: '/build-atom',
    icon: 'physics',
    description: 'تجميع البروتونات والنيوترونات والإلكترونات في مستويات الطاقة الكمومية (K, L, M, N).'
  },
  {
    id: 'advanced-nuclear',
    title: 'المفاعل النووي وإشعاع شيرينكوف',
    category: 'الفيزياء النووية',
    route: '/advanced-nuclear',
    icon: 'physics',
    description: 'الانشطار المتسلسل، قضبان التحكم، ووميض شيرينكوف الأزرق داخل حوض المفاعل.'
  },

  // Chemistry
  {
    id: 'acids-bases',
    title: 'مختبر الأحماض والقواعد والمعايرة',
    category: 'الكيمياء العامة',
    route: '/acids-bases',
    icon: 'chemistry',
    description: 'مقياس الرقم الهيدروجيني pH، تراكيز أيونات الهيدرونيوم والهيدروكسيد، ومنحنيات المعايرة.'
  },
  {
    id: 'chemical-equilibrium',
    title: 'الاتزان الكيميائي ومبدأ لوشاتيليه',
    category: 'الكيمياء الفيزيائية',
    route: '/chemical-equilibrium',
    icon: 'chemistry',
    description: 'غرفة تصادم الجزيئات (هابر-بوش)، تأثير الضغط والحرارة والتركيز على موضع الاتزان.'
  },
  {
    id: 'organic-chemistry',
    title: 'الكيمياء العضوية وتشكيل الجزيئات',
    category: 'الكيمياء العضوية',
    route: '/organic-chemistry',
    icon: 'chemistry',
    description: 'نماذج الكرات والعصي ثلاثية الأبعاد للألكانات والألكينات والمركبات الحلقية والعطرية.'
  },

  // Biology & Genetics
  {
    id: 'living-cell',
    title: 'الخلية الحية وعضياتها ثلاثية الأبعاد',
    category: 'علم الأحياء الدقيقة',
    route: '/living-cell',
    icon: 'biology',
    description: 'استكشف الميتوكوندريا، النواة، الشبكة الإندوبلازمية، وجهاز جولجي بتكبير مجهري دقيق.'
  },
  {
    id: 'cell-division',
    title: 'انقسام الخلية (الخيطي والاختزالي)',
    category: 'علم الخلية',
    route: '/cell-division',
    icon: 'biology',
    description: 'أطوار الانقسام المتساوي: التمهيدي، الاستوائي، الانفصالي، والنهائي مع خيوط المغزل.'
  },
  {
    id: 'human-body',
    title: 'تشريح جسم الإنسان التفاعلي',
    category: 'التشريح والفسيولوجيا',
    route: '/human-body',
    icon: 'biology',
    description: 'أجهزة الدوران، الهيكل العظمي، العضلات، والجهاز العصبي بدقة ثلاثية الأبعاد.'
  }
];

// Offline-First Intelligent Scientific Knowledge Engine
function generateIntelligentResponse(query: string, userName: string): { 
  answer: string; 
  recommendations: SimulationRecommendation[];
  suggestions: string[];
  navigationPath?: string;
} {
  const q = query.toLowerCase().trim();
  const matchedRecs: SimulationRecommendation[] = [];

  // Match simulations based on keywords
  for (const sim of SIMULATION_REGISTRY) {
    if (
      q.includes(sim.title.toLowerCase()) || 
      q.includes(sim.category.toLowerCase()) ||
      (sim.id === 'black-hole' && (q.includes('ثقب') || q.includes('black hole') || q.includes('تنامي') || q.includes('كير'))) ||
      (sim.id === 'special-relativity' && (q.includes('نسبية') || q.includes('آينشتاين') || q.includes('لورنتز') || q.includes('ضوء') || q.includes('ساعة ضوئية'))) ||
      (sim.id === 'orbital-mechanics' && (q.includes('مدار') || q.includes('كبلر') || q.includes('قمر صناعي') || q.includes('إفلات'))) ||
      (sim.id === 'solar-system' && (q.includes('شمس') || q.includes('كواكب') || q.includes('زحل') || q.includes('مجموعة شمسية'))) ||
      (sim.id === 'projectile-motion' && (q.includes('مقذوف') || q.includes('مدفع') || q.includes('باليستي') || q.includes('مسار'))) ||
      (sim.id === 'wind-tunnel' && (q.includes('رياح') || q.includes('طيران') || q.includes('جناح') || q.includes('برنولي') || q.includes('نفق'))) ||
      (sim.id === 'fluid-mechanics' && (q.includes('موائع') || q.includes('أرخميدس') || q.includes('باسكال') || q.includes('طفو') || q.includes('هيدروليك'))) ||
      (sim.id === 'waves-sound' && (q.includes('صوت') || q.includes('أمواج') || q.includes('دوبلر') || q.includes('موجات'))) ||
      (sim.id === 'rocket-science' && (q.includes('صاروخ') || q.includes('دفع') || q.includes('تسيولكوفسكي') || q.includes('فضاء'))) ||
      (sim.id === 'quantum-mechanics' && (q.includes('كم') || q.includes('هايزنبرغ') || q.includes('نفق كمومي') || q.includes('شرودنجر'))) ||
      (sim.id === 'photoelectric-effect' && (q.includes('كهروضوئية') || q.includes('فوتون') || q.includes('عتبة'))) ||
      (sim.id === 'circuit-builder' && (q.includes('دارة') || q.includes('دائرة') || q.includes('كهرباء') || q.includes('أوم') || q.includes('كيرشوف'))) ||
      (sim.id === 'acids-bases' && (q.includes('حمض') || q.includes('قاعدة') || q.includes('معايرة') || q.includes('ph') || q.includes('هيدروجيني'))) ||
      (sim.id === 'living-cell' && (q.includes('خلية') || q.includes('ميتوكوندريا') || q.includes('عضيات'))) ||
      (sim.id === 'cell-division' && (q.includes('انقسام') || q.includes('ميتوزي') || q.includes('كروموسوم'))) ||
      (sim.id === 'human-body' && (q.includes('تشريح') || q.includes('جسم الإنسان') || q.includes('قلب') || q.includes('عظام')))
    ) {
      if (!matchedRecs.some(r => r.id === sim.id)) {
        matchedRecs.push(sim);
      }
    }
  }

  // Question Category 1: Special Relativity
  if (q.includes('نسبية') || q.includes('اينشتاين') || q.includes('آينشتاين') || q.includes('تمدد الزمن') || q.includes('سرعة الضوء')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'special-relativity');
    return {
      answer: `### 🌌 نظرية النسبية الخاصة (Special Relativity)\n\nأهلاً بك يا ${userName}! النسبية الخاصة التي صاغها ألبرت آينشتاين عام 1905 غيرت فهمنا الجذري للمكان والزمان.\n\n**أهم المبادئ الفيزيائية:**\n• **ثبات سرعة الضوء:** سرعة الضوء في الفراغ ثابتة ($c \\approx 300,000\\text{ km/s}$) لجميع المراقبين بغض النظر عن حركتهم.\n• **تمدد الزمن (Time Dilation):** الساعات المتحركة تسير أبطأ بالنسبة لمراقب ساكن وفق معامل لورنتز $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$.\n• **انكماش الطول (Length Contraction):** تنكمش الأجسام في اتجاه حركتها كلما اقتربت من سرعة الضوء.\n• **تكافؤ الكتلة والطاقة:** $E = mc^2$.\n\n💡 **في مختبرنا التفاعلي ثلاثي الأبعاد:** يمكنك تجربة الساعة الضوئية الحقيقية ومشاهدة المركبة الفضائية تنكمش مع نفق لورنتز فائق السرعة!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['كيف تعمل الساعة الضوئية؟', 'اشرح لي انكماش لورنتز', 'افتح محاكاة النسبية الخاصة'],
      navigationPath: '/special-relativity'
    };
  }

  // Question Category 2: Black Hole
  if (q.includes('ثقب') || q.includes('black hole') || q.includes('أفق الحدث') || q.includes('انحناء الزمكان')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'black-hole');
    return {
      answer: `### 🕳️ الثقوب السوداء وانحناء الزمكان المذهل\n\nالثقب الأسود هو منطقة في الزمكان تتميز بقوة جاذبية هائلة لدرجة أنه لا يمكن لأي جسيم أو إشعاع كهرومغناطيسي، حتى الضوء، الهروب منها.\n\n**المعالم الفيزيائية الرئيسية:**\n• **نصف قطر شفارتزشيلد (أفق الحدث):** $r_s = \\frac{2GM}{c^2}$، وهو الحد الذي لا عودة منه.\n• **قرص التنامي (Accretion Disk):** غازات وغبار يدوران بسرعات نسبية تقترب من سرعة الضوء، وتسخن لملايين الدرجات لتشع أشعة سينية ساطعة.\n• **عدسة الجاذبية (Gravitational Lensing):** انحناء مسار الضوء القادم من النجوم الخلفية حول الثقب الأسود.\n• **النفاثات النسبية (Relativistic Jets):** بلازما فائقة السرعة تُقذف من القطبين المغناطيسيين.\n\n🚀 يمكنك التحكم مباشرة في كتلة الثقب الأسود وسرعة دورانه (Kerr Spin) في مختبرنا ثلاثي الأبعاد!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['ما هو أفق الحدث؟', 'كيف يؤثر الدوران على الثقب الأسود؟', 'افتح محاكاة الثقب الأسود'],
      navigationPath: '/black-hole'
    };
  }

  // Question Category 3: Aerodynamics / Wind Tunnel
  if (q.includes('طيران') || q.includes('رياح') || q.includes('برنولي') || q.includes('جناح') || q.includes('ماخ') || q.includes('aerodynamic')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'wind-tunnel');
    return {
      answer: `### ✈️ الديناميكا الهوائية ونفق الرياح (Aerodynamics)\n\nكيف تطير الطائرات الضخمة في الهواء؟ السر يكمن في هندسة أجنحة NACA ومبادئ تدفق الموائع:\n\n**القوانين المتحكمة:**\n• **مبدأ برنولي:** كلما زادت سرعة المائع قل ضغطه. شكل الجناح المحدب من الأعلى يجعل الهواء يتحرك أسرع فوقه، مما يولد فرق ضغط يرفع الطائرة (قوة الرفع $F_L$).\n• **زاوية الهجوم (Angle of Attack):** زيادة الزاوية تزيد الرفع حتى حد حرج يحدث عنده **الانهيار الهوائي (Stall)**.\n• **مخروط ماخ وجدار الصوت:** عند تجاوز سرعة الصوت ($Mach > 1$) تتراكم موجات الضغط لتشكل صدمة هوائية قوية.\n\n🔬 في نفق الرياح الافتراضي ثلاثي الأبعاد لدينا، يمكنك تجربة أجنحة حقيقية ورؤية خطوط الانسياب وظاهرة الانهيار لحظياً!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['ما هي أجنحة NACA؟', 'كيف يحدث الانهيار الهوائي Stall؟', 'افتح نفق الرياح ثلاثي الأبعاد'],
      navigationPath: '/aerodynamics-wind-tunnel'
    };
  }

  // Question Category 4: Projectile Motion / Ballistics
  if (q.includes('مقذوف') || q.includes('مدفع') || q.includes('باليستي') || q.includes('سقوط حر') || q.includes('مقاومة الهواء')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'projectile-motion');
    return {
      answer: `### 🎯 حركة المقذوفات والفيزياء الباليستية\n\nحركة المقذوف هي حركة ثنائية البعد تجمع بين حركة أفقية منتظمة السرعة ($v_x = v_0 \\cos\\theta$) وحركة رأسية تحت تأثير الجاذبية الأرضية ($v_y = v_0 \\sin\\theta - gt$).\n\n**المعادلات الباليستية الأساسية:**\n• **المدى الأفقي الأقصى:** $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$ (بدون مقاومة الهواء، أقصى مدى يكون عند زاوية $45^\\circ$).\n• **أقصى ارتفاع:** $H = \\frac{(v_0 \\sin\\theta)^2}{2g}$.\n• **زمن التحليق:** $T = \\frac{2v_0 \\sin\\theta}{g}$.\n• **مقاومة الهواء (Drag Force):** $F_d = \\frac{1}{2} \\rho v^2 C_d A$ وتسبب انحراف المسار وتناقص المدى الحقيقي.\n\n💥 في محاكاة المقذوفات ثلاثية الأبعاد، يمكنك إطلاق قذائف من مدفع واقعي مع التحكم بسرعة الرياح والمقاومة!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['لماذا زاوية 45 درجة تعطي أقصى مدى؟', 'ما تأثير مقاومة الهواء على القذيفة؟', 'افتح محاكاة المقذوفات 3D'],
      navigationPath: '/projectile-motion'
    };
  }

  // Question Category 5: Living Cell & Biology
  if (q.includes('خلية') || q.includes('ميتوكوندريا') || q.includes('dna') || q.includes('جينات') || q.includes('انقسام') || q.includes('أحياء')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'living-cell') || SIMULATION_REGISTRY.find(s => s.id === 'cell-division');
    return {
      answer: `### 🧬 الخلية الحية والعالم المجهري المذهل\n\nالخلية هي الوحدة الأساسية والوظيفية لجميع الكائنات الحية:\n\n**أهم العضيات الخلوية ووظائفها:**\n• **النواة (Nucleus):** مركز التحكم الذي يحفظ المادة الوراثية DNA.\n• **الميتوكوندريا (Mitochondria):** محطة توليد الطاقة للخلية حيث يتم إنتاج أدينوسين ثلاثي الفوسفات (ATP).\n• **الشبكة الإندوبلازمية وجهاز جولجي:** تصنيع وتعديل ونقل البروتينات والدهون.\n• **الانقسام الخلوي (Mitosis):** العملية التي تضمن تجدد الخلايا ونمو الأنسجة بدقة متناهية.\n\n🔬 تفضل بزيارة مختبر الخلية الحية ثلاثي الأبعاد لمشاهدة العضيات تسبح في السيتوبلازم والتفاعل معها بحرية!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['كيف تعمل الميتوكوندريا في إنتاج ATP؟', 'ما الفرق بين الانقسام المتساوي والمنصف؟', 'افتح مختبر الخلية الحية 3D'],
      navigationPath: '/living-cell'
    };
  }

  // Question Category 6: Quantum & Atoms
  if (q.includes('كم') || q.includes('ذرة') || q.includes('فوتون') || q.includes('بور') || q.includes('الكترون') || q.includes('إلكترون') || q.includes('كوانتم')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'build-atom') || SIMULATION_REGISTRY.find(s => s.id === 'quantum-mechanics');
    return {
      answer: `### ⚛️ فيزياء الكم والتركيب الذري\n\nعلى المستوى الذري ودون الذري، تفقد قوانين الفيزياء الكلاسيكية سيطرتها لتفتح المجال لميكانيكا الكم:\n\n**أبرز القواعد والمفاهيم الكمومية:**\n• **مستويات الطاقة المكممة:** طبقاً لنموذج بور، الإلكترونات تدور في مستويات طاقة محددة دون أن تشع طاقة ($E_n = -\\frac{13.6\\text{ eV}}{n^2}$ للّهيدروجين).\n• **قفزات الكم:** يمتص الإلكترون فوتوناً ليصعد لمستوى أعلى، أو يشع فوتوناً بتردد $hf = \\Delta E$ عند هبوطه.\n• **ازدواجية الموجة والجسيم:** الجسيمات المادية تمتلك خصائص موجية ($\lambda = \\frac{h}{p}$ معادلة دي برولي).\n• **النفق الكمومي (Quantum Tunneling):** احتمال عبور الجسيم لحاجز طاقة أعلى من طاقته الحركية!\n\n💡 يمكنك بناء ذرتك الخاصة أو تجربة الظاهرة الكهروضوئية في مختبراتنا ثلاثية الأبعاد!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['كيف يعمل نموذج بور الذري؟', 'ما هي الظاهرة الكهروضوئية؟', 'افتح محاكاة بناء الذرة 3D'],
      navigationPath: '/build-atom'
    };
  }

  // Question Category 7: Platform Tour & Best 3D Simulations
  if (q.includes('تجارب') || q.includes('أحدث') || q.includes('3d') || q.includes('محاكاة') || q.includes('مختبر') || q.includes('افضل')) {
    const topSims = SIMULATION_REGISTRY.slice(0, 4);
    return {
      answer: `### 🚀 مرحباً بك في المختبر الافتراضي الذكي ثلاثي الأبعاد!\n\nيسعدني جداً أن أرشدك! تم ترقية وتطوير جميع تجارب منصة **«ذروة العلم»** إلى المعيار الذهبي ثلاثي الأبعاد (WebGL / Three.js) بدقة علمية وفيزيائية فائقة!\n\n**أبرز التجارب ثلاثية الأبعاد المتاحة لك الآن:**\n1. **الثقب الأسود والنسبية العامة:** قرص التنامي والنفاثات النسبية وعدسة الجاذبية.\n2. **النسبية الخاصة:** تمدد الزمن، انكماش لورنتز، والساعة الضوئية.\n3. **نفق الرياح والأيروديناميكا:** أجنحة الطائرات وتدفق الموائع ومخروط ماخ.\n4. **حركة المقذوفات والباليستيات:** مدفع ثلاثي الأبعاد مع مقاومة الهواء ومتجهات الرياح.\n5. **الميكانيكا المدارية:** مدارات كبلر والأقمار الصناعية وسرعة الإفلات.\n6. **الخلية الحية وبناء الذرة:** استكشاف تفاعلي مجهري عميق.\n\nانقر على أي تجربة أدناه للانتقال إليها مباشرة، أو اسألني عن أي قانون علمي!`,
      recommendations: topSims,
      suggestions: ['أرني تجارب الفيزياء الفلكية', 'أرني تجارب الميكانيكا والأمواج', 'أرني تجارب الكيمياء والأحياء', 'افتح فهرس المحاكاة العلمية بالكامل'],
      navigationPath: '/scientific-simulations'
    };
  }

  // Question Category 8: Platform Sections & Tools
  if (q.includes('اقسام') || q.includes('أقسام') || q.includes('أين') || q.includes('مكتبة') || q.includes('امتحان') || q.includes('الغاز') || q.includes('اشارة') || q.includes('أدوات')) {
    return {
      answer: `### 🧭 خريطة منصة «ذروة العلم» والأدوات المتقدمة\n\nتتضمن المنصة مجموعة متكاملة من الأدوات التعليمية الرائدة:\n\n• 🔬 **المختبر الافتراضي والمحاكاة العلمية:** أكثر من 50 محاكاة ثلاثية الأبعاد تفاعلية في الفيزياء، الكيمياء، الأحياء، والفلك.\n• 📚 **مكتبة المصادر والكتب:** مراجع علمية، أوراق بحثية، وروابط تعليمية موثوقة.\n• 📷 **ماسح الامتحانات الذكي:** تصحيح وتحليل فوري لورقة الامتحان عبر الرؤية الحاسوبية.\n• 🤟 **مترجم لغة الإشارة:** ترجمة تفاعلية للغة الإشارة لدعم أصحاب الهمم والدمج التعليمي.\n• 🧩 **الألغاز العلمية والمتصدرين:** مسابقات تفاعلية لحل الألغاز والتنافس على قائمة الشرف.\n• 🩺 **المختبر السريري والتشريح:** محاكاة طبية بيولوجية متقدمة.\n\nأخبرني بما تريد زيارته وسأوجهك إليه فوراً!`,
      recommendations: SIMULATION_REGISTRY.slice(0, 3),
      suggestions: ['افتح مكتبة المصادر', 'افتح ماسح الامتحانات', 'افتح الألغاز التعليمية', 'افتح المحاكاة العلمية'],
      navigationPath: '/scientific-simulations'
    };
  }

  // General Scientific & Academic Fallback
  return {
    answer: `### 🎓 مرحباً بك يا ${userName} في مرشدك الذكي!\n\nأنا هنا لمساعدتك في كل ما يتعلق بالعلوم، الفيزياء، الكيمياء، الأحياء، الفضاء، والتنقل في المنصة التعليمية.\n\nبناءً على استفسارك، يسعدني إرشادك وتوضيح المفاهيم أو توجيهك للمختبر ثلاثي الأبعاد المناسب لملاحظة الظاهرة بنفسك وتغيير معاملاتها الفيزيائية.\n\nما الذي تود استكشافه أو حسابه اليوم بالتحديد؟`,
    recommendations: matchedRecs.length > 0 ? matchedRecs.slice(0, 3) : SIMULATION_REGISTRY.slice(0, 3),
    suggestions: [
      'ما هي أحدث التجارب ثلاثية الأبعاد؟',
      'اشرح لي نظرية النسبية لآينشتاين',
      'كيف تعمل الميكانيكا المدارية وقوانين كبلر؟',
      'أين أجد تجارب الكيمياء والأحياء؟'
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
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | '3d' | 'physics' | 'chemistry' | 'biology'>('all');
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: Message = {
        id: 'welcome-msg',
        text: `### مرحباً بك ${userName ? `يا ${userName}` : ''}! 👋\n\nأنا **مرشدك الذكي الفائق 2.0** في منصة «ذروة العلم».\n\n**كيف يمكنني خدمتك اليوم؟**\n• 🔬 **استكشاف المختبر ثلاثي الأبعاد:** إرشادك وتوجيهك لأحدث التجارب التفاعلية (الثقوب السوداء، النسبية، نفق الرياح، المدارات، الذرة، الخلية).\n• 💡 **شرح عميق للمفاهيم والقوانين:** فيزياء، كيمياء، أحياء، وفضاء بأسلوب مبسط مدعوم بالمعادلات.\n• 🧭 **دليل المنصة الشامل:** التوجيه السريع لأي قسم، أداة، أو مكتبة مصادر بنقرة واحدة.\n\nاختر من المقترحات السريعة بالأسفل أو اكتب سؤالك بحرية! 🚀`,
        isUser: false,
        timestamp: new Date(),
        recommendations: SIMULATION_REGISTRY.slice(0, 3),
        suggestions: [
          'أرني أحدث تجارب المختبر ثلاثي الأبعاد',
          'اشرح لي النسبية الخاصة وتمدد الزمن',
          'كيف يعمل نفق الرياح الأيروديناميكي؟',
          'أين أجد تجارب الخلية وبناء الذرة؟'
        ]
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, userName, messages.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Text-To-Speech with browser synthesis
  const handleSpeakText = (text: string, messageId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('ميزة القراءة الصوتية غير مدعومة في متصفحك الحالي');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean markdown and formatting tags for voice synthesis
    const cleanText = text
      .replace(/###|##|#|\*\*|\*|`|\$|•/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Stop voice on close or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send user message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // 1. Try remote edge function
      let botResponseText = '';
      let targetPath: string | undefined = undefined;

      try {
        const { data, error } = await supabase.functions.invoke('platform-guide-assistant', {
          body: {
            question: textToSend,
            userName: userName || 'صديقي العزيز',
            allMessages: messages.slice(-4).map(m => ({
              role: m.isUser ? 'user' : 'assistant',
              content: m.text
            }))
          }
        });

        if (!error && data?.answer) {
          botResponseText = data.answer;
          targetPath = data.navigationPath;
        }
      } catch (e) {
        // Fallback silently to client knowledge engine
      }

      // 2. Generate local intelligent response & simulation action cards
      const offlineResult = generateIntelligentResponse(textToSend, userName || 'صديقي');

      const finalAnswer = botResponseText || offlineResult.answer;
      const finalNavPath = targetPath || offlineResult.navigationPath;
      const finalRecs = offlineResult.recommendations;
      const finalSuggestions = offlineResult.suggestions;

      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: finalAnswer,
        isUser: false,
        timestamp: new Date(),
        navigationPath: finalNavPath,
        recommendations: finalRecs,
        suggestions: finalSuggestions
      };

      setMessages(prev => [...prev, botMessage]);

      // If auto-voice is active, speak the answer
      if (isVoiceActive) {
        handleSpeakText(finalAnswer, botMessageId);
      }

      // If explicit single direct route requested and matched navigationPath
      if (finalNavPath && (textToSend.includes('افتح') || textToSend.includes('انتقل') || textToSend.includes('اذهب'))) {
        toast.success('جاري توجيهك إلى وجهتك المطلوبة...');
        setTimeout(() => {
          navigate(finalNavPath);
        }, 1200);
      }
    } catch {
      // Emergency graceful response
      const fallbackResult = generateIntelligentResponse(textToSend, userName || 'صديقي');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackResult.answer,
        isUser: false,
        timestamp: new Date(),
        recommendations: fallbackResult.recommendations,
        suggestions: fallbackResult.suggestions
      }]);
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

  // Render markdown text safely
  const renderMessageText = (text: string) => {
    const html = text
      .replace(/### (.*?)(?=\n|$)/g, '<h3 style="font-size:1.05rem;font-weight:700;color:#2dd4bf;margin:8px 0 4px;display:flex;align-items:center;gap:6px;">$1</h3>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 style="font-size:1.15rem;font-weight:800;color:#14b8a6;margin:10px 0 6px;">$1</h2>')
      .replace(/# (.*?)(?=\n|$)/g, '<h1 style="font-size:1.25rem;font-weight:800;color:#0d9488;margin:12px 0 6px;">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#5eead4;font-weight:700;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:#99f6e4;">$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(20,184,166,0.15);color:#5eead4;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>')
      .replace(/\$([^\$]+)\$/g, '<span style="background:rgba(99,102,241,0.18);color:#a5b4fc;padding:2px 6px;border-radius:5px;font-family:monospace;font-weight:600;">$1</span>')
      .replace(/• (.*?)(?=\n|$)/g, '<div style="margin:4px 0;padding-right:12px;line-height:1.6;position:relative;"><span style="position:absolute;right:0;color:#2dd4bf;">•</span>$1</div>')
      .replace(/\n/g, '<br/>');

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['br', 'h1', 'h2', 'h3', 'strong', 'em', 'code', 'span', 'div', 'p'],
      ALLOWED_ATTR: ['style']
    });
  };

  // Filtered simulations for quick navigation drawer tab
  const filteredSims = useMemo(() => {
    if (activeCategoryFilter === 'all') return SIMULATION_REGISTRY;
    if (activeCategoryFilter === '3d') return SIMULATION_REGISTRY.slice(0, 10);
    return SIMULATION_REGISTRY.filter(s => s.icon === activeCategoryFilter);
  }, [activeCategoryFilter]);

  const clearChatHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setMessages([]);
    toast.info('تمت إعادة ضبط محادثة المرشد الذكي');
  };

  return (
    <>
      {/* Floating Holographic Orb Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
          >
            {/* Ambient greeting pill on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="hidden lg:flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-slate-950/85 border border-teal-500/30 backdrop-blur-xl shadow-xl shadow-teal-950/40 text-xs text-teal-200 cursor-pointer hover:border-teal-400 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>مرشدك الذكي 2.0 • اسألني عن أي تجربة!</span>
            </motion.div>

            {/* Glowing Interactive Core Orb */}
            <div className="relative group">
              {/* Outer rotating pulse aura */}
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-cyan-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-700 animate-tilt" />

              <Button
                onClick={() => setIsOpen(true)}
                className="relative w-15 h-15 rounded-full bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 border-2 border-teal-400/80 shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:shadow-[0_0_35px_rgba(20,184,166,0.8)] text-teal-300 hover:text-white transition-all duration-300 p-0 overflow-hidden flex items-center justify-center group"
                size="icon"
                aria-label="فتح المرشد الذكي"
              >
                {/* Synaptic particles background */}
                <div className="absolute inset-0 bg-radial-gradient from-teal-500/20 via-transparent to-transparent animate-pulse" />
                
                <Brain className="w-7 h-7 text-teal-300 relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute top-2.5 right-2.5 animate-bounce z-10" />

                {/* Ring animation */}
                <motion.div
                  className="absolute inset-0.5 rounded-full border border-teal-400/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic Cyber-Glass Dialog / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Soft Ambient Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Main Interactive Floating Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`fixed z-50 flex flex-col bg-slate-950/95 border border-teal-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(15,23,42,0.9)] overflow-hidden transition-all duration-300
                ${isExpanded 
                  ? 'inset-3 md:inset-10 rounded-2xl md:rounded-3xl' 
                  : 'bottom-4 right-4 left-4 sm:left-auto sm:w-[460px] h-[640px] max-h-[92vh] rounded-2xl md:rounded-3xl'
                }
              `}
            >
              {/* Header Bar */}
              <div className="h-16 px-4 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-b border-teal-500/25 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 border border-teal-300/40">
                      <Brain className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-teal-300">
                        مرشدك الذكي 2.0
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-teal-500/40 text-teal-300 bg-teal-950/40">
                        AI Ultra
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>محمود جوارنة</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">متصل ومستعد للإرشاد</span>
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1 text-slate-400">
                  {/* Speech Toggle */}
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
                    className={`w-8 h-8 rounded-lg ${isVoiceActive ? 'text-teal-400 bg-teal-500/20' : 'hover:text-white'}`}
                  >
                    {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>

                  {/* Reset Chat */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChatHistory}
                    title="إعادة ضبط المحادثة"
                    className="w-8 h-8 rounded-lg hover:text-white hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  {/* Expand / Minimize */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'تصغير' : 'تكبير'}
                    className="w-8 h-8 rounded-lg hover:text-white hover:bg-slate-800 hidden sm:flex"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>

                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Category Filter Bar */}
              <div className="px-3 py-2 bg-slate-900/60 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-1">استكشف:</span>
                {[
                  { id: 'all', label: 'الكل', icon: Compass },
                  { id: '3d', label: 'مختبرات 3D', icon: Zap },
                  { id: 'physics', label: 'فيزياء وفلك', icon: Atom },
                  { id: 'chemistry', label: 'كيمياء', icon: FlaskConical },
                  { id: 'biology', label: 'أحياء وخلايا', icon: Dna },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isCurrent = activeCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all shrink-0 border ${
                        isCurrent 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-sm shadow-teal-500/20' 
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Messages Scroll View */}
              <EnhancedScrollArea className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSpeakingThis = speakingMessageId === message.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] ${message.isUser ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                            message.isUser
                              ? 'bg-teal-600 border-teal-400/50 text-white shadow-md shadow-teal-600/30'
                              : 'bg-indigo-600 border-indigo-400/50 text-white shadow-md shadow-indigo-600/30'
                          }`}>
                            {message.isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>

                          {/* Message Content Bubble */}
                          <div className={`rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed border space-y-2.5 ${
                            message.isUser
                              ? 'bg-gradient-to-br from-teal-900/90 to-teal-850 text-white border-teal-500/40 rounded-br-sm'
                              : 'bg-slate-900/90 text-slate-100 border-slate-700/60 rounded-bl-sm shadow-lg'
                          }`}>
                            {/* Rich sanitized text */}
                            <div
                              className="prose prose-xs sm:prose-sm max-w-none prose-invert leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: renderMessageText(message.text) }}
                            />

                            {/* Voice Button & Time Footer for Assistant */}
                            {!message.isUser && (
                              <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08] text-[11px] text-slate-400">
                                <button
                                  onClick={() => handleSpeakText(message.text, message.id)}
                                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors ${
                                    isSpeakingThis 
                                      ? 'text-teal-300 bg-teal-500/20 font-bold' 
                                      : 'hover:text-white hover:bg-white/[0.06]'
                                  }`}
                                  title="استمع للإجابة بالصوت"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{isSpeakingThis ? 'جاري القراءة...' : 'قراءة صوتية'}</span>
                                  {isSpeakingThis && (
                                    <span className="flex gap-0.5 items-center mr-1">
                                      <span className="w-1 h-2 bg-teal-400 animate-pulse rounded-full" />
                                      <span className="w-1 h-3.5 bg-teal-400 animate-pulse rounded-full" />
                                      <span className="w-1 h-1.5 bg-teal-400 animate-pulse rounded-full" />
                                    </span>
                                  )}
                                </button>

                                <span className="text-[10px] text-slate-500">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}

                            {/* Interactive Simulation Action Cards */}
                            {message.recommendations && message.recommendations.length > 0 && (
                              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                                <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                  <span>تجارب مقترحة للتطبيق الفوري:</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {message.recommendations.map(rec => (
                                    <div
                                      key={rec.id}
                                      className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 hover:border-teal-400/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group/card"
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-white group-hover/card:text-teal-300 transition-colors">
                                            {rec.title}
                                          </span>
                                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-teal-950 text-teal-300 border-teal-500/30">
                                            {rec.category}
                                          </Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                          {rec.description}
                                        </p>
                                      </div>

                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setIsOpen(false);
                                          navigate(rec.route);
                                        }}
                                        className="h-7 text-xs bg-teal-600 hover:bg-teal-500 text-white rounded-lg px-2.5 shrink-0 flex items-center gap-1 self-start sm:self-auto shadow-md shadow-teal-600/20"
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
                                    className="px-2 py-1 rounded-full text-[10px] bg-slate-800/80 hover:bg-teal-600/25 border border-slate-700 hover:border-teal-400/50 text-slate-300 hover:text-teal-200 transition-all text-right"
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
                        <div className="w-7 h-7 rounded-xl bg-indigo-600 border border-indigo-400/50 flex items-center justify-center text-white">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-900 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-slate-700 flex items-center gap-2">
                          <span className="text-xs text-teal-300 font-medium">المرشد الذكي يفكر ويستحضر البيانات العلمية...</span>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-teal-400 rounded-full"
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

              {/* Bottom Quick Recommendations (Filtered from registry) */}
              {messages.length <= 1 && (
                <div className="px-3.5 py-2.5 bg-slate-900/70 border-t border-slate-800 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>تجارب ومواضيع مقترحة:</span>
                    </p>
                    <span className="text-[10px] text-slate-500">انقر لفتح التجربة فوراً</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filteredSims.slice(0, 5).map((sim) => (
                      <button
                        key={sim.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(sim.route);
                        }}
                        className="px-3 py-1.5 bg-slate-800/80 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 rounded-xl text-right shrink-0 transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-teal-300 flex items-center gap-1">
                          <span>{sim.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-400">{sim.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Message Area */}
              <div className="p-3 sm:p-3.5 bg-slate-900/95 border-t border-slate-800/80 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب سؤالك العلمي أو اطلب توجيهك لأي تجربة... 🚀"
                    className="flex-1 text-xs sm:text-sm h-10 bg-slate-950/80 border-slate-700 focus:border-teal-400 focus:ring-teal-400/20 rounded-xl text-white placeholder-slate-400"
                    disabled={isLoading}
                  />

                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-teal-500/30 text-white shrink-0 disabled:opacity-40 transition-all"
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
