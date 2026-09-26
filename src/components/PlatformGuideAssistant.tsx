import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { 
  Send, X, Brain, User, Sparkles, Zap, Volume2, VolumeX, 
  Maximize2, Minimize2, RotateCcw, Compass, Atom, FlaskConical, 
  Dna, Rocket, ArrowRight, ExternalLink, HelpCircle, Check, 
  Bot, RefreshCw, Mic, MicOff, Copy, ThumbsUp, GraduationCap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

export type MentorPersona = 'academic' | 'explorer' | 'quiz' | 'navigator';

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
  persona?: MentorPersona;
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
    description: 'محاكاة هندسية ثلاثية الأبعاد لكسوف الشمس، خسوف القمر، ومخاريط الظل التام وشبه الظل وخاتم الماس.'
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

  // Biology, Genetics & Earth
  {
    id: 'molecular-biology',
    title: 'علم الأحياء الجزيئي وتضاعف DNA والترجمة',
    category: 'البيولوجيا الجزيئية',
    route: '/molecular-biology',
    icon: 'biology',
    description: 'محاكاة تضاعف DNA بالهيليكاز، النسخ الجيني mRNA، وترجمة عديد الببتيد في الريبوسوم.'
  },
  {
    id: 'photosynthesis-respiration',
    title: 'البناء الضوئي والتنفس الخلوي ومحرك ATP',
    category: 'الطاقة الحيوية والأيض',
    route: '/photosynthesis-respiration',
    icon: 'biology',
    description: 'أقراص الثايلاكويد، سيل الفوتونات، وتوربين ATP Synthase الدوار في الميتوكوندريا.'
  },
  {
    id: 'immune-system',
    title: 'الجهاز المناعي والأجسام المضادة 3D',
    category: 'علم المناعة والطب',
    route: '/immune-system',
    icon: 'biology',
    description: 'البلعمة الفطرية، إفراز الأجسام المضادة Y-shaped، وتحييد أشواك الفيروسات.'
  },
  {
    id: 'earth-sciences',
    title: 'علوم الأرض والجيولوجيا التفاعلية 3D',
    category: 'علوم الأرض والجيوفيزياء',
    route: '/earth-sciences',
    icon: 'physics',
    description: 'بؤرة الزلازل وموجات P و S، حجرة الصهارة وثوران البراكين، وانغراز الصفائح التكتونية.'
  },
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
  },
  {
    id: 'sources-library',
    title: 'المكتبة العلمية والمصادر الموثقة',
    category: 'المراجع والأبحاث',
    route: '/damij/sources',
    icon: 'general',
    description: 'أكثر من 70 مرجعاً علمياً ودولياً موثقاً للأبحاث والكتب الأكاديمية والمعايير.'
  }
];

