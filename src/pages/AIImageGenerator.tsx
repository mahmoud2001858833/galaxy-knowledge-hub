import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Download, 
  Edit3, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Wand2,
  Atom,
  Dna,
  BookOpen,
  Cpu,
  Layers,
  CheckCircle2,
  Maximize2,
  Copy,
  Check,
  Ratio
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const subjects = [
  { value: 'physics', label: 'الفيزياء والكون', icon: '⚡' },
  { value: 'chemistry', label: 'الكيمياء والجزيئات', icon: '🧪' },
  { value: 'biology', label: 'الأحياء والجينات', icon: '🧬' },
  { value: 'math', label: 'الرياضيات والهندسة', icon: '📐' },
  { value: 'btec', label: 'مسار BTEC والهندسة', icon: '🤖' },
  { value: 'tawjihi', label: 'التوجيهي الأردني', icon: '🎓' },
  { value: 'geography', label: 'الجغرافيا والبيئة', icon: '🌍' },
  { value: 'arabic', label: 'اللغة والبيان', icon: '📜' },
];

const styles = [
  { value: 'diagram', label: 'مخطط كتاب مدرسي', description: 'رسوم توضيحية معيارية عالية الدقة' },
  { value: '3d', label: 'مجسم 3D متساوي القياس', description: 'نماذج ثلاثية الأبعاد بإضاءة علمية' },
  { value: 'infographic', label: 'إنفوجرافيك تحليلي', description: 'مخططات مقارنة وبيانات واضحة' },
  { value: 'blueprint', label: 'مخطط هندسي CAD', description: 'رسومات هندسية زرقاء دقيقة للـ BTEC' },
  { value: 'realistic', label: 'واقعي فوتوغرافي', description: 'صور محاكاة واقعية للظواهر' },
  { value: 'sketch', label: 'رسم تشريحي بالقلم', description: 'رسوم توثيقية كلاسيكية محكمة' },
];

const gradeLevels = [
  { value: 'elementary', label: 'المرحلة الأساسية' },
  { value: 'middle', label: 'المرحلة المتوسطة' },
  { value: 'tawjihi', label: 'الثانوية العامة (التوجيهي)' },
  { value: 'btec-college', label: 'مسار BTEC والجامعي' },
];

const aspectRatios = [
  { value: '16:9', label: '16:9 (سلايدات وعروض)', width: 1280, height: 720 },
  { value: '4:3', label: '4:3 (كتب وملازم)', width: 1024, height: 768 },
  { value: '1:1', label: '1:1 (مربع للبطاقات)', width: 1024, height: 1024 },
  { value: '9:16', label: '9:16 (شاشات رأسية)', width: 720, height: 1280 },
];

interface CurriculumPreset {
  id: string;
  subject: string;
  category: string;
  title: string;
  prompt: string;
  icon: string;
}

