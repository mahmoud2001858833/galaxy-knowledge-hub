
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Award, Microscope } from 'lucide-react';

interface BiologyScientist {
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

const BiologyScientists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScientist, setSelectedScientist] = useState<BiologyScientist | null>(null);

  const scientists: BiologyScientist[] = [
    {
      id: 'darwin',
      name: 'Charles Darwin',
      nameArabic: 'تشارلز داروين',
      period: '1809-1882 م',
      country: 'إنجلترا',
      field: 'نظرية التطور',
      achievements: ['نظرية التطور', 'الانتخاب الطبيعي', 'أصل الأنواع'],
      description: 'عالم طبيعة إنجليزي، وضع نظرية التطور بالانتخاب الطبيعي التي غيرت فهمنا لتطور الحياة على الأرض.',
      image: '🦎',
      famousFor: 'نظرية التطور والانتخاب الطبيعي'
    },
    {
      id: 'mendel',
      name: 'Gregor Mendel',
      nameArabic: 'جريجور مندل',
      period: '1822-1884 م',
      country: 'النمسا',
      field: 'علم الوراثة',
      achievements: ['قوانين مندل في الوراثة', 'أبو علم الوراثة', 'تجارب نبات البازلاء'],
      description: 'راهب وعالم نبات نمساوي، يُعتبر مؤسس علم الوراثة الحديث من خلال تجاربه على نبات البازلاء.',
      image: '🌱',
      famousFor: 'أبو علم الوراثة وقوانين الوراثة'
    },
    {
      id: 'pasteur',
      name: 'Louis Pasteur',
      nameArabic: 'لويس باستور',
      period: '1822-1895 م',
      country: 'فرنسا',
      field: 'علم الأحياء الدقيقة',
      achievements: ['نظرية الجراثيم', 'البسترة', 'لقاح داء الكلب'],
      description: 'عالم أحياء دقيقة فرنسي، أسس علم الأحياء الدقيقة الحديث ووضع نظرية الجراثيم للأمراض.',
      image: '🦠',
      famousFor: 'نظرية الجراثيم والبسترة'
    },
    {
      id: 'watson-crick',
      name: 'Watson & Crick',
      nameArabic: 'واتسون وكريك',
      period: '1953 م',
      country: 'إنجلترا/أمريكا',
      field: 'البيولوجيا الجزيئية',
      achievements: ['بنية الحمض النووي DNA', 'النموذج الحلزوني المزدوج', 'الشيفرة الوراثية'],
      description: 'عالما أحياء جزيئية، اكتشفا البنية الحلزونية المزدوجة للحمض النووي DNA.',
      image: '🧬',
      famousFor: 'اكتشاف بنية الحمض النووي DNA',
      nobelPrize: true
    },
    {
      id: 'linnaeus',
      name: 'Carl Linnaeus',
      nameArabic: 'كارل لينيوس',
      period: '1707-1778 م',
      country: 'السويد',
      field: 'التصنيف الحيوي',
      achievements: ['نظام التسمية الثنائية', 'تصنيف الكائنات الحية', 'علم التصنيف الحديث'],
      description: 'عالم نبات سويدي، وضع نظام التسمية الثنائية للكائنات الحية وأسس علم التصنيف الحديث.',
      image: '🌿',
      famousFor: 'نظام التسمية الثنائية وتصنيف الكائنات'
    },
    {
      id: 'fleming',
      name: 'Alexander Fleming',
      nameArabic: 'ألكسندر فليمنغ',
      period: '1881-1955 م',
      country: 'اسكتلندا',
      field: 'علم المضادات الحيوية',
      achievements: ['اكتشاف البنسلين', 'المضادات الحيوية', 'إنقاذ ملايين الأرواح'],
      description: 'عالم أحياء اسكتلندي، اكتشف البنسلين أول مضاد حيوي في التاريخ، مما أحدث ثورة في الطب.',
      image: '💊',
      famousFor: 'اكتشاف البنسلين والمضادات الحيوية',
      nobelPrize: true
    },
    {
      id: 'ibn-sina',
      name: 'Ibn Sina (Avicenna)',
      nameArabic: 'ابن سينا (أبو علي الحسين)',
      period: '980-1037 م',
      country: 'أوزبكستان/إيران',
      field: 'الطب وعلم النبات',
      achievements: ['القانون في الطب', 'علم الأدوية', 'التشريح والفسيولوجيا'],
      description: 'طبيب وفيلسوف عربي، ألف "القانون في الطب" الذي ظل مرجعاً طبياً في أوروبا لقرون.',
      image: '📜',
      famousFor: 'أبو الطب الحديث ومؤلف القانون في الطب'
    },
    {
      id: 'harvey',
      name: 'William Harvey',
      nameArabic: 'ويليام هارفي',
      period: '1578-1657 م',
      country: 'إنجلترا',
      field: 'علم وظائف الأعضاء',
      achievements: ['اكتشاف الدورة الدموية', 'وظائف القلب', 'علم وظائف الأعضاء'],
      description: 'طبيب إنجليزي، اكتشف الدورة الدموية ووظائف القلب، مما أحدث ثورة في فهم جسم الإنسان.',
      image: '❤️',
      famousFor: 'اكتشاف الدورة الدموية ووظائف القلب'
    },
    {
      id: 'leeuwenhoek',
      name: 'Antonie van Leeuwenhoek',
      nameArabic: 'أنطونيو فان ليفينهوك',
      period: '1632-1723 م',
      country: 'هولندا',
      field: 'علم الأحياء الدقيقة',
      achievements: ['أول من رأى البكتيريا', 'تطوير المجهر', 'اكتشاف الخلايا الحية'],
      description: 'عالم هولندي، أول من راقب ووصف البكتيريا والكائنات الدقيقة باستخدام مجاهره المحسنة.',
      image: '🔬',
      famousFor: 'أول من رأى البكتيريا واكتشف عالم الميكروبات'
    },
    {
      id: 'lamarck',
      name: 'Jean-Baptiste Lamarck',
      nameArabic: 'جان بابتيست لامارك',
      period: '1744-1829 م',
      country: 'فرنسا',
      field: 'نظرية التطور',
      achievements: ['نظرية وراثة الصفات المكتسبة', 'تصنيف اللافقاريات', 'مصطلح "بيولوجيا"'],
      description: 'عالم طبيعة فرنسي، وضع أول نظرية متماسكة للتطور وصاغ مصطلح "بيولوجيا".',
      image: '🔄',
      famousFor: 'نظرية وراثة الصفات المكتسبة ومصطلح البيولوجيا'
    },
    {
      id: 'wallace',
      name: 'Alfred Russel Wallace',
      nameArabic: 'ألفريد راسل والاس',
      period: '1823-1913 م',
      country: 'ويلز',
      field: 'نظرية التطور',
      achievements: ['الانتخاب الطبيعي المشترك مع داروين', 'علم الجغرافيا الحيوية', 'خط والاس'],
      description: 'عالم طبيعة ويلزي، طور نظرية الانتخاب الطبيعي بشكل مستقل عن داروين وأسس علم الجغرافيا الحيوية.',
      image: '🗺️',
      famousFor: 'الانتخاب الطبيعي وعلم الجغرافيا الحيوية'
    },
    {
      id: 'mcclintock',
      name: 'Barbara McClintock',
      nameArabic: 'باربرا مكلينتوك',
      period: '1902-1992 م',
      country: 'الولايات المتحدة',
      field: 'علم الوراثة الخلوية',
      achievements: ['الجينات القافزة', 'التنظيم الجيني', 'علم الوراثة الخلوية'],
      description: 'عالمة وراثة أمريكية، اكتشفت الجينات القافزة والتنظيم الجيني، حاصلة على نوبل.',
      image: '🧪',
      famousFor: 'اكتشاف الجينات القافزة والتنظيم الجيني',
      nobelPrize: true
    },
    {
      id: 'morgan',
      name: 'Thomas Hunt Morgan',
      nameArabic: 'توماس هانت مورغان',
      period: '1866-1945 م',
      country: 'الولايات المتحدة',
      field: 'علم الوراثة',
      achievements: ['نظرية الكروموسومات', 'تجارب ذبابة الفاكهة', 'الخرائط الجينية'],
      description: 'عالم وراثة أمريكي، أثبت أن الجينات موجودة في الكروموسومات من خلال تجاربه على ذبابة الفاكهة.',
      image: '🪰',
      famousFor: 'نظرية الكروموسومات وتجارب ذبابة الفاكهة',
      nobelPrize: true
    },
    {
      id: 'schleiden-schwann',
      name: 'Schleiden & Schwann',
      nameArabic: 'شلايدن وشوان',
      period: '1838-1839 م',
      country: 'ألمانيا',
      field: 'نظرية الخلية',
      achievements: ['نظرية الخلية', 'الخلية وحدة الحياة', 'علم الأنسجة'],
      description: 'عالما نبات وحيوان ألمانيان، وضعا نظرية الخلية التي تنص على أن الخلية هي وحدة الحياة الأساسية.',
      image: '🔬',
      famousFor: 'نظرية الخلية كوحدة أساسية للحياة'
    },
    {
      id: 'goodall',
      name: 'Jane Goodall',
      nameArabic: 'جين غودال',
      period: '1934-حتى الآن',
      country: 'إنجلترا',
      field: 'علم سلوك الحيوان',
      achievements: ['دراسة الشمبانزي', 'علم سلوك الحيوان', 'حماية البيئة'],
      description: 'عالمة سلوك حيوان إنجليزية، ثورت فهمنا للشمبانزي وسلوك الرئيسيات من خلال دراساتها الميدانية.',
      image: '🐵',
      famousFor: 'دراسة الشمبانزي وعلم سلوك الحيوان'
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
        <h2 className="text-3xl font-bold text-glow-green mb-4">أعلام علم الأحياء عبر التاريخ</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          تعرف على أشهر علماء الأحياء الذين كشفوا أسرار الحياة والكائنات الحية
        </p>
      </div>

      {/* شريط البحث */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="ابحث عن عالم أحياء..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-green-900/20 border-green-500/30 text-white placeholder-green-300/50 focus:border-green-400"
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
            <Card className="cursor-pointer h-full bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:shadow-glow-sm shadow-green-500/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3 relative">
                    {scientist.image}
                    {scientist.nobelPrize && (
                      <div className="absolute -top-2 -right-2 text-yellow-400 text-xl">🏆</div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{scientist.nameArabic}</h3>
                  <p className="text-green-300 text-sm">{scientist.name}</p>
                </div>
                
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span>{scientist.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span>{scientist.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Microscope className="w-4 h-4 text-green-400" />
                    <span>{scientist.field}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <p className="text-green-300 text-sm font-medium">اشتهر بـ:</p>
                  <p className="text-white/80 text-sm">{scientist.famousFor}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredScientists.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-green-400 mx-auto mb-4" />
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
            className="bg-gradient-to-br from-green-900/95 to-emerald-900/90 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-500/30"
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
              <p className="text-green-300 text-lg">{selectedScientist.name}</p>
              {selectedScientist.nobelPrize && (
                <p className="text-yellow-400 text-sm mt-2">🏆 حائز على جائزة نوبل</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-800/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">الفترة الزمنية</p>
                  <p className="text-white">{selectedScientist.period}</p>
                </div>
                
                <div className="bg-green-800/30 rounded-lg p-4 text-center">
                  <MapPin className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">البلد</p>
                  <p className="text-white">{selectedScientist.country}</p>
                </div>
                
                <div className="bg-green-800/30 rounded-lg p-4 text-center">
                  <Microscope className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">التخصص</p>
                  <p className="text-white">{selectedScientist.field}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-green-300 mb-3">نبذة عن العالم</h3>
                <p className="text-white/90 leading-relaxed">{selectedScientist.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-green-300 mb-3">أهم الإنجازات</h3>
                <ul className="space-y-2">
                  {selectedScientist.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setSelectedScientist(null)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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

export default BiologyScientists;
