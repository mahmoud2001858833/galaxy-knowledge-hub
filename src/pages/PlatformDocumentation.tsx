import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, FileText, Atom, FlaskConical, Calculator, Leaf, Globe, BookOpen, Brain, Users, Palette, Shield, Sparkles, Microscope, Telescope, Zap, Monitor, Heart, MessageCircle, Video, Calendar, School, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useLanguage } from '@/i18n/LanguageContext';
import jsPDF from 'jspdf';

const PlatformDocumentation = () => {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = 20;
    const lineHeight = 6;
    const sectionGap = 10;

    // Add Arabic font support - using default font for now
    doc.setFont('helvetica');

    const addNewPageIfNeeded = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
    };

    const addTitle = (text: string, size: number = 16) => {
      addNewPageIfNeeded(15);
      doc.setFontSize(size);
      doc.setTextColor(59, 130, 246);
      doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight + 4;
    };

    const addSection = (text: string, size: number = 12) => {
      addNewPageIfNeeded(12);
      doc.setFontSize(size);
      doc.setTextColor(34, 197, 94);
      doc.text(text, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += lineHeight + 2;
    };

    const addSubSection = (text: string) => {
      addNewPageIfNeeded(10);
      doc.setFontSize(10);
      doc.setTextColor(168, 85, 247);
      doc.text(text, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += lineHeight;
    };

    const addText = (text: string, indent: number = 0) => {
      addNewPageIfNeeded(8);
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);
      lines.forEach((line: string) => {
        addNewPageIfNeeded(6);
        doc.text(line, pageWidth - margin - indent, yPosition, { align: 'right' });
        yPosition += lineHeight - 1;
      });
    };

    const addBullet = (text: string, number: string) => {
      addNewPageIfNeeded(8);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const fullText = `${text} .${number}`;
      const lines = doc.splitTextToSize(fullText, pageWidth - (margin * 2) - 10);
      lines.forEach((line: string) => {
        addNewPageIfNeeded(6);
        doc.text(line, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += lineHeight - 1;
      });
    };

    // Title Page
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFontSize(28);
    doc.setTextColor(59, 130, 246);
    doc.text('Tharwat Al-Ilm Platform', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text('Complete Platform Documentation', pageWidth / 2, 75, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString('ar-JO')}`, pageWidth / 2, 90, { align: 'center' });

    // New page for content
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;

    // Section 1: Overview
    addTitle('Section 1: Platform Overview', 14);
    addText('Tharwat Al-Ilm - A comprehensive educational platform offering interactive scientific simulations, AI-powered assistants, and rich educational content across multiple disciplines.');
    yPosition += sectionGap;

    // Section 2: Scientific Platforms
    addSection('Section 2: Main Scientific Platforms');
    
    addSubSection('2.1 Physics Platform (/physics)');
    addBullet('Physical Calculations - 20+ equations with detailed explanations', '1');
    addBullet('Smart Physics Assistant - AI-powered Q&A', '2');
    addBullet('Physics Scientists Encyclopedia', '3');
    addBullet('Question Bank - Custom question creation', '4');
    yPosition += 3;

    addSubSection('2.2 Chemistry Platform (/chemistry)');
    addBullet('Interactive Periodic Table - 118 elements with full details', '1');
    addBullet('Chemical Calculations', '2');
    addBullet('Chemistry Scientists Encyclopedia', '3');
    addBullet('Smart Chemistry Assistant', '4');
    addBullet('Question Bank', '5');
    yPosition += 3;

    addSubSection('2.3 Mathematics Platform (/mathematics)');
    addBullet('Advanced Mathematical Calculator', '1');
    addBullet('Interactive Graph Gallery', '2');
    addBullet('Mathematics Hall of Fame', '3');
    addBullet('Smart Math Assistant', '4');
    addBullet('Question Bank', '5');
    yPosition += 3;

    addSubSection('2.4 Biology Platform (/biology)');
    addBullet('Biological Calculations - 20+ calculations', '1');
    addBullet('Smart Biology Assistant', '2');
    addBullet('Biology Scientists Encyclopedia', '3');
    addBullet('Disease Encyclopedia', '4');
    addBullet('Question Bank', '5');
    yPosition += sectionGap;

    // Section 3: Scientific Experiments
    addSection('Section 3: Interactive Scientific Experiments (30+ Experiments)');

    addSubSection('3.1 Physics Experiments (15 experiments)');
    addBullet('Black Body Radiation - Graphical representation, energy calculators, AI assistant', '1');
    addBullet('Atom Builder - Drag and drop particles, automatic element identification', '2');
    addBullet('Large Hadron Collider - Particle acceleration, boson detection, 13 TeV energy', '3');
    addBullet('Electromagnetic Waves - Full spectrum, frequency control', '4');
    addBullet('Nuclear Reactions - Uranium fission, deuterium fusion', '5');
    addBullet('Optics Lab - Lenses, mirrors, prisms', '6');
    addBullet('Projectile Motion - Various angles, pendulum, air resistance', '7');
    addBullet('Quantum Mechanics - Double slit, quantum tunneling, superposition', '8');
    addBullet('Electromagnetism - Magnetic field, coils, compasses', '9');
    addBullet('Waves and Sound - Doppler effect, wave interference', '10');
    addBullet('Static Electricity - Charges, Tesla coil', '11');
    addBullet('Earth Sciences - Earthquakes, volcanoes, tectonic plates', '12');
    addBullet('Advanced Nuclear Physics - Alpha, beta, gamma decay', '13');
    addBullet('Materials Science - Crystals, alloys, stress, phases', '14');
    addBullet('Advanced Optics - 3D prism, lenses, interference, polarization', '15');
    yPosition += 3;

    addSubSection('3.2 Chemistry Experiments (3 experiments)');
    addBullet('3D Chemical Reactions - 30+ reactions, 3D graphics', '16');
    addBullet('Analytical Chemistry - Titration, pH measurement, spectral analysis', '17');
    addBullet('Electrochemistry - Galvanic cells, electrolysis', '18');
    yPosition += 3;

    addSubSection('3.3 Biology Experiments (4 experiments)');
    addBullet('Genetics Lab - Punnett square, DNA replication, mutations', '19');
    addBullet('Molecular Biology - DNA replication, transcription, PCR', '20');
    addBullet('Human Body - Circulatory, respiratory, nervous, digestive systems', '21');
    addBullet('Ecosystem - Food chain, population dynamics', '22');
    yPosition += 3;

    addSubSection('3.4 Astronomy Experiments (3 experiments)');
    addBullet('3D Solar System - 360° control, planet information', '23');
    addBullet('Advanced Astronomy - Solar and lunar eclipses, Kepler laws', '24');
    addBullet('Space Sciences - Rocket launch, orbits', '25');
    yPosition += 3;

    addSubSection('3.5 Mathematics Experiments (2 experiments)');
    addBullet('Fourier Series - Piecewise functions, Gibbs phenomenon', '26');
    addBullet('3D Functions - 1D/2D/3D display, 15+ examples', '27');
    yPosition += 3;

    addSubSection('3.6 Electronics Experiments (2 experiments)');
    addBullet('Circuit Builder - Drag and drop, 9+ components', '28');
    addBullet('Digital Electronics - Logic gates, half adder', '29');
    yPosition += sectionGap;

    // Section 4: Literary Platforms
    addSection('Section 4: Literary Platforms');
    
    addSubSection('4.1 Arabic Language Platform (/arabic-platform)');
    addBullet('Arabic Grammar - Basics, grammar library', '1');
    addBullet('Arabic Morphology - Basics, roots, derivatives', '2');
    addBullet('Prosody and Rhyme', '3');
    addBullet('Literary Criticism', '4');
    yPosition += 3;

    addSubSection('4.2 English Language Platform (/english-language)');
    addBullet('English language learning resources', '1');
    yPosition += sectionGap;

    // Section 5: Islamic Education
    addSection('Section 5: Islamic Education');
    addBullet('Hijri Events Explorer', '1');
    addBullet('Islamic Historical Eras', '2');
    yPosition += sectionGap;

    // Section 6: Jordanian Curriculum
    addSection('Section 6: Jordanian Curriculum (Tawjihi)');
    addBullet('History - Comprehensive educational content', '1');
    addBullet('Islamic Religion', '2');
    addBullet('English Language', '3');
    addBullet('Arabic Language', '4');
    addBullet('Smart Jordanian Curriculum Assistant', '5');
    yPosition += sectionGap;

    // Section 7: BTEC
    addSection('Section 7: BTEC Platform');
    addBullet('Programming Section - Learn programming', '1');
    addBullet('Student Projects', '2');
    addBullet('Code Corrector - Bug fixing', '3');
    addBullet('Development Tips', '4');
    addBullet('Platform Builder', '5');
    yPosition += sectionGap;

    // Section 8: Sustainability
    addSection('Section 8: Environmental Sustainability');
    addBullet('Carbon Footprint Calculator', '1');
    addBullet('School Environmental Projects', '2');
    addBullet('Home Projects', '3');
    addBullet('Personal Sustainability Index', '4');
    addBullet('Recycling Advisor', '5');
    addBullet('Environmental Predictions Dashboard', '6');
    yPosition += sectionGap;

    // Section 9: AI Tools
    addSection('Section 9: AI Tools');
    addBullet('Falak Knowledge Assistant', '1');
    addBullet('Smart Math Assistant', '2');
    addBullet('Smart Physics Assistant', '3');
    addBullet('Smart Chemistry Assistant', '4');
    addBullet('Smart Biology Assistant', '5');
    addBullet('Jordanian Curriculum Assistant', '6');
    addBullet('AI Platform Builder', '7');
    yPosition += sectionGap;

    // Section 10: Additional Tools
    addSection('Section 10: Additional Educational Tools');
    addBullet('Visual Library - Educational image uploads', '1');
    addBullet('Scientific Journal', '2');
    addBullet('Study Organizer', '3');
    addBullet('Chat Rooms', '4');
    addBullet('Subject Puzzles', '5');
    addBullet('Math Puzzles', '6');
    addBullet('Educational Videos', '7');
    addBullet('Recorded Lessons', '8');
    addBullet('Psychological Guide', '9');
    addBullet('School Magazine', '10');
    addBullet('Study Schedule Creator', '11');
    addBullet('Student Progress Tracker', '12');
    yPosition += sectionGap;

    // Section 11: Art
    addSection('Section 11: Art and Design');
    addBullet('Art and Design Platform', '1');
    addBullet('Drawing Challenge', '2');
    yPosition += sectionGap;

    // Section 12: Teacher/Parent System
    addSection('Section 12: Teachers and Parents System');
    addSubSection('Teacher System:');
    addBullet('Teacher Registration', '1');
    addBullet('Teacher Dashboard', '2');
    addBullet('Assignments', '3');
    addBullet('Notes', '4');
    addBullet('Statistics', '5');
    addBullet('Class Chat', '6');
    yPosition += 3;
    addSubSection('Parent System:');
    addBullet('Parent Registration', '1');
    addBullet('Parent Dashboard', '2');
    addBullet('Assignment Tracking', '3');
    addBullet('Notes', '4');
    yPosition += sectionGap;

    // Section 13: Administration
    addSection('Section 13: Administration and Control');
    addBullet('Control Center', '1');
    addBullet('Communication Bridge', '2');
    addBullet('Management Section', '3');
    addBullet('Administrators/Teachers Page', '4');
    addBullet('Tenant Settings', '5');

    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Tharwat Al-Ilm Platform - Complete Documentation', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    doc.save('Tharwat-Al-Ilm-Platform-Documentation.pdf');
  };

  const sections = [
    {
      id: 1,
      title: 'نظرة عامة على المنصة',
      titleEn: 'Platform Overview',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      content: [
        'منصة ذروة العلم - منصة تعليمية شاملة',
        'تجارب علمية تفاعلية ثلاثية الأبعاد',
        'مساعدات ذكية مدعومة بالذكاء الاصطناعي',
        'محتوى تعليمي غني متعدد التخصصات'
      ]
    },
    {
      id: 2,
      title: 'المنصات العلمية الرئيسية',
      titleEn: 'Scientific Platforms',
      icon: Atom,
      color: 'from-purple-500 to-pink-500',
      subsections: [
        {
          name: 'منصة الفيزياء',
          items: ['الحسابات الفيزيائية - 20+ معادلة', 'المساعد الذكي للفيزياء', 'موسوعة علماء الفيزياء', 'بنك الأسئلة']
        },
        {
          name: 'منصة الكيمياء',
          items: ['الجدول الدوري التفاعلي - 118 عنصر', 'الحسابات الكيميائية', 'موسوعة علماء الكيمياء', 'المساعد الذكي', 'بنك الأسئلة']
        },
        {
          name: 'منصة الرياضيات',
          items: ['الحاسبة الرياضية المتقدمة', 'معرض الرسوم البيانية', 'أعلام الرياضيات', 'المساعد الذكي', 'بنك الأسئلة']
        },
        {
          name: 'منصة الأحياء',
          items: ['الحسابات الحيوية - 20+ حساب', 'المساعد الذكي', 'موسوعة العلماء', 'موسوعة الأمراض', 'بنك الأسئلة']
        }
      ]
    },
    {
      id: 3,
      title: 'التجارب العلمية التفاعلية',
      titleEn: 'Scientific Experiments (30+)',
      icon: FlaskConical,
      color: 'from-green-500 to-emerald-500',
      subsections: [
        {
          name: 'تجارب الفيزياء (15 تجربة)',
          items: [
            '1. إشعاع الجسم الأسود - التمثيل البياني، حاسبات الطاقة',
            '2. بناء الذرة - سحب وإفلات الجسيمات',
            '3. مصادم الهدرونات الكبير - تسريع الجسيمات، 13 TeV',
            '4. الموجات الكهرومغناطيسية - الطيف الكامل',
            '5. التفاعلات النووية - الانشطار والاندماج',
            '6. مختبر البصريات - العدسات والمرايا والمناشير',
            '7. حركة المقذوفات - البندول، مقاومة الهواء',
            '8. ميكانيكا الكم - الشق المزدوج، النفق الكمي',
            '9. الكهرومغناطيسية - المجال المغناطيسي، الملفات',
            '10. الموجات والصوت - تأثير دوبلر، التداخل',
            '11. الكهرباء الساكنة - الشحنات، ملف تسلا',
            '12. علوم الأرض - الزلازل، البراكين',
            '13. الفيزياء النووية المتقدمة - تحلل ألفا، بيتا، جاما',
            '14. علوم المواد - البلورات، السبائك، الإجهاد',
            '15. البصريات المتقدمة - المنشور 3D، التداخل، الاستقطاب'
          ]
        },
        {
          name: 'تجارب الكيمياء (3 تجارب)',
          items: [
            '16. التفاعلات الكيميائية 3D - 30+ تفاعل',
            '17. الكيمياء التحليلية - المعايرة، قياس pH',
            '18. الكيمياء الكهربائية - الخلايا الجلفانية'
          ]
        },
        {
          name: 'تجارب الأحياء (4 تجارب)',
          items: [
            '19. مختبر الوراثة - مربع بونيت، تضاعف DNA',
            '20. البيولوجيا الجزيئية - النسخ، PCR',
            '21. جسم الإنسان - الأجهزة الحيوية',
            '22. النظام البيئي - السلسلة الغذائية'
          ]
        },
        {
          name: 'تجارب الفلك (3 تجارب)',
          items: [
            '23. النظام الشمسي 3D - تحكم 360°',
            '24. الفلك المتقدم - الكسوف والخسوف',
            '25. علوم الفضاء - إطلاق الصواريخ'
          ]
        },
        {
          name: 'تجارب الرياضيات والإلكترونيات (4 تجارب)',
          items: [
            '26. سلسلة فورييه - ظاهرة غيبس',
            '27. الدوال ثلاثية الأبعاد - 15+ مثال',
            '28. بناء الدوائر الكهربائية - 9+ مكونات',
            '29. الإلكترونيات الرقمية - بوابات المنطق'
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'المنصات الأدبية',
      titleEn: 'Literary Platforms',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-500',
      subsections: [
        {
          name: 'منصة اللغة العربية',
          items: ['النحو العربي - الأساسيات والمكتبة', 'الصرف العربي - الجذور والمشتقات', 'العروض والقافية', 'النقد الأدبي']
        },
        {
          name: 'منصة اللغة الإنجليزية',
          items: ['مصادر تعلم اللغة الإنجليزية']
        }
      ]
    },
    {
      id: 5,
      title: 'التربية الإسلامية',
      titleEn: 'Islamic Education',
      icon: Star,
      color: 'from-emerald-500 to-teal-500',
      content: ['استكشاف الأحداث الهجرية', 'العصور التاريخية الإسلامية']
    },
    {
      id: 6,
      title: 'المنهاج الأردني (التوجيهي)',
      titleEn: 'Jordanian Curriculum',
      icon: School,
      color: 'from-red-500 to-rose-500',
      content: ['التاريخ', 'الدين الإسلامي', 'اللغة الإنجليزية', 'اللغة العربية', 'المساعد الذكي للمنهاج']
    },
    {
      id: 7,
      title: 'منصة BTEC',
      titleEn: 'BTEC Platform',
      icon: Monitor,
      color: 'from-indigo-500 to-violet-500',
      content: ['قسم البرمجة', 'مشاريع الطلاب', 'مصحح الأكواد', 'نصائح التطوير', 'بناء المنصات']
    },
    {
      id: 8,
      title: 'الاستدامة البيئية',
      titleEn: 'Environmental Sustainability',
      icon: Leaf,
      color: 'from-green-600 to-lime-500',
      content: ['حاسبة البصمة الكربونية', 'مشاريع مدرسية بيئية', 'مشاريع منزلية', 'مؤشر الاستدامة الشخصي', 'مستشار إعادة التدوير', 'لوحة التنبؤات البيئية']
    },
    {
      id: 9,
      title: 'أدوات الذكاء الاصطناعي',
      titleEn: 'AI Tools',
      icon: Brain,
      color: 'from-pink-500 to-fuchsia-500',
      content: ['مساعد فالك للمعرفة', 'مساعد الرياضيات الذكي', 'مساعد الفيزياء الذكي', 'مساعد الكيمياء الذكي', 'مساعد الأحياء الذكي', 'مساعد المنهاج الأردني', 'منشئ المنصات بالذكاء الاصطناعي']
    },
    {
      id: 10,
      title: 'أدوات تعليمية إضافية',
      titleEn: 'Additional Tools',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500',
      content: ['المكتبة البصرية', 'المجلة العلمية', 'منظم الدراسة', 'غرف المحادثة', 'ألغاز المواد', 'ألغاز الرياضيات', 'الفيديوهات التعليمية', 'الدروس المسجلة', 'المرشد النفسي', 'المجلة المدرسية', 'منشئ جداول الدراسة', 'تقدم الطالب']
    },
    {
      id: 11,
      title: 'الفن والتصميم',
      titleEn: 'Art & Design',
      icon: Palette,
      color: 'from-violet-500 to-purple-500',
      content: ['منصة الفن والتصميم', 'تحدي الرسم']
    },
    {
      id: 12,
      title: 'نظام المعلمين وأولياء الأمور',
      titleEn: 'Teachers & Parents System',
      icon: Users,
      color: 'from-orange-500 to-amber-500',
      subsections: [
        {
          name: 'نظام المعلمين',
          items: ['تسجيل المعلم', 'لوحة التحكم', 'الواجبات', 'الملاحظات', 'الإحصائيات', 'المحادثة الصفية']
        },
        {
          name: 'نظام أولياء الأمور',
          items: ['تسجيل ولي الأمر', 'لوحة التحكم', 'متابعة الواجبات', 'الملاحظات']
        }
      ]
    },
    {
      id: 13,
      title: 'الإدارة والتحكم',
      titleEn: 'Administration',
      icon: Shield,
      color: 'from-slate-500 to-gray-600',
      content: ['مركز التحكم', 'جسر التواصل', 'قسم الإدارة', 'صفحة المشرفين والمعلمين', 'إعدادات المستأجر']
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <StarField />
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              توثيق منصة ذروة العلم
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            دليل شامل لجميع ميزات المنصة - أكثر من 30 تجربة علمية تفاعلية و13 قسم رئيسي
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              onClick={generatePDF}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              <Download className="w-6 h-6 ml-2" />
              تحميل كملف PDF
            </Button>
          </motion.div>
        </motion.div>

        {/* Content */}
        <div ref={contentRef} className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                  <section.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {section.id}. {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{section.titleEn}</p>
                </div>
              </div>

              {section.content && (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground bg-background/50 rounded-lg px-4 py-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections && (
                <div className="space-y-4 mt-4">
                  {section.subsections.map((sub, subIndex) => (
                    <div key={subIndex} className="bg-background/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-primary mb-3">{sub.name}</h3>
                      <ul className="space-y-2">
                        {sub.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {itemIndex + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'تجربة علمية', value: '30+', icon: Microscope },
            { label: 'قسم رئيسي', value: '13', icon: Globe },
            { label: 'مساعد ذكي', value: '7', icon: Brain },
            { label: 'أداة تعليمية', value: '50+', icon: Sparkles }
          ].map((stat, i) => (
            <div key={i} className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-4 text-center">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للصفحة الرئيسية
          </Button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PlatformDocumentation;
