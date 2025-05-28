
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Award } from 'lucide-react';

interface Mathematician {
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
}

const MathematiciansGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMathematician, setSelectedMathematician] = useState<Mathematician | null>(null);

  const mathematicians: Mathematician[] = [
    {
      id: 'euclid',
      name: 'Euclid',
      nameArabic: 'إقليدس',
      period: '300 ق.م',
      country: 'اليونان القديمة',
      field: 'الهندسة',
      achievements: ['عناصر إقليدس', 'الهندسة الإقليدية', 'نظريات الأعداد الأولية'],
      description: 'عالم رياضيات يوناني قديم، يُعرف بـ "أبو الهندسة". وضع الأسس الرياضية للهندسة في كتابه الشهير "العناصر".',
      image: '🏛️',
      famousFor: 'الهندسة الإقليدية وكتاب العناصر'
    },
    {
      id: 'pythagoras',
      name: 'Pythagoras',
      nameArabic: 'فيثاغورس',
      period: '570-495 ق.م',
      country: 'اليونان القديمة',
      field: 'الهندسة والفلسفة',
      achievements: ['نظرية فيثاغورس', 'المدرسة الفيثاغورية', 'فلسفة الأعداد'],
      description: 'فيلسوف وعالم رياضيات يوناني، اشتهر بنظريته الشهيرة في الهندسة والتي تحمل اسمه.',
      image: '📐',
      famousFor: 'نظرية فيثاغورس في المثلث القائم الزاوية'
    },
    {
      id: 'al-khwarizmi',
      name: 'Al-Khwarizmi',
      nameArabic: 'محمد بن موسى الخوارزمي',
      period: '780-850 م',
      country: 'بغداد، العراق',
      field: 'الجبر والخوارزميات',
      achievements: ['كتاب الجبر والمقابلة', 'الخوارزميات', 'علم الحساب'],
      description: 'عالم رياضيات وفلك عربي، يُعتبر أبو علم الجبر ومؤسس علم الخوارزميات. له إسهامات عظيمة في الرياضيات والفلك.',
      image: '📚',
      famousFor: 'أبو الجبر ومؤسس علم الخوارزميات'
    },
    {
      id: 'omar-khayyam',
      name: 'Omar Khayyam',
      nameArabic: 'عمر الخيام',
      period: '1048-1131 م',
      country: 'نيسابور، إيران',
      field: 'الجبر والهندسة',
      achievements: ['حل المعادلات التكعيبية', 'الهندسة التحليلية', 'إصلاح التقويم'],
      description: 'عالم رياضيات وفلك وشاعر فارسي، اشتهر بحل المعادلات التكعيبية وإسهاماته في الهندسة.',
      image: '🌟',
      famousFor: 'حل المعادلات التكعيبية والشعر'
    },
    {
      id: 'fibonacci',
      name: 'Leonardo Fibonacci',
      nameArabic: 'ليوناردو فيبوناتشي',
      period: '1170-1250 م',
      country: 'إيطاليا',
      field: 'نظرية الأعداد',
      achievements: ['متتالية فيبوناتشي', 'نشر الأرقام العربية في أوروبا', 'كتاب ليبر أباتشي'],
      description: 'عالم رياضيات إيطالي، اشتهر بمتتالية فيبوناتشي ونشر نظام الأرقام العربية في أوروبا.',
      image: '🔢',
      famousFor: 'متتالية فيبوناتشي ونشر الأرقام العربية'
    },
    {
      id: 'newton',
      name: 'Isaac Newton',
      nameArabic: 'إسحاق نيوتن',
      period: '1643-1727 م',
      country: 'إنجلترا',
      field: 'حساب التفاضل والتكامل',
      achievements: ['حساب التفاضل والتكامل', 'قوانين الحركة', 'قانون الجاذبية'],
      description: 'عالم فيزياء ورياضيات إنجليزي، طور حساب التفاضل والتكامل ووضع قوانين الحركة والجاذبية.',
      image: '🍎',
      famousFor: 'حساب التفاضل والتكامل وقوانين الفيزياء'
    },
    {
      id: 'euler',
      name: 'Leonhard Euler',
      nameArabic: 'ليونهارد أويلر',
      period: '1707-1783 م',
      country: 'سويسرا',
      field: 'التحليل الرياضي',
      achievements: ['ثابت أويلر e', 'نظرية أويلر', 'الدوال الرياضية'],
      description: 'عالم رياضيات سويسري، من أعظم الرياضيين في التاريخ. له إسهامات في جميع مجالات الرياضيات.',
      image: '⚡',
      famousFor: 'ثابت أويلر ونظرياته في التحليل الرياضي'
    },
    {
      id: 'gauss',
      name: 'Carl Friedrich Gauss',
      nameArabic: 'كارل فريدريش غاوس',
      period: '1777-1855 م',
      country: 'ألمانيا',
      field: 'نظرية الأعداد',
      achievements: ['نظرية الأعداد', 'الهندسة اللاإقليدية', 'طريقة المربعات الصغرى'],
      description: 'عالم رياضيات ألماني، يُلقب بـ "أمير الرياضيات". له إسهامات أساسية في نظرية الأعداد والإحصاء.',
      image: '👑',
      famousFor: 'أمير الرياضيات ونظرية الأعداد'
    },
    {
      id: 'riemann',
      name: 'Bernhard Riemann',
      nameArabic: 'برنارد ريمان',
      period: '1826-1866 م',
      country: 'ألمانيا',
      field: 'التحليل المعقد',
      achievements: ['هندسة ريمان', 'فرضية ريمان', 'التحليل المعقد'],
      description: 'عالم رياضيات ألماني، طور هندسة ريمان التي أصبحت أساس نظرية النسبية العامة لأينشتاين.',
      image: '🌀',
      famousFor: 'هندسة ريمان وفرضية ريمان الشهيرة'
    },
    {
      id: 'cantor',
      name: 'Georg Cantor',
      nameArabic: 'جورج كانتور',
      period: '1845-1918 م',
      country: 'ألمانيا',
      field: 'نظرية المجموعات',
      achievements: ['نظرية المجموعات', 'مفهوم اللانهاية', 'الأعداد الترتيبية'],
      description: 'عالم رياضيات ألماني، مؤسس نظرية المجموعات الحديثة ومطور مفهوم اللانهاية الرياضي.',
      image: '∞',
      famousFor: 'نظرية المجموعات ومفهوم اللانهاية'
    },
    {
      id: 'noether',
      name: 'Emmy Noether',
      nameArabic: 'إيمي نويتر',
      period: '1882-1935 م',
      country: 'ألمانيا',
      field: 'الجبر المجرد',
      achievements: ['نظرية نويتر', 'الجبر المجرد', 'نظرية الحلقات'],
      description: 'عالمة رياضيات ألمانية، تعتبر من أعظم النساء في تاريخ الرياضيات. أسست أسس الجبر المجرد الحديث.',
      image: '💎',
      famousFor: 'أعظم النساء في الرياضيات والجبر المجرد'
    },
    {
      id: 'ramanujan',
      name: 'Srinivasa Ramanujan',
      nameArabic: 'سرينيفاسا راماناوجان',
      period: '1887-1920 م',
      country: 'الهند',
      field: 'نظرية الأعداد',
      achievements: ['ثوابت راماناوجان', 'المتسلسلات اللانهائية', 'الدوال المولدة'],
      description: 'عالم رياضيات هندي عبقري، اكتشف آلاف النظريات الرياضية دون تعليم رسمي في الرياضيات المتقدمة.',
      image: '🎯',
      famousFor: 'العبقري الرياضي الهندي ونظريات الأعداد'
    },
    {
      id: 'turing',
      name: 'Alan Turing',
      nameArabic: 'آلان تورينغ',
      period: '1912-1954 م',
      country: 'إنجلترا',
      field: 'علوم الحاسوب',
      achievements: ['آلة تورينغ', 'اختبار تورينغ', 'كسر شيفرة إنيجما'],
      description: 'عالم رياضيات وحاسوب إنجليزي، يُعتبر أبو علوم الحاسوب والذكاء الاصطناعي.',
      image: '🤖',
      famousFor: 'أبو علوم الحاسوب والذكاء الاصطناعي'
    },
    {
      id: 'nash',
      name: 'John Nash',
      nameArabic: 'جون ناش',
      period: '1928-2015 م',
      country: 'الولايات المتحدة',
      field: 'نظرية الألعاب',
      achievements: ['توازن ناش', 'نظرية الألعاب', 'الهندسة التفاضلية'],
      description: 'عالم رياضيات أمريكي، حائز على جائزة نوبل في الاقتصاد لعمله في نظرية الألعاب.',
      image: '🎲',
      famousFor: 'توازن ناش في نظرية الألعاب'
    },
    {
      id: 'al-biruni',
      name: 'Al-Biruni',
      nameArabic: 'أبو الريحان البيروني',
      period: '973-1048 م',
      country: 'خوارزم، أوزبكستان',
      field: 'علم المثلثات',
      achievements: ['علم المثلثات الكروية', 'حساب محيط الأرض', 'القانون المسعودي'],
      description: 'عالم رياضيات وفلك عربي، له إسهامات مهمة في علم المثلثات وحساب محيط الأرض.',
      image: '🌍',
      famousFor: 'علم المثلثات الكروية وحساب محيط الأرض'
    }
  ];

  const filteredMathematicians = useMemo(() => {
    return mathematicians.filter(mathematician =>
      mathematician.nameArabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mathematician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mathematician.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mathematician.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-glow-purple mb-4">أعلام الرياضيات عبر التاريخ</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          تعرف على أشهر علماء الرياضيات الذين ساهموا في تطوير هذا العلم عبر العصور
        </p>
      </div>

      {/* شريط البحث */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="ابحث عن عالم رياضيات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-purple-900/20 border-purple-500/30 text-white placeholder-purple-300/50 focus:border-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMathematicians.map((mathematician, index) => (
          <motion.div
            key={mathematician.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedMathematician(mathematician)}
          >
            <Card className="cursor-pointer h-full bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:shadow-glow-sm shadow-purple-500/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{mathematician.image}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{mathematician.nameArabic}</h3>
                  <p className="text-purple-300 text-sm">{mathematician.name}</p>
                </div>
                
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{mathematician.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{mathematician.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>{mathematician.field}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <p className="text-purple-300 text-sm font-medium">اشتهر بـ:</p>
                  <p className="text-white/80 text-sm">{mathematician.famousFor}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMathematicians.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-white/70">جرب البحث بكلمات مفتاحية أخرى</p>
        </div>
      )}

      {/* نافذة التفاصيل */}
      {selectedMathematician && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMathematician(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900/95 to-blue-900/90 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">{selectedMathematician.image}</div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedMathematician.nameArabic}</h2>
              <p className="text-purple-300 text-lg">{selectedMathematician.name}</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">الفترة الزمنية</p>
                  <p className="text-white">{selectedMathematician.period}</p>
                </div>
                
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">البلد</p>
                  <p className="text-white">{selectedMathematician.country}</p>
                </div>
                
                <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                  <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">التخصص</p>
                  <p className="text-white">{selectedMathematician.field}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">نبذة عن العالم</h3>
                <p className="text-white/90 leading-relaxed">{selectedMathematician.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">أهم الإنجازات</h3>
                <ul className="space-y-2">
                  {selectedMathematician.achievements.map((achievement, index) => (
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
                onClick={() => setSelectedMathematician(null)}
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

export default MathematiciansGallery;
