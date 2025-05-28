
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Award, Zap } from 'lucide-react';

interface PhysicsScientist {
  id: string;
  name: string;
  nameArabic: string;
  period: string;
  country: string;
  field: string;
  achievements: string[];
  description: string;
  image: string;
  famousFor: string;
  nobelPrize?: boolean;
}

const PhysicsScientists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScientist, setSelectedScientist] = useState<PhysicsScientist | null>(null);

  const scientists: PhysicsScientist[] = [
    {
      id: 'newton',
      name: 'Isaac Newton',
      nameArabic: 'إسحاق نيوتن',
      period: '1643-1727 م',
      country: 'إنجلترا',
      field: 'الميكانيكا الكلاسيكية',
      achievements: ['قوانين الحركة الثلاثة', 'قانون الجاذبية العام', 'حساب التفاضل والتكامل'],
      description: 'عالم فيزياء ورياضيات إنجليزي، وضع أسس الفيزياء الكلاسيكية وطور حساب التفاضل والتكامل.',
      image: '🍎',
      famousFor: 'قوانين الحركة وقانون الجاذبية العام'
    },
    {
      id: 'einstein',
      name: 'Albert Einstein',
      nameArabic: 'ألبرت أينشتاين',
      period: '1879-1955 م',
      country: 'ألمانيا/أمريكا',
      field: 'النسبية والفيزياء الحديثة',
      achievements: ['النسبية الخاصة والعامة', 'E=mc²', 'التأثير الكهروضوئي'],
      description: 'عالم فيزياء نظرية، وضع نظريتي النسبية وغير فهمنا للمكان والزمان والجاذبية.',
      image: '🧠',
      famousFor: 'نظريات النسبية والمعادلة الشهيرة E=mc²',
      nobelPrize: true
    },
    {
      id: 'galileo',
      name: 'Galileo Galilei',
      nameArabic: 'جاليليو جاليلي',
      period: '1564-1642 م',
      country: 'إيطاليا',
      field: 'علم الفلك والميكانيكا',
      achievements: ['تطوير التلسكوب', 'اكتشاف أقمار المشتري', 'قوانين السقوط الحر'],
      description: 'عالم فلك وفيزياء إيطالي، يُعتبر أبو الفيزياء الحديثة والمنهج العلمي التجريبي.',
      image: '🔭',
      famousFor: 'أبو الفيزياء الحديثة والتلسكوب الفلكي'
    },
    {
      id: 'maxwell',
      name: 'James Clerk Maxwell',
      nameArabic: 'جيمس كلارك ماكسويل',
      period: '1831-1879 م',
      country: 'اسكتلندا',
      field: 'الكهرومغناطيسية',
      achievements: ['معادلات ماكسويل', 'نظرية الموجات الكهرومغناطيسية', 'توحيد الكهرباء والمغناطيسية'],
      description: 'عالم فيزياء اسكتلندي، وحد الكهرباء والمغناطيسية ووضع أسس نظرية الموجات الكهرومغناطيسية.',
      image: '⚡',
      famousFor: 'معادلات ماكسويل والكهرومغناطيسية'
    },
    {
      id: 'planck',
      name: 'Max Planck',
      nameArabic: 'ماكس بلانك',
      period: '1858-1947 م',
      country: 'ألمانيا',
      field: 'ميكانيكا الكم',
      achievements: ['ثابت بلانك', 'نظرية الكم', 'إشعاع الجسم الأسود'],
      description: 'عالم فيزياء ألماني، مؤسس نظرية الكم التي أحدثت ثورة في فهمنا للذرة والطاقة.',
      image: '🔬',
      famousFor: 'مؤسس نظرية الكم وثابت بلانك',
      nobelPrize: true
    },
    {
      id: 'bohr',
      name: 'Niels Bohr',
      nameArabic: 'نيلز بور',
      period: '1885-1962 م',
      country: 'الدنمارك',
      field: 'فيزياء الذرة',
      achievements: ['نموذج بور للذرة', 'مبدأ التكامل', 'تفسير كوبنهاغن'],
      description: 'عالم فيزياء دنماركي، طور نموذج الذرة وساهم في تأسيس ميكانيكا الكم.',
      image: '⚛️',
      famousFor: 'نموذج بور للذرة وتفسير ميكانيكا الكم',
      nobelPrize: true
    },
    {
      id: 'heisenberg',
      name: 'Werner Heisenberg',
      nameArabic: 'فيرنر هايزنبرغ',
      period: '1901-1976 م',
      country: 'ألمانيا',
      field: 'ميكانيكا الكم',
      achievements: ['مبدأ عدم اليقين', 'ميكانيكا المصفوفات', 'نظرية الكم'],
      description: 'عالم فيزياء ألماني، وضع مبدأ عدم اليقين وطور الصياغة الرياضية لميكانيكا الكم.',
      image: '❓',
      famousFor: 'مبدأ عدم اليقين في ميكانيكا الكم',
      nobelPrize: true
    },
    {
      id: 'faraday',
      name: 'Michael Faraday',
      nameArabic: 'مايكل فاراداي',
      period: '1791-1867 م',
      country: 'إنجلترا',
      field: 'الكهرومغناطيسية',
      achievements: ['قوانين فاراداي', 'الحث الكهرومغناطيسي', 'المولد الكهربائي'],
      description: 'عالم كيمياء وفيزياء إنجليزي، اكتشف الحث الكهرومغناطيسي وأسس الكهروكيمياء.',
      image: '🔋',
      famousFor: 'قوانين فاراداي والحث الكهرومغناطيسي'
    },
    {
      id: 'curie',
      name: 'Marie & Pierre Curie',
      nameArabic: 'ماري وبيير كوري',
      period: '1867-1934 م / 1859-1906 م',
      country: 'بولندا/فرنسا',
      field: 'النشاط الإشعاعي',
      achievements: ['اكتشاف الراديوم والبولونيوم', 'دراسة النشاط الإشعاعي', 'جوائز نوبل متعددة'],
      description: 'زوجان من علماء الفيزياء، رواد في دراسة النشاط الإشعاعي واكتشاف عناصر مشعة جديدة.',
      image: '☢️',
      famousFor: 'رواد النشاط الإشعاعي واكتشاف الراديوم',
      nobelPrize: true
    },
    {
      id: 'ibn-haytham',
      name: 'Ibn al-Haytham (Alhazen)',
      nameArabic: 'ابن الهيثم (أبو علي الحسن)',
      period: '965-1040 م',
      country: 'العراق',
      field: 'البصريات والمنهج العلمي',
      achievements: ['علم البصريات', 'المنهج العلمي التجريبي', 'الكاميرا المظلمة'],
      description: 'عالم رياضيات وفيزياء عربي، يُعتبر أبو البصريات الحديثة ومؤسس المنهج العلمي التجريبي.',
      image: '👁️',
      famousFor: 'أبو البصريات الحديثة والمنهج العلمي'
    },
    {
      id: 'tesla',
      name: 'Nikola Tesla',
      nameArabic: 'نيكولا تسلا',
      period: '1856-1943 م',
      country: 'صربيا/أمريكا',
      field: 'الكهربائية والمغناطيسية',
      achievements: ['التيار المتردد', 'المحرك الحثي', 'نقل الطاقة اللاسلكي'],
      description: 'مخترع ومهندس صربي-أمريكي، طور نظام التيار المتردد وأحدث ثورة في تقنيات الكهرباء.',
      image: '⚡',
      famousFor: 'التيار المتردد والاختراعات الكهربائية'
    },
    {
      id: 'feynman',
      name: 'Richard Feynman',
      nameArabic: 'ريتشارد فاينمان',
      period: '1918-1988 م',
      country: 'الولايات المتحدة',
      field: 'الديناميكا الكهربائية الكمية',
      achievements: ['مخططات فاينمان', 'الديناميكا الكهربائية الكمية', 'تعليم الفيزياء'],
      description: 'عالم فيزياء نظرية أمريكي، طور نظرية الديناميكا الكهربائية الكمية ومخططات فاينمان.',
      image: '📊',
      famousFor: 'مخططات فاينمان والديناميكا الكهربائية الكمية',
      nobelPrize: true
    },
    {
      id: 'hawking',
      name: 'Stephen Hawking',
      nameArabic: 'ستيفن هوكينغ',
      period: '1942-2018 م',
      country: 'إنجلترا',
      field: 'الفيزياء النظرية والكوزمولوجيا',
      achievements: ['إشعاع هوكينغ', 'نظرية الثقوب السوداء', 'تاريخ موجز للزمن'],
      description: 'عالم فيزياء نظرية إنجليزي، درس الثقوب السوداء والكوزمولوجيا وألف كتباً علمية شهيرة.',
      image: '🕳️',
      famousFor: 'إشعاع هوكينغ ونظريات الثقوب السوداء'
    },
    {
      id: 'schrodinger',
      name: 'Erwin Schrödinger',
      nameArabic: 'إرفين شرودنغر',
      period: '1887-1961 م',
      country: 'النمسا',
      field: 'ميكانيكا الكم',
      achievements: ['معادلة شرودنغر', 'قطة شرودنغر', 'ميكانيكا الموجات'],
      description: 'عالم فيزياء نمساوي، طور معادلة شرودنغر الأساسية في ميكانيكا الكم.',
      image: '🐱',
      famousFor: 'معادلة شرودنغر وقطة شرودنغر الشهيرة',
      nobelPrize: true
    },
    {
      id: 'ohm',
      name: 'Georg Ohm',
      nameArabic: 'جورج أوم',
      period: '1789-1854 م',
      country: 'ألمانيا',
      field: 'الكهربائية',
      achievements: ['قانون أوم', 'المقاومة الكهربائية', 'الدوائر الكهربائية'],
      description: 'عالم فيزياء ألماني، وضع قانون أوم الأساسي في الكهربائية الذي يربط الجهد والتيار والمقاومة.',
      image: 'Ω',
      famousFor: 'قانون أوم في الدوائر الكهربائية'
    }
  ];

  const filteredScientists = useMemo(() => {
    return scientists.filter(scientist =>
      scientist.nameArabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scientist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scientist.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scientist.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-glow-purple mb-4">أعلام الفيزياء عبر التاريخ</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          تعرف على أشهر علماء الفيزياء الذين كشفوا أسرار الكون وقوانين الطبيعة
        </p>
      </div>

      {/* شريط البحث */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="ابحث عن عالم فيزياء..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-purple-900/20 border-purple-500/30 text-white placeholder-purple-300/50 focus:border-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScientists.map((scientist, index) => (
          <motion.div
            key={scientist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedScientist(scientist)}
          >
            <Card className="cursor-pointer h-full bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:shadow-glow-sm shadow-purple-500/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3 relative">
                    {scientist.image}
                    {scientist.nobelPrize && (
                      <div className="absolute -top-2 -right-2 text-yellow-400 text-xl">🏆</div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{scientist.nameArabic}</h3>
                  <p className="text-purple-300 text-sm">{scientist.name}</p>
                </div>
                
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{scientist.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{scientist.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>{scientist.field}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <p className="text-purple-300 text-sm font-medium">اشتهر بـ:</p>
                  <p className="text-white/80 text-sm">{scientist.famousFor}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredScientists.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-white/70">جرب البحث بكلمات مفتاحية أخرى</p>
        </div>
      )}

      {/* نافذة التفاصيل */}
      {selectedScientist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScientist(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900/95 to-indigo-900/90 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-8xl mb-4 relative">
                {selectedScientist.image}
                {selectedScientist.nobelPrize && (
                  <div className="absolute -top-4 -right-4 text-yellow-400 text-3xl">🏆</div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedScientist.nameArabic}</h2>
              <p className="text-purple-300 text-lg">{selectedScientist.name}</p>
              {selectedScientist.nobelPrize && (
                <p className="text-yellow-400 text-sm mt-2">🏆 حائز على جائزة نوبل</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">الفترة الزمنية</p>
                  <p className="text-white">{selectedScientist.period}</p>
                </div>
                
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">البلد</p>
                  <p className="text-white">{selectedScientist.country}</p>
                </div>
                
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">التخصص</p>
                  <p className="text-white">{selectedScientist.field}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">نبذة عن العالم</h3>
                <p className="text-white/90 leading-relaxed">{selectedScientist.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">أهم الإنجازات</h3>
                <ul className="space-y-2">
                  {selectedScientist.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setSelectedScientist(null)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PhysicsScientists;