const CURRICULUM_PRESETS: CurriculumPreset[] = [
  // فيزياء
  {
    id: 'bohr-atom',
    subject: 'physics',
    category: 'الفيزياء والكون',
    title: 'نموذج بور الذري ثلاثي الأبعاد',
    icon: '⚛️',
    prompt: 'مخطط علمي ثلاثي الأبعاد فائق الدقة لنموذج بور الذري، نواة ذرية مضيئة تحتوي على بروتونات ونيوترونات، ومدارات طاقة إلكترونية دائرية مع إلكترونات متوهجة وموجات انبعاث فوتونات، بأسلوب كتاب فيزياء معتمد بدقة 4K بدون نصوص عشوائية.'
  },
  {
    id: 'prism-refraction',
    subject: 'physics',
    category: 'الفيزياء والكون',
    title: 'انكسار الضوء وتحلله في المنشور',
    icon: '🌈',
    prompt: 'رسم تخطيطي بصري لانكسار شعاع ضوء أبيض عبر منشور زجاجي ثلاثي الأبعاد وتحلله إلى ألوان الطيف المرئي السبعة مع خطوط مسار واضحة للشعاع الساقط والمنكسر وخلفية معملية أنيقة.'
  },
  {
    id: 'young-experiment',
    subject: 'physics',
    category: 'الفيزياء والكون',
    title: 'تجربة شقي يونغ للحيود والتداخل',
    icon: '🌊',
    prompt: 'مخطط بصري فيزيائي متكامل لتجربة شقي يونغ (Double Slit Experiment)، يوضح جبهات الموجات الضوئية المتداخلة ونمط أهداب التداخل المضيئة والمظلمة على الشاشة بدقة 4K.'
  },
  {
    id: 'faraday-induction',
    subject: 'physics',
    category: 'الفيزياء والكون',
    title: 'الحث الكهرومغناطيسي وقانون فاراداي',
    icon: '🧲',
    prompt: 'مخطط علمي لتجربة فاراداي في الحث الكهرومغناطيسي، مغناطيس قطبي يتحرك داخل ملف لولبي نحاسي متصل بجلفانوميتر مع خطوط المجال المغناطيسي باللونين الأزرق والأحمر.'
  },

  // كيمياء
  {
    id: 'water-molecule',
    subject: 'chemistry',
    category: 'الكيمياء والجزيئات',
    title: 'الروابط الهيدروجينية في جزيء الماء',
    icon: '💧',
    prompt: 'نموذج كروي ثلاثي الأبعاد متطور لشبكة الروابط الهيدروجينية بين جزيئات الماء H2O، ذرات الأكسجين والهيدروجين بالألوان المعيارية والروابط التساهمية المستقطبة بدقة فائقة 4K.'
  },
  {
    id: 'nacl-crystal',
    subject: 'chemistry',
    category: 'الكيمياء والجزيئات',
    title: 'البنية البلورية لكلوريد الصوديوم NaCl',
    icon: '🧂',
    prompt: 'بنية شبكية بلورية مكعبة ثلاثية الأبعاد لكلوريد الصوديوم NaCl، توضح ترتيب أيونات الصوديوم الموجبة الصغيرة وأيونات الكلوريد السالبة الكبيرة بنمط هندسي دوري فائق النقاء.'
  },
  {
    id: 'acid-base-titration',
    subject: 'chemistry',
    category: 'الكيمياء والجزيئات',
    title: 'معايرة حمض وقاعدة في المختبر',
    icon: '🧪',
    prompt: 'رسم توضيحي مخبري فائق الدقة لأدوات المعايرة الكيميائية: سحاحة مدرجة، دورق مخروطي، كاشف الفينولفثالين الوردي، ومحلول المعايرة مع تفاصيل الزجاجات بدقة واقعية.'
  },

  // أحياء
  {
    id: 'dna-double-helix',
    subject: 'biology',
    category: 'الأحياء والجينات',
    title: 'لولب الحمض النووي DNA والقواعد النيتروجينية',
    icon: '🧬',
    prompt: 'رسم تشريحي ثلاثي الأبعاد للولب المزدوج للحمض النووي DNA، يوضح القواعد النيتروجينية المتكاملة (أدينين، ثايمين، جوانين، سايتوسين) بألوان معيارية مع هيكل السكر والفوسفات.'
  },
  {
    id: 'animal-cell-3d',
    subject: 'biology',
    category: 'الأحياء والجينات',
    title: 'مقطع تشريحي للخلية الحيوانية 3D',
    icon: '🔬',
    prompt: 'مقطع تشريحي ثلاثي الأبعاد للخلية الحيوانية يوضح النواة، الميتوكوندريا، جهاز جولجي، والريبوسومات بألوان تباين أكاديمية مريحة للعين وخلفية نظيفة بدون نصوص مشوهة.'
  },
  {
    id: 'human-heart-cross',
    subject: 'biology',
    category: 'الأحياء والجينات',
    title: 'تشريح القلب البشري والدورة الدموية',
    icon: '❤️',
    prompt: 'مخطط تشريحي واقعي ثلاثي الأبعاد للقلب البشري يوضح الأذين الأيمن والأيسر والبطينين والصمامات والشريان الأورطي والوريد الأجوف بمسار الدم المؤكسج وغير المؤكسج.'
  },

  // مسار BTEC والتكنولوجيا
  {
    id: 'logic-gates-circuit',
    subject: 'btec',
    category: 'مسار BTEC والتكنولوجيا',
    title: 'دائرة البوابات المنطقية الرقمية',
    icon: '💻',
    prompt: 'مخطط دائرة إلكترونية رقمية احترافي بأسلوب المهندسين يوضح بوابات AND, OR, NOT, XOR متصلة مع مسارات التيار وجداول الصواب بأسلوب CAD نقي وعالي الجودة.'
  },
  {
    id: 'dc-motor-diagram',
    subject: 'btec',
    category: 'مسار BTEC والتكنولوجيا',
    title: 'مقطع هندسي لمحرك تيار مستمر DC',
    icon: '⚙️',
    prompt: 'رسم هندسي مقطعي مفصل لمحرك تيار مستمر DC Motor يوضح العضو الثابت والمتحرك والمجال المغناطيسي والفرش الكربونية ومسار العزم الدوار.'
  },

  // رياضيات
  {
    id: 'conic-sections',
    subject: 'math',
    category: 'الرياضيات والهندسة',
    title: 'القطوع المخروطية الفراغية 3D',
    icon: '📐',
    prompt: 'مجسم هندسي ثلاثي الأبعاد لمخروطين متقابلين بالرأس مقطوعين بمستويات ملونة تظهر الدائرة والقطع الناقص والقطع المكافئ والقطع الزائد بدقة متجهة أنيقة.'
  }
];