// Offline-First Intelligent Scientific Knowledge Engine with Persona Awareness
function generateIntelligentResponse(
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

  // Match simulations based on keywords
  for (const sim of SIMULATION_REGISTRY) {
    if (
      q.includes(sim.title.toLowerCase()) || 
      q.includes(sim.category.toLowerCase()) ||
      (sim.id === 'black-hole' && (q.includes('ثقب') || q.includes('black hole') || q.includes('تنامي') || q.includes('كير'))) ||
      (sim.id === 'special-relativity' && (q.includes('نسبية') || q.includes('آينشتاين') || q.includes('لورنتز') || q.includes('ضوء') || q.includes('ساعة ضوئية'))) ||
      (sim.id === 'orbital-mechanics' && (q.includes('مدار') || q.includes('كبلر') || q.includes('قمر صناعي') || q.includes('إفلات'))) ||
      (sim.id === 'solar-system' && (q.includes('شمس') || q.includes('كواكب') || q.includes('زحل') || q.includes('مجموعة شمسية'))) ||
      (sim.id === 'advanced-astronomy' && (q.includes('كسوف') || q.includes('خسوف') || q.includes('أطوار القمر') || q.includes('ظل'))) ||
      (sim.id === 'projectile-motion' && (q.includes('مقذوف') || q.includes('مدفع') || q.includes('باليستي') || q.includes('مسار'))) ||
      (sim.id === 'wind-tunnel' && (q.includes('رياح') || q.includes('طيران') || q.includes('جناح') || q.includes('برنولي') || q.includes('نفق'))) ||
      (sim.id === 'fluid-mechanics' && (q.includes('موائع') || q.includes('أرخميدس') || q.includes('باسكال') || q.includes('طفو') || q.includes('هيدروليك'))) ||
      (sim.id === 'waves-sound' && (q.includes('صوت') || q.includes('أمواج') || q.includes('دوبلر') || q.includes('موجات'))) ||
      (sim.id === 'rocket-science' && (q.includes('صاروخ') || q.includes('دفع') || q.includes('تسيولكوفسكي') || q.includes('فضاء'))) ||
      (sim.id === 'quantum-mechanics' && (q.includes('كم') || q.includes('هايزنبرغ') || q.includes('نفق كمومي') || q.includes('شرودنجر'))) ||
      (sim.id === 'photoelectric-effect' && (q.includes('كهروضوئية') || q.includes('فوتون') || q.includes('عتبة'))) ||
      (sim.id === 'circuit-builder' && (q.includes('دارة') || q.includes('دائرة') || q.includes('كهرباء') || q.includes('أوم') || q.includes('كيرشوف'))) ||
      (sim.id === 'molecular-biology' && (q.includes('تضاعف') || q.includes('ترجمة') || q.includes('ريبوسوم') || q.includes('هيليكاز') || q.includes('mrna'))) ||
      (sim.id === 'photosynthesis-respiration' && (q.includes('بناء ضوئي') || q.includes('تنفس خلوي') || q.includes('atp') || q.includes('ثايلاكويد') || q.includes('ميتوكوندريا'))) ||
      (sim.id === 'immune-system' && (q.includes('مناعة') || q.includes('أجسام مضادة') || q.includes('فيروس') || q.includes('بلعمة') || q.includes('لقاح'))) ||
      (sim.id === 'earth-sciences' && (q.includes('زلزال') || q.includes('بركان') || q.includes('صفائح') || q.includes('صخور') || q.includes('ريختر'))) ||
      (sim.id === 'sources-library' && (q.includes('مصادر') || q.includes('مراجع') || q.includes('أبحاث') || q.includes('مكتبة')))
    ) {
      if (!matchedRecs.some(r => r.id === sim.id)) {
        matchedRecs.push(sim);
      }
    }
  }

  // Persona 1: Quiz Master Mode
  if (persona === 'quiz') {
    return {
      answer: `### 🎯 تحدي المرشد الذكي العلمي!\n\nأهلاً بك يا ${userName} في وضع **مدرب التحديات والمسابقات**! إليك هذا السؤال الذكي لاختبار عمق تفكيرك:\n\n**السؤال:** عند إطلاق قذيفة في الفراغ بدون مقاومة هواء، ما هي زاوية الإطلاق التي تحقق أقصى مدى أفقي ممكن؟ ولماذا يتناقص هذا المدى في الواقع؟\n\n1. زاوية 30° بسبب تقليل زمن التحليق.\n2. زاوية 45° نظراً لتساوي مركبتي السرعة الأفقية والرأسية وتحقيق القيمة العظمى لدالة $\\sin(2\\theta) = 1$.\n3. زاوية 60° لزيادة أقصى ارتفاع ممكن.\n\n💡 *اكتب رقم الإجابة الصحيحة أو افتح محاكاة المقذوفات لتختبرها عملياً بالمدفع ثلاثي الأبعاد!*`,
      recommendations: matchedRecs.length > 0 ? matchedRecs : [SIMULATION_REGISTRY[5]],
      suggestions: ['الإجابة هي رقم 2 (زاوية 45 درجة)', 'اطرح علي تحدياً في فيزياء الكم', 'اطرح علي تحدياً في علم الأحياء الجزيئي'],
      navigationPath: '/projectile-motion'
    };
  }

  // Special Relativity
  if (q.includes('نسبية') || q.includes('اينشتاين') || q.includes('آينشتاين') || q.includes('تمدد الزمن') || q.includes('سرعة الضوء')) {
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

  // Black Hole
  if (q.includes('ثقب') || q.includes('black hole') || q.includes('أفق الحدث') || q.includes('انحناء الزمكان')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'black-hole');
    return {
      answer: `### 🕳️ الثقوب السوداء الدوّارة (Kerr Black Holes)\n\nالثقب الأسود هو تركيز هائل للكتلة ينتج عنه انحناء لا نهائي تقريباً في نسيج الزمكان وفق معادلات النسبية العامة لآينشتاين.\n\n**المعالم الفيزيائية ثلاثية الأبعاد:**\n• **نصف قطر شفارتزشيلد (Schwarzschild Radius):** $r_s = \\frac{2GM}{c^2}$، وهو أفق الحدث الذي تنعدم عنده سرعة الإفلات حتى للفوتونات.\n• **منطقة الإرغوسفير (Ergosphere):** في الثقوب الدوارة، يُجبر الزمكان على الدوران مع الثقب (ظاهرة سحب الإطار Lense-Thirring).\n• **قرص التنامي فائق الحرارة (Accretion Disk):** تصادم وضغط الغازات الدوارة يولد درجات حرارة تصل ملايين الكلفن لتبث أشعة سينية متوهجة.\n• **عدسة الجاذبية (Gravitational Lensing):** انحناء مسار الضوء الآتي من النجوم الخلفية ليشكل حلقة آينشتاين الضوئية.\n\n🚀 يمكنك التحكم مباشرة في كتلة الثقب الأسود وسرعة دورانه النسبي في مختبرنا ثلاثي الأبعاد!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['ما هي عدسة الجاذبية؟', 'كيف تنطلق النفاثات النسبية من القطبين؟', 'افتح محاكاة الثقب الأسود ثلاثية الأبعاد'],
      navigationPath: '/black-hole'
    };
  }

  // Sources and Research Library
  if (q.includes('مصادر') || q.includes('مراجع') || q.includes('أبحاث') || q.includes('مكتبة') || q.includes('source') || q.includes('توثيق')) {
    const sim = SIMULATION_REGISTRY.find(s => s.id === 'sources-library');
    return {
      answer: `### 📚 المكتبة العلمية والمصادر الموثقة في منصة «ذروة العلم»\n\nتعتمد منصتنا على أكثر من **70 مرجعاً علمياً ودولياً محكماً** لضمان الدقة الأكاديمية المطلقة في كل أداة وتجربة:\n\n**تصنيفات المصادر المتاحة:**\n• **المعايير الدولية (Standards):** معايير DSM-5 للتشخيص النفسي، إرشادات W3C WCAG للنفاذية، ومعايير كريسبر للتحرير الجيني.\n• **الأبحاث الطبية والبيولوجية:** أبحاث الجمعية الأمريكية لعلم النفس (APA)، دوريات Nature و Science في فيزياء الجسيمات وميكانيكا الكم.\n• **المراجع الفيزيائية والهندسية:** كتب جامعة كامبريدج ومعهد MIT في الديناميكا الهوائية ونظرية النسبية.\n• **أدوات التوثيق:** إمكانية نسخ التوثيق العلمي بنقرة واحدة وتصدير قائمة المراجع كاملة كملف نصي.\n\nانقر بالأسفل لفتح المكتبة والاطلاع على المراجع المصنفة!`,
      recommendations: sim ? [sim] : matchedRecs,
      suggestions: ['افتح المكتبة العلمية الموثقة', 'أرني مصادر منصة دامج للتربية الخاصة', 'كيف تم التحقق من دقة التجارب الفيزيائية؟'],
      navigationPath: '/damij/sources'
    };
  }

  // General 3D Simulations Catalog
  if (q.includes('تجارب') || q.includes('أحدث') || q.includes('3d') || q.includes('محاكاة') || q.includes('مختبر') || q.includes('افضل')) {
    const topSims = SIMULATION_REGISTRY.slice(0, 4);
    return {
      answer: `### 🚀 أهلاً بك في مجمع المختبرات الافتراضية ثلاثية الأبعاد!\n\nتم ترقية وتطوير جميع تجارب منصة **«ذروة العلم»** إلى المعيار الذهبي ثلاثي الأبعاد (WebGL / Three.js) بأحدث التقنيات:\n\n**أبرز المختبرات ثلاثية الأبعاد المتاحة:**\n1. **الفيزياء الفلكية والنسبية:** الثقب الأسود، تمدد زمن النسبية، ميكانيكا كبلر المدارية، والمجموعة الشمسية.\n2. **الميكانيكا والموائع والأمواج:** نفق الرياح الأيروديناميكي NACA، مدفع المقذوفات الباليستية، وميكانيكا أرخميدس وباسكال.\n3. **الأحياء الجزيئية والطاقة الحيوية:** تضاعف DNA بالهيليكاز، البناء الضوئي في البلاستيدات، ومحرك ATP Synthase في الميتوكوندريا.\n4. **الكهرومغناطيسية والفيزياء النووية:** الموصلية الفائقة المعلقة، المفاعل النووي وإشعاع شيرينكوف، ومصادم الهادرونات الكبير LHC.\n\nانقر على أي تجربة أدناه لتشغيلها فوراً!`,
      recommendations: topSims,
      suggestions: ['أرني تجارب الفيزياء الفلكية والنسبية', 'أرني تجارب الميكانيكا ونفق الرياح', 'أرني تجارب الأحياء الجزيئية', 'افتح فهرس التجارب بالكامل'],
      navigationPath: '/scientific-simulations'
    };
  }

  // General Fallback
  return {
    answer: `### 🎓 مرحباً بك يا ${userName} في مرشدك الذكي 2.0!\n\nأنا مساعدك الأكاديمي الشامل في منصة «ذروة العلم»، وجاهز لمساعدتك في:\n\n• 🔬 **المختبرات ثلاثية الأبعاد:** تشغيل وتفسير أكثر من 50 محاكاة تفاعلية بالفيزياء والكيمياء والأحياء.\n• 💡 **توضيح القوانين والمعادلات:** شرح معمق مدعوم بالرموز الرياضية والأمثلة التطبيقية.\n• 🧭 **دليل المنصة والمصادر:** توجيهك السريع للأقسام، مكتبة الأبحاث، وأدوات التربية الخاصة.\n\nما هو الموضوع أو التجربة التي تود استكشافها الآن؟ 🚀`,
    recommendations: matchedRecs.length > 0 ? matchedRecs.slice(0, 3) : SIMULATION_REGISTRY.slice(0, 3),
    suggestions: [
      'ما هي أحدث التجارب ثلاثية الأبعاد؟',
      'اشرح لي نظرية النسبية الخاصة',
      'أين أجد المكتبة العلمية والمصادر الموثقة؟',
      'كيف يعمل نفق الرياح ومخروط ماخ؟'
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
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | '3d' | 'physics' | 'chemistry' | 'biology'>('all');
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Initial welcome greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: Message = {
        id: 'welcome-msg',
        text: `### مرحباً بك ${userName ? `يا ${userName}` : ''}! 👋\n\nأنا **مرشدك الذكي الفائق 2.0** في منصة «ذروة العلم».\n\n**ميزات المرشد المتقدمة:**\n• 🎙️ **التحدث الصوتي المباشر:** يمكنك النقر على الميكروفون والتحدث بصوتك مباشرة!\n• 🎓 **أنماط ذكاء مخصصة:** اختر بين نمط (الأستاذ الأكاديمي، المستكشف، مدرب التحديات، أو مرشد المنصة).\n• 🔬 **مختبرات 3D تفاعلية:** أرشدك لأكثر من 50 محاكاة ثلاثية الأبعاد مع فتحها بنقرة واحدة.\n• 📚 **توثيق المصادر العلمية:** إمكانية تصفح المراجع والأبحاث العالمية المعتمدة.\n\nتحدث بصوتك أو اكتب سؤالك بالأسفل! 🚀`,
        isUser: false,
        timestamp: new Date(),
        recommendations: SIMULATION_REGISTRY.slice(0, 3),
        suggestions: [
          'أرني أحدث تجارب المختبر ثلاثي الأبعاد',
          'اشرح لي النسبية الخاصة وتمدد الزمن',
          'أين أجد المكتبة العلمية والمصادر؟',
          'اختبرني بتحدٍ علمي في الفيزياء'
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

  // Speech Recognition (Microphone Voice Input)
  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('ميزة الإملاء الصوتي غير مدعومة في متصفحك الحالي');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('جاري الاستماع لصوتك... تحدث الآن 🎙️');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.error('تعذر تشغيل الميكروفون، يرجى التأكد من منح الإذن');
    }
  };

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

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
      persona: activePersona
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
            persona: activePersona,
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
      } catch {
        // Fallback silently to client knowledge engine
      }

      // 2. Generate local intelligent response & simulation action cards
      const offlineResult = generateIntelligentResponse(textToSend, userName || 'صديقي', activePersona);

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
        suggestions: finalSuggestions,
        persona: activePersona
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
      const fallbackResult = generateIntelligentResponse(textToSend, userName || 'صديقي', activePersona);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackResult.answer,
        isUser: false,
        timestamp: new Date(),
        recommendations: fallbackResult.recommendations,
        suggestions: fallbackResult.suggestions,
        persona: activePersona
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

  // Copy message text to clipboard
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص إلى الحافظة');
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
      {/* Enterprise Minimal Floating Pill / Circular Assistant Trigger */}
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
              className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 border border-slate-700/60 dark:border-slate-200 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:scale-102 transition-all duration-200"
              aria-label="فتح المرشد الذكي"
            >
              <div className="relative flex items-center justify-center">
                <Brain className="w-4 h-4 text-cyan-400 dark:text-blue-600 transition-transform group-hover:scale-110" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold tracking-tight">المرشد الذكي</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 dark:bg-blue-100 dark:text-blue-700 font-semibold hidden sm:inline">
                AI 2.0
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enterprise Modular Sidebar Panel (~360px Desktop, Bottom Sheet Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Ambient Backdrop on Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Modular Sidebar / Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`fixed z-50 flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300
                ${isExpanded 
                  ? 'inset-4 md:inset-10' 
                  : 'bottom-4 start-4 end-4 sm:end-auto sm:w-[380px] h-[580px] max-h-[88vh]'
                }
              `}
            >
              {/* Header Bar with Holographic Neural Core */}
              <div className="h-16 px-4 bg-gradient-to-r from-slate-900 via-teal-950/50 to-slate-900 border-b border-teal-500/25 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Holographic Avatar Core */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/40 border border-teal-300/50">
                      <Brain className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-teal-300">
                        مرشدك الذكي 2.0
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-teal-400/50 text-teal-200 bg-teal-950/50 font-bold">
                        AI Multimodal
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>محمود جوارنة</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">نطق وإملاء صوتي فوري</span>
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

              {/* Persona Switcher Bar */}
              <div className="px-3 py-1.5 bg-slate-900/80 border-b border-white/[0.08] flex items-center justify-between gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-1">النمط:</span>
                  {[
                    { id: 'academic', label: '🎓 أكاديمي', desc: 'معادلات وشرح جامعي' },
                    { id: 'explorer', label: '🚀 مستكشف', desc: 'تبسيط وتشبيهات' },
                    { id: 'quiz', label: '🎯 مسابقات', desc: 'تحديات واختبارات' },
                    { id: 'navigator', label: '🧭 مرشد', desc: 'توجيه سريع' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePersona(p.id as MentorPersona);
                        toast.info(`تم تفعيل نمط: ${p.label}`);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 border ${
                        activePersona === p.id
                          ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                      }`}
                      title={p.desc}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400 shrink-0 hidden sm:inline-flex">
                  Gemini + Offline Brain
                </Badge>
              </div>

              {/* Quick Category Filter Bar */}
              <div className="px-3 py-2 bg-slate-900/50 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-1">المختبر:</span>
                {[
                  { id: 'all', label: 'الكل', icon: Compass },
                  { id: '3d', label: 'مختبرات 3D', icon: Zap },
                  { id: 'physics', label: 'فيزياء وفلك', icon: Atom },
                  { id: 'chemistry', label: 'كيمياء', icon: FlaskConical },
                  { id: 'biology', label: 'أحياء وجينات', icon: Dna },
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

                            {/* Actions Footer for Assistant Messages */}
                            {!message.isUser && (
                              <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08] text-[11px] text-slate-400">
                                <div className="flex items-center gap-2">
                                  {/* Speech Audio Button */}
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

                                  {/* Copy Button */}
                                  <button
                                    onClick={() => copyMessage(message.text)}
                                    className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                                    title="نسخ الإجابة"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Feedback Button */}
                                  <button
                                    onClick={() => toast.success('شكراً على تقييمك الإيجابي! 👍')}
                                    className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                                    title="مفيد"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                </div>

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
                                  <span>تجارب ومختبرات مقترحة للتطبيق الفوري:</span>
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
                          <span className="text-xs text-teal-300 font-medium">المرشد الذكي يستحضر البيانات العلمية...</span>
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
                <div className="px-3.5 py-2 bg-slate-900/70 border-t border-slate-800 flex-shrink-0">
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

              {/* Input Message Area with Speech-to-Text Microphone */}
              <div className="p-3 sm:p-3.5 bg-slate-900/95 border-t border-slate-800/80 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* Microphone Speech Recognition Button */}
                  <Button
                    onClick={handleToggleVoiceInput}
                    size="icon"
                    className={`h-10 w-10 rounded-xl shrink-0 transition-all border ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
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
                    placeholder={isListening ? 'جاري الاستماع لصوتك... 🎙️' : 'تحدث أو اكتب سؤالك العلمي... 🚀'}
                    className={`flex-1 text-xs sm:text-sm h-10 bg-slate-950/80 rounded-xl text-white placeholder-slate-400 transition-all ${
                      isListening ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700 focus:border-teal-400 focus:ring-teal-400/20'
                    }`}
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
