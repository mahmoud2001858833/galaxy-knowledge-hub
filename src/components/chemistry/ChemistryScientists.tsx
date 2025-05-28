
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Award, Atom } from 'lucide-react';

interface ChemistryScientist {
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

const ChemistryScientists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScientist, setSelectedScientist] = useState<ChemistryScientist | null>(null);

  const scientists: ChemistryScientist[] = [
    {
      id: 'lavoisier',
      name: 'Antoine Lavoisier',
      nameArabic: 'أنطوان لافوازيه',
      period: '1743-1794 م',
      country: 'فرنسا',
      field: 'الكيمياء الحديثة',
      achievements: ['قانون حفظ الكتلة', 'اكتشاف الأكسجين', 'تسمية العناصر الكيميائية'],
      description: 'عالم كيمياء فرنسي، يُعتبر أبو الكيمياء الحديثة. وضع أسس الكيمياء العلمية وقانون حفظ الكتلة.',
      image: '⚗️',
      famousFor: 'أبو الكيمياء الحديثة وقانون حفظ الكتلة'
    },
    {
      id: 'mendeleev',
      name: 'Dmitri Mendeleev',
      nameArabic: 'دميتري مندليف',
      period: '1834-1907 م',
      country: 'روسيا',
      field: 'الجدول الدوري',
      achievements: ['الجدول الدوري للعناصر', 'التنبؤ بخصائص العناصر', 'قانون الدورية'],
      description: 'عالم كيمياء روسي، طور الجدول الدوري للعناصر وتنبأ بوجود عناصر لم تُكتشف بعد.',
      image: '🔬',
      famousFor: 'الجدول الدوري للعناصر الكيميائية'
    },
    {
      id: 'marie-curie',
      name: 'Marie Curie',
      nameArabic: 'ماري كوري',
      period: '1867-1934 م',
      country: 'بولندا/فرنسا',
      field: 'النشاط الإشعاعي',
      achievements: ['اكتشاف الراديوم والبولونيوم', 'دراسة النشاط الإشعاعي', 'أول امرأة تفوز بنوبل'],
      description: 'عالمة فيزياء وكيمياء، أول امرأة تفوز بجائزة نوبل وأول شخص يفوز بنوبل في مجالين مختلفين.',
      image: '☢️',
      famousFor: 'اكتشاف النشاط الإشعاعي والراديوم',
      nobelPrize: true
    },
    {
      id: 'dalton',
      name: 'John Dalton',
      nameArabic: 'جون دالتون',
      period: '1766-1844 م',
      country: 'إنجلترا',
      field: 'النظرية الذرية',
      achievements: ['النظرية الذرية الحديثة', 'قانون النسب المتضاعفة', 'عمى الألوان'],
      description: 'عالم كيمياء وفيزياء إنجليزي، وضع النظرية الذرية الحديثة وأسس علم الكيمياء الذرية.',
      image: '⚛️',
      famousFor: 'النظرية الذرية الحديثة'
    },
    {
      id: 'avogadro',
      name: 'Amedeo Avogadro',
      nameArabic: 'أماديو أفوجادرو',
      period: '1776-1856 م',
      country: 'إيطاليا',
      field: 'الكيمياء الجزيئية',
      achievements: ['قانون أفوجادرو', 'عدد أفوجادرو', 'مفهوم الجزيء'],
      description: 'عالم فيزياء وكيمياء إيطالي، صاغ قانون أفوجادرو وساهم في تطوير النظرية الجزيئية.',
      image: '🧪',
      famousFor: 'قانون أفوجادرو وعدد أفوجادرو'
    },
    {
      id: 'pasteur',
      name: 'Louis Pasteur',
      nameArabic: 'لويس باستور',
      period: '1822-1895 م',
      country: 'فرنسا',
      field: 'الكيمياء الحيوية',
      achievements: ['البسترة', 'نظرية الجراثيم', 'اللقاحات'],
      description: 'عالم كيمياء وأحياء دقيقة فرنسي، طور عملية البسترة وأسس علم الأحياء الدقيقة الحديث.',
      image: '🦠',
      famousFor: 'البسترة ونظرية الجراثيم'
    },
    {
      id: 'rutherford',
      name: 'Ernest Rutherford',
      nameArabic: 'إرنست رذرفورد',
      period: '1871-1937 م',
      country: 'نيوزيلندا/إنجلترا',
      field: 'الكيمياء النووية',
      achievements: ['نموذج الذرة النووي', 'اكتشاف النواة', 'أشعة ألفا وبيتا'],
      description: 'عالم فيزياء وكيمياء، يُعتبر أبو الفيزياء النووية. اكتشف نواة الذرة ووضع النموذج النووي للذرة.',
      image: '💥',
      famousFor: 'أبو الفيزياء النووية واكتشاف النواة',
      nobelPrize: true
    },
    {
      id: 'jabir',
      name: 'Jabir ibn Hayyan',
      nameArabic: 'جابر بن حيان',
      period: '721-815 م',
      country: 'العراق',
      field: 'الكيمياء التطبيقية',
      achievements: ['أبو الكيمياء', 'تطوير أدوات المختبر', 'عمليات التقطير'],
      description: 'عالم كيمياء عربي، يُعتبر أبو علم الكيمياء. طور العديد من العمليات الكيميائية والأدوات المخبرية.',
      image: '🏺',
      famousFor: 'أبو علم الكيمياء والتجارب المخبرية'
    },
    {
      id: 'linus-pauling',
      name: 'Linus Pauling',
      nameArabic: 'لاينوس بولينغ',
      period: '1901-1994 م',
      country: 'الولايات المتحدة',
      field: 'الكيمياء الكمية',
      achievements: ['نظرية الروابط الكيميائية', 'بنية البروتين', 'فيتامين C'],
      description: 'عالم كيمياء أمريكي، الوحيد الذي فاز بجائزتي نوبل منفرداً في مجالين مختلفين.',
      image: '🧬',
      famousFor: 'نظرية الروابط الكيميائية وجائزتا نوبل',
      nobelPrize: true
    },
    {
      id: 'boyle',
      name: 'Robert Boyle',
      nameArabic: 'روبرت بويل',
      period: '1627-1691 م',
      country: 'أيرلندا',
      field: 'قوانين الغازات',
      achievements: ['قانون بويل', 'المنهج العلمي في الكيمياء', 'تعريف العنصر'],
      description: 'عالم كيمياء أيرلندي، وضع قانون بويل للغازات وساهم في تأسيس الكيمياء الحديثة.',
      image: '💨',
      famousFor: 'قانون بويل للغازات'
    },
    {
      id: 'arrhenius',
      name: 'Svante Arrhenius',
      nameArabic: 'سفانتي أرهينيوس',
      period: '1859-1927 م',
      country: 'السويد',
      field: 'الكيمياء الفيزيائية',
      achievements: ['نظرية التأين', 'معادلة أرهينيوس', 'الاحتباس الحراري'],
      description: 'عالم كيمياء سويدي، طور نظرية التأين ودرس تأثير غازات الدفيئة على المناخ.',
      image: '🌡️',
      famousFor: 'نظرية التأين ومعادلة أرهينيوس',
      nobelPrize: true
    },
    {
      id: 'lewis',
      name: 'Gilbert Lewis',
      nameArabic: 'جيلبرت لويس',
      period: '1875-1946 م',
      country: 'الولايات المتحدة',
      field: 'الروابط الكيميائية',
      achievements: ['نظرية لويس للأحماض والقواعد', 'رموز لويس', 'الروابط التساهمية'],
      description: 'عالم كيمياء أمريكي، طور نظرية الروابط الكيميائية ورموز لويس للتركيب الجزيئي.',
      image: '🔗',
      famousFor: 'نظرية لويس ورموز التركيب الجزيئي'
    },
    {
      id: 'al-razi',
      name: 'Al-Razi',
      nameArabic: 'أبو بكر الرازي',
      period: '854-925 م',
      country: 'إيران',
      field: 'الكيمياء الطبية',
      achievements: ['تصنيف المواد الكيميائية', 'الكيمياء الطبية', 'تطوير الأدوات المخبرية'],
      description: 'عالم وطبيب وكيميائي فارسي، ساهم في تطوير الكيمياء الطبية وتصنيف المواد الكيميائية.',
      image: '💊',
      famousFor: 'الكيمياء الطبية وتصنيف المواد'
    },
    {
      id: 'kekule',
      name: 'August Kekulé',
      nameArabic: 'أوغست كيكوليه',
      period: '1829-1896 م',
      country: 'ألمانيا',
      field: 'الكيمياء العضوية',
      achievements: ['بنية البنزين الحلقية', 'نظرية التكافؤ', 'الكيمياء العضوية'],
      description: 'عالم كيمياء ألماني، اكتشف البنية الحلقية للبنزين وطور نظرية التكافؤ في الكيمياء العضوية.',
      image: '⬡',
      famousFor: 'اكتشاف البنية الحلقية للبنزين'
    },
    {
      id: 'watson-crick',
      name: 'Watson & Crick',
      nameArabic: 'واتسون وكريك',
      period: '1953 م',
      country: 'إنجلترا/أمريكا',
      field: 'الكيمياء الحيوية',
      achievements: ['بنية الحمض النووي DNA', 'النموذج الحلزوني المزدوج', 'الوراثة الجزيئية'],
      description: 'عالما أحياء جزيئية، اكتشفا البنية الحلزونية المزدوجة للحمض النووي DNA.',
      image: '🧬',
      famousFor: 'اكتشاف بنية الحمض النووي DNA',
      nobelPrize: true
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
        <h2 className="text-3xl font-bold text-glow-cyan mb-4">أعلام الكيمياء عبر التاريخ</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          تعرف على أشهر علماء الكيمياء الذين غيروا فهمنا للمادة والتفاعلات الكيميائية
        </p>
      </div>

      {/* شريط البحث */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="ابحث عن عالم كيمياء..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-cyan-900/20 border-cyan-500/30 text-white placeholder-cyan-300/50 focus:border-cyan-400"
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
            <Card className="cursor-pointer h-full bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-glow-sm shadow-cyan-500/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3 relative">
                    {scientist.image}
                    {scientist.nobelPrize && (
                      <div className="absolute -top-2 -right-2 text-yellow-400 text-xl">🏆</div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{scientist.nameArabic}</h3>
                  <p className="text-cyan-300 text-sm">{scientist.name}</p>
                </div>
                
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>{scientist.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{scientist.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Atom className="w-4 h-4 text-cyan-400" />
                    <span>{scientist.field}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <p className="text-cyan-300 text-sm font-medium">اشتهر بـ:</p>
                  <p className="text-white/80 text-sm">{scientist.famousFor}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredScientists.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
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
            className="bg-gradient-to-br from-cyan-900/95 to-blue-900/90 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30"
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
              <p className="text-cyan-300 text-lg">{selectedScientist.name}</p>
              {selectedScientist.nobelPrize && (
                <p className="text-yellow-400 text-sm mt-2">🏆 حائز على جائزة نوبل</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-cyan-800/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">الفترة الزمنية</p>
                  <p className="text-white">{selectedScientist.period}</p>
                </div>
                
                <div className="bg-cyan-800/30 rounded-lg p-4 text-center">
                  <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">البلد</p>
                  <p className="text-white">{selectedScientist.country}</p>
                </div>
                
                <div className="bg-cyan-800/30 rounded-lg p-4 text-center">
                  <Atom className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-medium">التخصص</p>
                  <p className="text-white">{selectedScientist.field}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3">نبذة عن العالم</h3>
                <p className="text-white/90 leading-relaxed">{selectedScientist.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3">أهم الإنجازات</h3>
                <ul className="space-y-2">
                  {selectedScientist.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setSelectedScientist(null)}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
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

export default ChemistryScientists;
