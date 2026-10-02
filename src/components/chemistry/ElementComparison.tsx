
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap, Target, Atom, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { Element } from '@/types/periodic-table';

const ElementComparison = () => {
  const [element1, setElement1] = useState<Element | null>(null);
  const [element2, setElement2] = useState<Element | null>(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [comparisonProperty, setComparisonProperty] = useState<string>('electronegativity');

  const filteredElements1 = completePeriodicElements.filter(el => 
    el.name.toLowerCase().includes(searchTerm1.toLowerCase()) || 
    el.symbol.toLowerCase().includes(searchTerm1.toLowerCase())
  ).slice(0, 5);

  const filteredElements2 = completePeriodicElements.filter(el => 
    el.name.toLowerCase().includes(searchTerm2.toLowerCase()) || 
    el.symbol.toLowerCase().includes(searchTerm2.toLowerCase())
  ).slice(0, 5);

  const compareElements = () => {
    if (!element1 || !element2) return null;

    const getPropertyValue = (element: Element, property: string) => {
      switch (property) {
        case 'electronegativity':
          return element.electronegativity || 0;
        case 'ionization_energy':
          return element.ionization_energy || 0;
        case 'electron_affinity':
          return element.electron_affinity || 0;
        case 'atomic_radius':
          return element.atomic_radius || 0;
        case 'melting_point':
          return element.melting_point || 0;
        case 'boiling_point':
          return element.boiling_point || 0;
        case 'density':
          return element.density || 0;
        case 'atomic_mass':
          return element.atomic_mass || 0;
        case 'reactivity':
          // تقدير النشاط بناءً على المجموعة والدورة
          if (element.group === 1) return (8 - element.period);
          if (element.group === 2) return (7 - element.period);
          if (element.group === 17) return (9 - element.period);
          if (element.group === 18) return 0;
          return 3;
        default:
          return 0;
      }
    };

    const value1 = getPropertyValue(element1, comparisonProperty);
    const value2 = getPropertyValue(element2, comparisonProperty);

    let result = '';
    let description = '';
    
    if (comparisonProperty === 'atomic_radius') {
      result = value1 > value2 ? `${element1.name} أكبر` : value1 < value2 ? `${element2.name} أكبر` : 'متساويان';
      description = 'نصف القطر الذري يقل عبر الدورة ويزيد أسفل المجموعة';
    } else if (comparisonProperty === 'reactivity') {
      result = value1 > value2 ? `${element1.name} أنشط` : value1 < value2 ? `${element2.name} أنشط` : 'متساويان في النشاط';
      description = 'النشاط يزيد أسفل المجموعة للفلزات ويقل للافلزات';
    } else {
      result = value1 > value2 ? `${element1.name} أعلى` : value1 < value2 ? `${element2.name} أعلى` : 'متساويان';
      description = 'القيم تتغير حسب الموقع في الجدول الدوري';
    }

    return { result, value1, value2, description };
  };

  const getPropertyIcon = (property: string) => {
    switch (property) {
      case 'electronegativity': return <Zap className="h-5 w-5" />;
      case 'ionization_energy': return <Target className="h-5 w-5" />;
      case 'electron_affinity': return <Activity className="h-5 w-5" />;
      case 'atomic_radius': return <Atom className="h-5 w-5" />;
      case 'reactivity': return <Activity className="h-5 w-5" />;
      case 'melting_point': return <TrendingUp className="h-5 w-5" />;
      case 'boiling_point': return <TrendingUp className="h-5 w-5" />;
      case 'density': return <Atom className="h-5 w-5" />;
      case 'atomic_mass': return <Atom className="h-5 w-5" />;
      default: return <Atom className="h-5 w-5" />;
    }
  };

  const getPropertyUnit = (property: string) => {
    switch (property) {
      case 'electronegativity': return '';
      case 'ionization_energy': return 'kJ/mol';
      case 'electron_affinity': return 'kJ/mol';
      case 'atomic_radius': return 'pm';
      case 'melting_point': return '°C';
      case 'boiling_point': return '°C';
      case 'density': return 'g/cm³';
      case 'atomic_mass': return 'u';
      case 'reactivity': return '';
      default: return '';
    }
  };

  const comparison = compareElements();

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 backdrop-blur-2xl border-white/20 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-lg">
          <CardTitle className="text-white flex items-center gap-3 text-2xl">
            <Target className="h-7 w-7 text-cyan-400" />
            مقارنة العناصر المتقدمة
          </CardTitle>
          <p className="text-white/80 mt-2">قارن بين خصائص العناصر الكيميائية المختلفة</p>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {/* اختيار الخاصية للمقارنة */}
          <div>
            <label className="text-white/80 text-lg mb-3 block font-semibold">اختر الخاصية للمقارنة</label>
            <Select value={comparisonProperty} onValueChange={setComparisonProperty}>
              <SelectTrigger className="bg-white/10 border-white/30 text-white backdrop-blur-lg text-lg p-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900/90 border-cyan-500/30 backdrop-blur-xl">
                <SelectItem value="electronegativity">السالبية الكهربائية</SelectItem>
                <SelectItem value="ionization_energy">طاقة التأين</SelectItem>
                <SelectItem value="electron_affinity">الألفة الإلكترونية</SelectItem>
                <SelectItem value="atomic_radius">نصف القطر الذري</SelectItem>
                <SelectItem value="melting_point">نقطة الانصهار</SelectItem>
                <SelectItem value="boiling_point">نقطة الغليان</SelectItem>
                <SelectItem value="density">الكثافة</SelectItem>
                <SelectItem value="atomic_mass">الكتلة الذرية</SelectItem>
                <SelectItem value="reactivity">النشاط الكيميائي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* العنصر الأول */}
            <div className="space-y-4">
              <label className="text-white/80 text-lg font-semibold">العنصر الأول</label>
              <div className="relative">
                <Input
                  placeholder="ابحث عن عنصر..."
                  value={searchTerm1}
                  onChange={(e) => setSearchTerm1(e.target.value)}
                  className="bg-white/10 border-white/30 text-white pl-12 text-lg p-6 backdrop-blur-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
              </div>
              
              {searchTerm1 && filteredElements1.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-xl p-2 backdrop-blur-lg">
                  {filteredElements1.map((el) => (
                    <Button
                      key={el.symbol}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20 p-4 rounded-lg"
                      onClick={() => {
                        setElement1(el);
                        setSearchTerm1('');
                      }}
                    >
                      <span className="font-bold mr-3 text-cyan-400">{el.symbol}</span>
                      <span>{el.name}</span>
                      <span className="text-white/60 mr-auto">#{el.atomic_number}</span>
                    </Button>
                  ))}
                </div>
              )}

              {element1 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-500/30 backdrop-blur-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{element1.symbol}</div>
                    <div className="text-cyan-300 text-xl font-semibold">{element1.name}</div>
                    <div className="text-white/70 text-lg mt-1">العدد الذري: {element1.atomic_number}</div>
                    <div className="text-white/60 text-sm mt-2">المجموعة {element1.group} • الدورة {element1.period}</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* السهم والنتيجة */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center space-x-4">
                <ArrowRight className="h-8 w-8 text-cyan-400" />
                <div className="text-2xl">VS</div>
                <ArrowRight className="h-8 w-8 text-cyan-400 rotate-180" />
              </div>
              
              {comparison && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-lg min-w-[280px]"
                >
                  <div className="flex items-center justify-center mb-3">
                    {getPropertyIcon(comparisonProperty)}
                    <span className="text-white font-bold mr-3 text-lg">{comparison.result}</span>
                  </div>
                  <div className="text-sm text-white/80 space-y-1">
                    <div>{element1?.name}: <span className="font-semibold">{comparison.value1} {getPropertyUnit(comparisonProperty)}</span></div>
                    <div>{element2?.name}: <span className="font-semibold">{comparison.value2} {getPropertyUnit(comparisonProperty)}</span></div>
                  </div>
                  <div className="text-xs text-green-300 mt-3 italic">
                    {comparison.description}
                  </div>
                </motion.div>
              )}
            </div>

            {/* العنصر الثاني */}
            <div className="space-y-4">
              <label className="text-white/80 text-lg font-semibold">العنصر الثاني</label>
              <div className="relative">
                <Input
                  placeholder="ابحث عن عنصر..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="bg-white/10 border-white/30 text-white pl-12 text-lg p-6 backdrop-blur-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
              </div>
              
              {searchTerm2 && filteredElements2.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-xl p-2 backdrop-blur-lg">
                  {filteredElements2.map((el) => (
                    <Button
                      key={el.symbol}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20 p-4 rounded-lg"
                      onClick={() => {
                        setElement2(el);
                        setSearchTerm2('');
                      }}
                    >
                      <span className="font-bold mr-3 text-purple-400">{el.symbol}</span>
                      <span>{el.name}</span>
                      <span className="text-white/60 mr-auto">#{el.atomic_number}</span>
                    </Button>
                  ))}
                </div>
              )}

              {element2 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 backdrop-blur-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{element2.symbol}</div>
                    <div className="text-purple-300 text-xl font-semibold">{element2.name}</div>
                    <div className="text-white/70 text-lg mt-1">العدد الذري: {element2.atomic_number}</div>
                    <div className="text-white/60 text-sm mt-2">المجموعة {element2.group} • الدورة {element2.period}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* معلومات إضافية عن الخاصية المختارة */}
          <div className="mt-8 p-6 bg-white/5 rounded-2xl backdrop-blur-lg border border-white/10">
            <h3 className="text-white font-bold text-lg mb-3 flex items-center">
              {getPropertyIcon(comparisonProperty)}
              <span className="mr-2">معلومات عن {comparisonProperty === 'electronegativity' ? 'السالبية الكهربائية' : 
                comparisonProperty === 'ionization_energy' ? 'طاقة التأين' :
                comparisonProperty === 'atomic_radius' ? 'نصف القطر الذري' :
                comparisonProperty === 'reactivity' ? 'النشاط الكيميائي' :
                comparisonProperty === 'melting_point' ? 'نقطة الانصهار' :
                comparisonProperty === 'boiling_point' ? 'نقطة الغليان' :
                comparisonProperty === 'density' ? 'الكثافة' :
                comparisonProperty === 'atomic_mass' ? 'الكتلة الذرية' : 'الخاصية'}</span>
            </h3>
            <p className="text-white/80 leading-relaxed">
              {comparisonProperty === 'electronegativity' && 'السالبية الكهربائية تقيس قدرة الذرة على جذب الإلكترونات في الرابطة الكيميائية. تزيد عبر الدورة وتقل أسفل المجموعة.'}
              {comparisonProperty === 'ionization_energy' && 'طاقة التأين هي الطاقة المطلوبة لإزالة إلكترون من الذرة في حالتها الغازية. تزيد عبر الدورة وتقل أسفل المجموعة.'}
              {comparisonProperty === 'atomic_radius' && 'نصف القطر الذري يقيس حجم الذرة. يقل عبر الدورة بسبب زيادة الشحنة النووية ويزيد أسفل المجموعة بسبب إضافة مستويات طاقة جديدة.'}
              {comparisonProperty === 'reactivity' && 'النشاط الكيميائي يقيس ميل العنصر للتفاعل الكيميائي. يزيد أسفل المجموعة للفلزات ويقل للافلزات.'}
              {comparisonProperty === 'melting_point' && 'نقطة الانصهار هي درجة الحرارة التي يتحول فيها العنصر من الحالة الصلبة إلى السائلة.'}
              {comparisonProperty === 'boiling_point' && 'نقطة الغليان هي درجة الحرارة التي يتحول فيها العنصر من الحالة السائلة إلى الغازية.'}
              {comparisonProperty === 'density' && 'الكثافة تقيس كتلة المادة لكل وحدة حجم. تختلف حسب التركيب الذري والبنية البلورية.'}
              {comparisonProperty === 'atomic_mass' && 'الكتلة الذرية هي متوسط كتلة ذرات العنصر مقيسة بوحدة الكتلة الذرية الموحدة.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementComparison;