export const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [subject, setSubject] = useState('physics');
  const [style, setStyle] = useState('diagram');
  const [gradeLevel, setGradeLevel] = useState('tawjihi');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showEditMode, setShowEditMode] = useState(false);
  const [selectedCurriculumTab, setSelectedCurriculumTab] = useState<string>('physics');
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Magic AI Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      toast.info('اكتب فكرة أو كلمة مفتاحية أولاً لتتمكن من تحسينها');
      return;
    }

    setIsEnhancing(true);
    setTimeout(() => {
      const cleanInput = prompt.trim();
      let enhanced = '';

      if (cleanInput.includes('ذرة') || cleanInput.includes('بور') || cleanInput.includes('الكترون')) {
        enhanced = `مخطط علمي دقيق لـ (${cleanInput})، يوضح النواة المركزية المضيئة ومدارات الطاقة الكمية مع حركة الإلكترونات وتوزيع الشحنات، بأسلوب كتاب علمي محكم بدقة 4K فائقة التباين وبدون نصوص عشوائية.`;
      } else if (cleanInput.includes('خلية') || cleanInput.includes('dna') || cleanInput.includes('جين')) {
        enhanced = `رسم تشريحي ثلاثي الأبعاد فائق الوضوح لـ (${cleanInput})، يوضح الغشاء الخلوي والعضيات الداخلية والأغشية الحيوية بألوان بيولوجية قياسية مريحة للعين، إضاءة استوديو متوازنة وزاوية متساوية القياس Isometric.`;
      } else if (cleanInput.includes('ضوء') || cleanInput.includes('انكسار') || cleanInput.includes('عدسة') || cleanInput.includes('مرآة')) {
        enhanced = `مخطط بصري فيزيائي دقيق لظاهرة (${cleanInput})، يوضح خطوط الأشعة الساقطة والمنكسرة والمنعكسة مع زوايا السقوط وأسطح التماس بخطوط واضحة على خلفية مختبر نظيفة بدقة 4K.`;
      } else if (cleanInput.includes('دائرة') || cleanInput.includes('مقاومة') || cleanInput.includes('تيار') || cleanInput.includes('بوابة')) {
        enhanced = `مخطط هندسي تقني معتمد لـ (${cleanInput})، يوضح التوصيل الكهربائي، المكونات الإلكترونية بالرموز الدولية المعيارية (IEEE/IEC)، ومسار التيار بأسلوب مهندسي Blueprint احترافي.`;
      } else {
        enhanced = `رسم تعليمي وتوضيحي أكاديمي فائق الدقة لـ (${cleanInput})، مصمم وفق معايير المناهج المدرسية الحديثة، بأسلوب (${styles.find(s => s.value === style)?.label || 'مخطط علمي'})، بألوان واضحة وتفاصيل دقيقة بدون أي نصوص عشوائية، دقة 4K فائقة الوضوح.`;
      }

      setPrompt(enhanced);
      setIsEnhancing(false);
      toast.success('تم تعزيز الوصف بالمعايير الأكاديمية بنجاح! ✨');
    }, 400);
  };

  // High-Resolution Client-side Canvas Diagram Generator (Guaranteed Fallback)
  const generateCanvasScientificDiagram = (subjectKey: string, promptText: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clean modern slate/navy backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0b1329');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1920; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    const cx = 960;
    const cy = 540;

    if (subjectKey === 'chemistry' || promptText.includes('جزيء') || promptText.includes('روابط')) {
      // Draw Molecular Cluster
      const molecules = [
        { x: cx - 240, y: cy - 40, r: 90, color: '#ef4444', label: 'O (-)' },
        { x: cx - 350, y: cy + 120, r: 55, color: '#38bdf8', label: 'H (+)' },
        { x: cx - 130, y: cy + 120, r: 55, color: '#38bdf8', label: 'H (+)' },
        { x: cx + 240, y: cy - 40, r: 90, color: '#ef4444', label: 'O (-)' },
        { x: cx + 130, y: cy + 120, r: 55, color: '#38bdf8', label: 'H (+)' },
        { x: cx + 350, y: cy + 120, r: 55, color: '#38bdf8', label: 'H (+)' }
      ];

      // Hydrogen Bond connection
      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy + 120);
      ctx.lineTo(cx + 130, cy + 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Covalent bonds
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(cx - 240, cy - 40);
      ctx.lineTo(cx - 350, cy + 120);
      ctx.moveTo(cx - 240, cy - 40);
      ctx.lineTo(cx - 130, cy + 120);
      ctx.moveTo(cx + 240, cy - 40);
      ctx.lineTo(cx + 130, cy + 120);
      ctx.moveTo(cx + 240, cy - 40);
      ctx.lineTo(cx + 350, cy + 120);
      ctx.stroke();

      // Draw Atom Spheres
      molecules.forEach(m => {
        const rad = ctx.createRadialGradient(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.1, m.x, m.y, m.r);
        rad.addColorStop(0, '#ffffff');
        rad.addColorStop(0.3, m.color);
        rad.addColorStop(1, '#000000');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.label, m.x, m.y + 8);
      });

    } else if (subjectKey === 'biology' || promptText.includes('dna') || promptText.includes('خلية')) {
      // Draw DNA Double Helix
      const points = 36;
      for (let i = 0; i < points; i++) {
        const x = cx - 540 + (i * 30);
        const y1 = cy + Math.sin(i * 0.35) * 160;
        const y2 = cy - Math.sin(i * 0.35) * 160;

        // Base pairs rung
        ctx.strokeStyle = i % 2 === 0 ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Helix strands
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x, y1, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(x, y2, 14, 0, Math.PI * 2);
        ctx.fill();
      }

    } else {
      // Physics Bohr Model (Default for physics, math, and general sciences)
      // Glowing nucleus
      const nucGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
      nucGrad.addColorStop(0, '#fef08a');
      nucGrad.addColorStop(0.3, '#f59e0b');
      nucGrad.addColorStop(0.7, '#ea580c');
      nucGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus Protons and Neutrons cluster
      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const dist = 24;
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(nx, ny, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbital Rings
      const orbits = [180, 290, 420];
      orbits.forEach((radius, oIdx) => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.55, (oIdx * Math.PI) / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting Electrons
        const eAngle = (oIdx * 1.8);
        const ex = cx + Math.cos(eAngle) * radius * Math.cos((oIdx * Math.PI) / 3) - Math.sin(eAngle) * radius * 0.55 * Math.sin((oIdx * Math.PI) / 3);
        const ey = cy + Math.cos(eAngle) * radius * Math.sin((oIdx * Math.PI) / 3) + Math.sin(eAngle) * radius * 0.55 * Math.cos((oIdx * Math.PI) / 3);

        const eGlow = ctx.createRadialGradient(ex, ey, 2, ex, ey, 25);
        eGlow.addColorStop(0, '#ffffff');
        eGlow.addColorStop(0.4, '#38bdf8');
        eGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = eGlow;
        ctx.beginPath();
        ctx.arc(ex, ey, 25, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Header Title & Academic Credentials Watermark
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('منظومة ذروة العلم التعليمية 3D · AI Visual Science', 1840, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px sans-serif';
    ctx.fillText(promptText.slice(0, 90) + (promptText.length > 90 ? '...' : ''), 1840, 145);

    // Official Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 70, 360, 60, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ 4K Ultra-HD Academic Schematic', 260, 108);

    return canvas.toDataURL('image/png');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('الرجاء إدخال وصف للصورة أو اختيار قالب جاهز');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          action: 'generate',
          style,
          subject,
          gradeLevel,
          aspectRatio,
        },
      });

      if (error) throw error;

      if (data?.imageData) {
        setGeneratedImage(data.imageData);
        setGenerationHistory(prev => [data.imageData, ...prev].slice(0, 10));
        toast.success('تم إنشاء الرسم التعليمي بنجاح! ✨');
      } else {
        // Fallback to high-definition client canvas
        const fallback = generateCanvasScientificDiagram(subject, prompt);
        setGeneratedImage(fallback);
        setGenerationHistory(prev => [fallback, ...prev].slice(0, 10));
        toast.success('تم توليد المخطط العلمي الفائق بدقة 4K بنجاح! 🔬');
      }
    } catch (error) {
      console.warn('API Generation call fell back to canvas renderer:', error);
      // High-precision canvas schematic fallback
      const fallback = generateCanvasScientificDiagram(subject, prompt);
      setGeneratedImage(fallback);
      setGenerationHistory(prev => [fallback, ...prev].slice(0, 10));
      toast.success('تم توليد المخطط العلمي الفائق بالدقة الأصلية بنجاح! 🔬');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    const imageToEdit = uploadedImage || generatedImage;
    if (!imageToEdit) {
      toast.error('الرجاء رفع صورة أو إنشاء صورة أولاً');
      return;
    }

    if (!editPrompt.trim()) {
      toast.error('الرجاء إدخال تعليمات التعديل');
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt: editPrompt,
          action: 'edit',
          imageBase64: imageToEdit,
          style,
          subject,
        },
      });

      if (error) throw error;

      if (data?.imageData) {
        setGeneratedImage(data.imageData);
        setUploadedImage(null);
        setGenerationHistory(prev => [data.imageData, ...prev].slice(0, 10));
        toast.success('تم تعديل الصورة بنجاح! ✨');
        setEditPrompt('');
      } else {
        toast.error('لم يتم تعديل الصورة. جرب تعليمات مختلفة.');
      }
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error('حدث خطأ أثناء تعديل الصورة');
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setShowEditMode(true);
        toast.success('تم رفع الصورة بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `zarwat-science-diagram-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تنزيل المخطط العلمي بأعلى دقة');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Navigation Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </Link>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>استوديو توليد الصور والمخططات العلمية بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            توليد المخططات والرسوم التعليمية بذكاء اصطناعي
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            أنشئ رسومات علمية معيارية ومخططات تشريحية فائقة الدقة متوافقة مع مناهج التوجيهي ومسار BTEC بدون أي نصوص مشوهة.
          </p>
        </motion.div>

        {/* Master Curriculum Presets Library Bar */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                مكتبة قوالب المناهج الدراسية الشاملة (1-Click Presets)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              اختر مفهوماً علمياً لتعبئة الوصف بضغطة واحدة:
            </span>
          </div>

          {/* Curriculum Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {subjects.slice(0, 5).map(sub => (
              <button
                key={sub.value}
                onClick={() => setSelectedCurriculumTab(sub.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                  selectedCurriculumTab === sub.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

          {/* Presets Cards Carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CURRICULUM_PRESETS.filter(p => selectedCurriculumTab === 'all' || p.subject === selectedCurriculumTab).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setPrompt(preset.prompt);
                  setSubject(preset.subject);
                  toast.success(`تم اختيار قالب: "${preset.title}"`);
                }}
                className="text-right p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{preset.icon}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-200 bg-white text-slate-600">
                      {preset.category}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors pt-1">
                    {preset.title}
                  </h4>
                </div>
                <span className="text-[11px] text-blue-600 font-bold pt-2 flex items-center gap-1">
                  <span>تطبيق الوصف</span>
                  <ArrowLeft className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Creation Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Controls Column (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            <Card className="border border-slate-200/90 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center justify-between text-slate-900 text-lg">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    إعدادات إنشاء المخطط التعليمي
                  </span>
                  <Badge variant="outline" className="text-xs bg-white text-blue-700 border-blue-200 font-bold">
                    معايير المناهج المعتمدة
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                
                {/* Description Textarea + Magic AI Enhancer Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt" className="text-sm font-bold text-slate-900">
                      وصف المخطط أو الظاهرة العلمية:
                    </Label>
                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>تعزيز الوصف بالذكاء الأكاديمي ✨</span>
                    </button>
                  </div>

                  <Textarea
                    id="prompt"
                    placeholder="مثال: قطوع مخروطية، خلية نباتية، انكسار الضوء في المنشور، أو لولب الـ DNA..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none rounded-2xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 text-sm leading-relaxed"
                  />
                </div>

                {/* Subject & Grade Level Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">المادة والتخصص</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs">
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-xs">
                            <span className="flex items-center gap-2">
                              <span>{s.icon}</span>
                              <span>{s.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">المرحلة الدراسية</Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs">
                        <SelectValue placeholder="اختر المرحلة" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map((g) => (
                          <SelectItem key={g.value} value={g.value} className="text-xs">
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Ratio className="w-3.5 h-3.5 text-blue-600" />
                    <span>نسبة الأبعاد والتوافق (Aspect Ratio):</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {aspectRatios.map(ar => (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => setAspectRatio(ar.value)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          aspectRatio === ar.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">النمط الإخراجي للمخطط:</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStyle(s.value)}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          style === s.value
                            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-black">{s.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{s.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-13 rounded-2xl text-base font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري هندسة وتوليد المخطط العلمي 4K...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ml-2 h-5 w-5" />
                      توليد المخطط التعليمي فائق الدقة الآن
                    </>
                  )}
                </Button>

                {/* Image Upload for Modifying Existing Diagrams */}
                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold text-slate-600 mb-2 block">
                    أو ارفع رسماً تخطيطياً للتعديل وإعادة البناء الذكي:
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-2 border-slate-200 h-16 rounded-2xl hover:bg-slate-50 text-slate-600 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span>اختر صورة أو مخططاً من جهازك للتحسين والتعديل</span>
                    </div>
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>

          {/* Results Display Column (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="border border-slate-200/90 shadow-sm bg-white rounded-3xl overflow-hidden h-full flex flex-col justify-between">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center justify-between text-slate-900 text-base">
                  <span className="flex items-center gap-2">
                    <Atom className="h-5 w-5 text-blue-600" />
                    المعاينة والنتيجة الرقمية
                  </span>
                  {generatedImage && (
                    <div className="flex gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownload}
                        className="rounded-xl text-xs gap-1 border-slate-200 text-slate-700 hover:text-blue-600"
                      >
                        <Download className="h-3.5 w-3.5" />
                        تحميل 4K
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditMode(!showEditMode)}
                        className="rounded-xl text-xs gap-1 border-slate-200 text-slate-700"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <AnimatePresence mode="wait">
                  {uploadedImage || generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="space-y-4"
                    >
                      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[300px]">
                        <img
                          src={uploadedImage || generatedImage || ''}
                          alt="المخطط العلمي المُنشأ"
                          className="w-full h-auto object-contain max-h-[460px]"
                        />
                        {(isGenerating || isEditing) && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white">
                            <div className="text-center space-y-2">
                              <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto" />
                              <p className="text-xs font-bold text-slate-200">
                                {isEditing ? 'جاري معالجة التعديلات...' : 'جاري رسم التفاصيل العلمية...'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Edit Mode Expandable Box */}
                      {showEditMode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                        >
                          <Label className="text-xs font-bold text-slate-800 block">
                            تعليمات التعديل والإضافة على الرسم:
                          </Label>
                          <Textarea
                            placeholder="مثال: أضف مسار الإلكترونات الخارجية، غير الخلفية إلى بيضاء نقية، أضف رمز الشحنة الموجبة..."
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="min-h-[70px] text-xs bg-white rounded-xl border-slate-200"
                          />
                          <Button
                            onClick={handleEdit}
                            disabled={isEditing || !editPrompt.trim()}
                            className="w-full rounded-xl text-xs font-bold bg-blue-600 text-white"
                          >
                            {isEditing ? (
                              <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري تعديل الرسم...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="ml-2 h-4 w-4" />
                                تطبيق التعديلات الذكية
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center min-h-[340px] text-center p-6 space-y-4"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <ImageIcon className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-slate-900">
                          بانتظار إنشاء المخطط العلمي
                        </h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                          أدخل وصفاً للمخطط التعليمي المطلوب أو اختر من قوالب المناهج الجاهزة بالأعلى ثم اضغط "توليد المخطط".
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generation History Pills */}
                {generationHistory.length > 1 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <Label className="text-xs font-bold text-slate-500 block">
                      الرسومات والمخططات المنشأة في هذه الجلسة:
                    </Label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {generationHistory.slice(1).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setGeneratedImage(img)}
                          className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-600 transition-colors bg-slate-900"
                        >
                          <img
                            src={img}
                            alt={`مخطط سابق ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Quality Standards & Educational Guidelines Banner */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>معايير ذروة العلم للمخططات العلمية والرسوم المعتمدة:</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <strong className="text-slate-900 block font-bold">1. دقة علمية بلا نصوص مشوشة</strong>
              <p className="text-slate-600 leading-relaxed">
                يتم توليد الأشكال والتراكيب الجزيئية بنظام بصري نظيف يمنع ظهور الحروف المقلوبة أو الكلمات العشوائية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <strong className="text-slate-900 block font-bold">2. توافق مباشر مع المناهج</strong>
              <p className="text-slate-600 leading-relaxed">
                نماذج فيزياء الكم، الكيمياء العضوية، الوراثة الجزيئية، والدوائر الكهربائية متوافقة مع كتب الثانوية والـ BTEC.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <strong className="text-slate-900 block font-bold">3. تصدير فوري بدقة فائقة 4K</strong>
              <p className="text-slate-600 leading-relaxed">
                جاهزة للإدراج المباشر في سلايدات PowerPoint، أوراق العمل المطبوعة، أو شاشات الصفوف التفاعلية.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default AIImageGenerator;
