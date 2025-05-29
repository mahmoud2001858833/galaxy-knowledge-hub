import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Brain, Activity, X, BookOpen, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Disease {
  id: string;
  name: string;
  englishName: string;
  category: string;
  severity: 'منخفض' | 'متوسط' | 'مرتفع' | 'خطير';
  prevalence: string;
  symptoms: string[];
  causes: string[];
  diagnosis: string[];
  treatment: string[];
  prevention: string[];
  description: string;
  affectedAge: string;
  icon: string;
}

const DiseasesEncyclopedia = () => {
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'جميع الأمراض', icon: '🏥', color: 'from-blue-500/20 to-cyan-500/30' },
    { id: 'nervous', name: 'الجهاز العصبي', icon: '🧠', color: 'from-purple-500/20 to-pink-500/30' },
    { id: 'cardiovascular', name: 'القلب والأوعية', icon: '❤️', color: 'from-red-500/20 to-rose-500/30' },
    { id: 'respiratory', name: 'الجهاز التنفسي', icon: '🫁', color: 'from-blue-500/20 to-sky-500/30' },
    { id: 'digestive', name: 'الجهاز الهضمي', icon: '🍔', color: 'from-orange-500/20 to-amber-500/30' },
    { id: 'genetic', name: 'أمراض وراثية', icon: '🧬', color: 'from-green-500/20 to-emerald-500/30' },
    { id: 'infectious', name: 'أمراض معدية', icon: '🦠', color: 'from-yellow-500/20 to-lime-500/30' },
    { id: 'chronic', name: 'أمراض مزمنة', icon: '⚕️', color: 'from-indigo-500/20 to-violet-500/30' },
  ];

  const diseases: Disease[] = [
    // أمراض الجهاز العصبي
    {
      id: 'alzheimer',
      name: 'الزهايمر',
      englishName: 'Alzheimer\'s Disease',
      category: 'nervous',
      severity: 'خطير',
      prevalence: '6% من كبار السن',
      symptoms: ['فقدان الذاكرة', 'صعوبة في التفكير', 'تغيرات في الشخصية', 'صعوبة في الكلام'],
      causes: ['العوامل الوراثية', 'تقدم العمر', 'تراكم البروتينات في الدماغ'],
      diagnosis: ['اختبارات الذاكرة', 'التصوير بالرنين المغناطيسي', 'فحص السائل النخاعي'],
      treatment: ['أدوية مثبطات الكولينستيراز', 'العلاج النفسي', 'النشاط البدني'],
      prevention: ['التمرين المنتظم', 'التحفيز الذهني', 'النظام الغذائي الصحي'],
      description: 'مرض تنكسي في الدماغ يؤثر على الذاكرة والتفكير والسلوك',
      affectedAge: 'فوق 65 سنة',
      icon: '🧠'
    },
    {
      id: 'parkinson',
      name: 'الشلل الرعاش (باركنسون)',
      englishName: 'Parkinson\'s Disease',
      category: 'nervous',
      severity: 'مرتفع',
      prevalence: '1% من كبار السن',
      symptoms: ['رعشة في اليدين', 'بطء في الحركة', 'تصلب العضلات', 'عدم التوازن'],
      causes: ['نقص الدوبامين', 'العوامل الوراثية', 'التعرض للسموم'],
      diagnosis: ['الفحص السريري', 'استجابة للأدوية', 'التصوير الطبي'],
      treatment: ['أدوية الدوبامين', 'العلاج الطبيعي', 'التحفيز العميق للدماغ'],
      prevention: ['التمرين المنتظم', 'تجنب التعرض للسموم', 'النظام الغذائي الصحي'],
      description: 'اضطراب تنكسي في الجهاز العصبي يؤثر على الحركة',
      affectedAge: 'فوق 60 سنة',
      icon: '🧠'
    },
    {
      id: 'epilepsy',
      name: 'الصرع',
      englishName: 'Epilepsy',
      category: 'nervous',
      severity: 'متوسط',
      prevalence: '1% من السكان',
      symptoms: ['نوبات تشنجية', 'فقدان الوعي', 'حركات لا إرادية', 'تشويش ذهني'],
      causes: ['إصابات الدماغ', 'العوامل الوراثية', 'العدوى', 'أورام الدماغ'],
      diagnosis: ['رسم المخ الكهربائي', 'التصوير بالرنين المغناطيسي', 'اختبارات الدم'],
      treatment: ['أدوية مضادة للتشنج', 'الجراحة', 'النظام الغذائي الكيتوني'],
      prevention: ['تجنب إصابات الرأس', 'علاج العدوى', 'النوم الكافي'],
      description: 'اضطراب عصبي يسبب نوبات متكررة بسبب النشاط الكهربائي غير الطبيعي في الدماغ',
      affectedAge: 'جميع الأعمار',
      icon: '🧠'
    },
    
    // أمراض القلب والأوعية الدموية
    {
      id: 'hypertension',
      name: 'ارتفاع ضغط الدم',
      englishName: 'Hypertension',
      category: 'cardiovascular',
      severity: 'متوسط',
      prevalence: '30% من البالغين',
      symptoms: ['صداع', 'دوخة', 'ضيق في التنفس', 'ألم في الصدر'],
      causes: ['السمنة', 'الملح الزائد', 'قلة النشاط', 'التدخين', 'التوتر'],
      diagnosis: ['قياس ضغط الدم', 'فحوصات الدم', 'رسم القلب'],
      treatment: ['أدوية خافضة للضغط', 'تغيير نمط الحياة', 'تقليل الملح'],
      prevention: ['النظام الغذائي الصحي', 'التمرين المنتظم', 'تجنب التدخين'],
      description: 'حالة مزمنة حيث يكون ضغط الدم في الشرايين مرتفعاً باستمرار',
      affectedAge: 'فوق 40 سنة',
      icon: '❤️'
    },
    {
      id: 'heart_attack',
      name: 'احتشاء عضلة القلب',
      englishName: 'Myocardial Infarction',
      category: 'cardiovascular',
      severity: 'خطير',
      prevalence: '2% من البالغين',
      symptoms: ['ألم شديد في الصدر', 'ضيق في التنفس', 'غثيان', 'تعرق', 'ألم في الذراع'],
      causes: ['انسداد الشرايين التاجية', 'تصلب الشرايين', 'جلطات الدم'],
      diagnosis: ['رسم القلب', 'تحاليل الإنزيمات', 'القسطرة القلبية'],
      treatment: ['إذابة الجلطة', 'القسطرة العلاجية', 'جراحة المجازة'],
      prevention: ['النظام الغذائي الصحي', 'التمرين', 'تجنب التدخين', 'السيطرة على الضغط'],
      description: 'انقطاع تدفق الدم إلى جزء من عضلة القلب مما يسبب موت الأنسجة',
      affectedAge: 'فوق 45 سنة',
      icon: '❤️'
    },

    // أمراض الجهاز التنفسي
    {
      id: 'asthma',
      name: 'الربو',
      englishName: 'Asthma',
      category: 'respiratory',
      severity: 'متوسط',
      prevalence: '8% من السكان',
      symptoms: ['ضيق في التنفس', 'صفير في الصدر', 'سعال', 'ضيق في الصدر'],
      causes: ['الحساسية', 'العوامل البيئية', 'العوامل الوراثية', 'التلوث'],
      diagnosis: ['اختبار وظائف الرئة', 'اختبار الحساسية', 'الفحص السريري'],
      treatment: ['موسعات القصبات', 'الكورتيزون', 'مضادات الحساسية'],
      prevention: ['تجنب المحفزات', 'تنظيف المنزل', 'تجنب التدخين'],
      description: 'مرض مزمن يصيب الشعب الهوائية ويسبب التهاباً وضيقاً',
      affectedAge: 'جميع الأعمار',
      icon: '🫁'
    },
    {
      id: 'pneumonia',
      name: 'الالتهاب الرئوي',
      englishName: 'Pneumonia',
      category: 'respiratory',
      severity: 'مرتفع',
      prevalence: '5% سنوياً',
      symptoms: ['حمى', 'سعال مع بلغم', 'ضيق في التنفس', 'ألم في الصدر'],
      causes: ['البكتيريا', 'الفيروسات', 'الفطريات', 'ضعف المناعة'],
      diagnosis: ['أشعة الصدر', 'تحليل البلغم', 'فحوصات الدم'],
      treatment: ['المضادات الحيوية', 'مضادات الفيروسات', 'الأكسجين'],
      prevention: ['اللقاحات', 'غسل اليدين', 'تجنب المدخنين'],
      description: 'التهاب في أنسجة الرئة يسبب تجمع السوائل في الحويصلات الهوائية',
      affectedAge: 'جميع الأعمار',
      icon: '🫁'
    },

    // أمراض الجهاز الهضمي
    {
      id: 'peptic_ulcer',
      name: 'القرحة الهضمية',
      englishName: 'Peptic Ulcer',
      category: 'digestive',
      severity: 'متوسط',
      prevalence: '10% من السكان',
      symptoms: ['ألم في المعدة', 'حرقة', 'غثيان', 'انتفاخ', 'فقدان الشهية'],
      causes: ['بكتيريا الملوية البوابية', 'مضادات الالتهاب', 'التوتر', 'التدخين'],
      diagnosis: ['منظار المعدة', 'أشعة الباريوم', 'اختبار البكتيريا'],
      treatment: ['المضادات الحيوية', 'مثبطات الحمض', 'مضادات الحموضة'],
      prevention: ['تجنب مضادات الالتهاب', 'علاج البكتيريا', 'تجنب التدخين'],
      description: 'تقرحات في بطانة المعدة أو الاثني عشر بسبب الحمض والإنزيمات',
      affectedAge: 'فوق 30 سنة',
      icon: '🍔'
    },
    {
      id: 'ibs',
      name: 'متلازمة القولون العصبي',
      englishName: 'Irritable Bowel Syndrome',
      category: 'digestive',
      severity: 'منخفض',
      prevalence: '15% من السكان',
      symptoms: ['ألم البطن', 'انتفاخ', 'إسهال أو إمساك', 'غازات'],
      causes: ['التوتر', 'اضطراب الأعصاب', 'الطعام', 'الهرمونات'],
      diagnosis: ['الأعراض السريرية', 'استبعاد الأمراض الأخرى', 'الفحوصات'],
      treatment: ['تغيير النظام الغذائي', 'أدوية التشنج', 'مضادات الإسهال'],
      prevention: ['إدارة التوتر', 'النظام الغذائي الصحي', 'التمرين المنتظم'],
      description: 'اضطراب وظيفي في الأمعاء يسبب أعراضاً مزعجة دون التهاب',
      affectedAge: '20-40 سنة',
      icon: '🍔'
    },

    // أمراض وراثية
    {
      id: 'sickle_cell',
      name: 'فقر الدم المنجلي',
      englishName: 'Sickle Cell Disease',
      category: 'genetic',
      severity: 'مرتفع',
      prevalence: '0.1% عالمياً',
      symptoms: ['أزمات ألم', 'فقر دم', 'تورم اليدين والقدمين', 'عدوى متكررة'],
      causes: ['طفرة وراثية في الهيموجلوبين', 'وراثة من كلا الوالدين'],
      diagnosis: ['فحص الهيموجلوبين', 'الفحص الوراثي', 'تحليل الدم'],
      treatment: ['مسكنات الألم', 'نقل الدم', 'المضادات الحيوية', 'زراعة النخاع'],
      prevention: ['الاستشارة الوراثية', 'الفحص قبل الزواج'],
      description: 'مرض وراثي يجعل خلايا الدم الحمراء تأخذ شكل المنجل',
      affectedAge: 'منذ الولادة',
      icon: '🧬'
    },
    {
      id: 'cystic_fibrosis',
      name: 'التليف الكيسي',
      englishName: 'Cystic Fibrosis',
      category: 'genetic',
      severity: 'خطير',
      prevalence: '1 من 3000',
      symptoms: ['سعال مزمن', 'عدوى رئوية', 'مشاكل هضمية', 'نمو بطيء'],
      causes: ['طفرة في جين CFTR', 'وراثة متنحية'],
      diagnosis: ['اختبار العرق', 'الفحص الوراثي', 'اختبار حديثي الولادة'],
      treatment: ['العلاج التنفسي', 'إنزيمات الهضم', 'المضادات الحيوية'],
      prevention: ['الاستشارة الوراثية', 'الفحص قبل الزواج'],
      description: 'مرض وراثي يؤثر على الرئتين والجهاز الهضمي',
      affectedAge: 'منذ الولادة',
      icon: '🧬'
    },

    // أمراض معدية
    {
      id: 'covid19',
      name: 'كوفيد-19',
      englishName: 'COVID-19',
      category: 'infectious',
      severity: 'متوسط',
      prevalence: 'جائحة عالمية',
      symptoms: ['حمى', 'سعال جاف', 'تعب', 'فقدان الشم والتذوق', 'ضيق التنفس'],
      causes: ['فيروس كورونا المستجد', 'انتقال عبر الرذاذ', 'الاتصال المباشر'],
      diagnosis: ['فحص PCR', 'فحص الأنتيجين السريع', 'أشعة الصدر'],
      treatment: ['الراحة', 'السوائل', 'مضادات الفيروسات', 'الأكسجين'],
      prevention: ['اللقاحات', 'الكمامات', 'التباعد الاجتماعي', 'غسل اليدين'],
      description: 'مرض معدٍ يسببه فيروس كورونا ويؤثر على الجهاز التنفسي',
      affectedAge: 'جميع الأعمار',
      icon: '🦠'
    },
    {
      id: 'tuberculosis',
      name: 'السل الرئوي',
      englishName: 'Tuberculosis',
      category: 'infectious',
      severity: 'مرتفع',
      prevalence: '10 مليون حالة سنوياً',
      symptoms: ['سعال مزمن', 'بلغم دموي', 'حمى ليلية', 'فقدان الوزن', 'تعرق ليلي'],
      causes: ['بكتيريا السل', 'انتقال عبر الهواء', 'ضعف المناعة'],
      diagnosis: ['أشعة الصدر', 'فحص البلغم', 'اختبار الجلد'],
      treatment: ['مضادات حيوية متعددة', 'علاج طويل المدى', 'المتابعة الطبية'],
      prevention: ['لقاح BCG', 'تجنب المخالطة', 'تحسين التهوية'],
      description: 'مرض معدٍ بكتيري يصيب الرئتين بشكل أساسي',
      affectedAge: 'جميع الأعمار',
      icon: '🦠'
    },

    // أمراض مزمنة
    {
      id: 'diabetes_type2',
      name: 'السكري النوع الثاني',
      englishName: 'Type 2 Diabetes',
      category: 'chronic',
      severity: 'متوسط',
      prevalence: '9% من البالغين',
      symptoms: ['عطش شديد', 'كثرة التبول', 'تعب', 'عدم وضوح الرؤية', 'بطء الشفاء'],
      causes: ['مقاومة الأنسولين', 'السمنة', 'قلة النشاط', 'العوامل الوراثية'],
      diagnosis: ['فحص السكر الصيامي', 'فحص السكر التراكمي', 'اختبار تحمل الجلوكوز'],
      treatment: ['أدوية السكري', 'الأنسولين', 'تغيير النظام الغذائي', 'التمرين'],
      prevention: ['النظام الغذائي الصحي', 'التمرين المنتظم', 'الحفاظ على الوزن'],
      description: 'مرض مزمن يؤثر على طريقة استخدام الجسم للسكر',
      affectedAge: 'فوق 40 سنة',
      icon: '⚕️'
    },
    {
      id: 'obesity',
      name: 'السمنة',
      englishName: 'Obesity',
      category: 'chronic',
      severity: 'متوسط',
      prevalence: '25% من البالغين',
      symptoms: ['زيادة الوزن', 'صعوبة التنفس', 'تعب', 'ألم المفاصل', 'اضطراب النوم'],
      causes: ['فرط تناول الطعام', 'قلة النشاط', 'العوامل الوراثية', 'اضطرابات الهرمونات'],
      diagnosis: ['حساب مؤشر كتلة الجسم', 'قياس محيط الخصر', 'فحوصات الدم'],
      treatment: ['النظام الغذائي', 'التمرين', 'الأدوية', 'جراحة السمنة'],
      prevention: ['النظام الغذائي الصحي', 'التمرين المنتظم', 'تجنب الوجبات السريعة'],
      description: 'تراكم مفرط للدهون في الجسم يؤثر على الصحة',
      affectedAge: 'جميع الأعمار',
      icon: '⚕️'
    }
  ];

  const filteredDiseases = useMemo(() => {
    return diseases.filter(disease => {
      const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           disease.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           disease.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || disease.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'منخفض': return 'bg-green-500/20 text-green-300';
      case 'متوسط': return 'bg-yellow-500/20 text-yellow-300';
      case 'مرتفع': return 'bg-orange-500/20 text-orange-300';
      case 'خطير': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const openDiseaseModal = (disease: Disease) => {
    setSelectedDisease(disease);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" dir={dir}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500">
          🏥 موسوعة الأمراض الطبية
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          دليلك الشامل لفهم الأمراض، أعراضها، أسبابها، وطرق علاجها والوقاية منها
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن مرض أو عرض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-4 text-lg bg-green-900/30 border-green-500/30 text-white placeholder-white/50 rounded-xl focus:border-green-400"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-green-900/30 border-green-500/30 text-white hover:bg-green-800/40'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/30 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{diseases.length}</h3>
            <p className="text-white/70">مرض في الموسوعة</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/30 border-green-500/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{filteredDiseases.length}</h3>
            <p className="text-white/70">نتيجة البحث</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/30 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">8</h3>
            <p className="text-white/70">فئة طبية</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/20 to-rose-500/30 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">
              {diseases.filter(d => d.severity === 'خطير').length}
            </h3>
            <p className="text-white/70">مرض خطير</p>
          </CardContent>
        </Card>
      </div>

      {/* Diseases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiseases.map((disease) => (
          <Card 
            key={disease.id}
            className="cursor-pointer overflow-hidden bg-gradient-to-br from-green-900/40 to-emerald-900/60 border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-glow-green"
            onClick={() => openDiseaseModal(disease)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{disease.icon}</div>
                <Badge className={`text-xs ${getSeverityColor(disease.severity)}`}>
                  {disease.severity}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{disease.name}</h3>
              <p className="text-green-300 text-sm mb-3">{disease.englishName}</p>
              <p className="text-white/70 text-sm mb-4 line-clamp-3">{disease.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-white/60">
                  <Users className="w-4 h-4 ml-2" />
                  <span>انتشار: {disease.prevalence}</span>
                </div>
                <div className="flex items-center text-sm text-white/60">
                  <AlertTriangle className="w-4 h-4 ml-2" />
                  <span>العمر المتأثر: {disease.affectedAge}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/30">
                <span className="text-green-400 text-sm flex items-center">
                  اقرأ المزيد
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disease Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-500/30">
          {selectedDisease && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{selectedDisease.icon}</span>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-white">
                        {selectedDisease.name}
                      </DialogTitle>
                      <p className="text-green-300">{selectedDisease.englishName}</p>
                    </div>
                  </div>
                  <Badge className={`${getSeverityColor(selectedDisease.severity)}`}>
                    {selectedDisease.severity}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div className="bg-green-800/30 rounded-lg p-4">
                  <p className="text-white/90">{selectedDisease.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-900/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 ml-2" />
                        الأعراض
                      </h4>
                      <ul className="space-y-2">
                        {selectedDisease.symptoms.map((symptom, index) => (
                          <li key={index} className="text-white/80 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full ml-2"></span>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-900/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center">
                        <Search className="w-5 h-5 ml-2" />
                        الأسباب
                      </h4>
                      <ul className="space-y-2">
                        {selectedDisease.causes.map((cause, index) => (
                          <li key={index} className="text-white/80 flex items-center">
                            <span className="w-2 h-2 bg-orange-400 rounded-full ml-2"></span>
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-900/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                        <Search className="w-5 h-5 ml-2" />
                        التشخيص
                      </h4>
                      <ul className="space-y-2">
                        {selectedDisease.diagnosis.map((diag, index) => (
                          <li key={index} className="text-white/80 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full ml-2"></span>
                            {diag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-900/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                        <Heart className="w-5 h-5 ml-2" />
                        العلاج
                      </h4>
                      <ul className="space-y-2">
                        {selectedDisease.treatment.map((treat, index) => (
                          <li key={index} className="text-white/80 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full ml-2"></span>
                            {treat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-900/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                        <Brain className="w-5 h-5 ml-2" />
                        الوقاية
                      </h4>
                      <ul className="space-y-2">
                        {selectedDisease.prevention.map((prev, index) => (
                          <li key={index} className="text-white/80 flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full ml-2"></span>
                            {prev}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-300 mb-3">معلومات إضافية</h4>
                      <div className="space-y-2 text-white/80">
                        <p><strong>نسبة الانتشار:</strong> {selectedDisease.prevalence}</p>
                        <p><strong>العمر المتأثر:</strong> {selectedDisease.affectedAge}</p>
                        <p><strong>مستوى الخطورة:</strong> {selectedDisease.severity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* No Results */}
      {filteredDiseases.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد نتائج</h3>
          <p className="text-white/70">جرب البحث بكلمات مفتاحية أخرى أو اختر فئة مختلفة</p>
        </div>
      )}
    </div>
  );
};

export default DiseasesEncyclopedia;
