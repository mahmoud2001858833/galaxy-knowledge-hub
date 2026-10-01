import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap, Target, Atom, Activity, TrendingUp, Sparkles, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { Element } from '@/types/periodic-table';

export const ElementComparison: React.FC = () => {
  const [element1, setElement1] = useState<Element | null>(completePeriodicElements[0]); // Hydrogen
  const [element2, setElement2] = useState<Element | null>(completePeriodicElements[7]); // Oxygen
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

    const getPropertyValue = (element: Element, property: string): number => {
      switch (property) {
        case 'electronegativity': return element.electronegativity || 0;
        case 'ionization_energy': return element.ionization_energy || 0;
        case 'atomic_radius': return element.atomic_radius || 0;
        case 'melting_point': return element.melting_point || 0;
        case 'boiling_point': return element.boiling_point || 0;
        case 'density': return element.density || 0;
        case 'atomic_mass': return element.atomic_mass || 0;
        default: return 0;
      }
    };

    const value1 = getPropertyValue(element1, comparisonProperty);
    const value2 = getPropertyValue(element2, comparisonProperty);

    let result = '';
    let description = '';
    
    if (comparisonProperty === 'atomic_radius') {
      result = value1 > value2 ? `${element1.name} أكبر حجماً ذرياً` : value1 < value2 ? `${element2.name} أكبر حجماً ذرياً` : 'متساويان في الحجم الذري';
      description = 'يقل نصف القطر الذري عبر الدورة من اليسار لليمين ويزداد بالنزول في المجموعة.';
    } else if (comparisonProperty === 'electronegativity') {
      result = value1 > value2 ? `${element1.name} أعلى كهروسلبية` : value1 < value2 ? `${element2.name} أعلى كهروسلبية` : 'متساويان في الكهروسلبية';
      description = 'تزداد الكهروسلبية عموماً نحو أعلى اليمين (الفلور هو الأعلى بقيمة 3.98).';
    } else if (comparisonProperty === 'ionization_energy') {
      result = value1 > value2 ? `${element1.name} يتطلب طاقة تأين أكبر` : value1 < value2 ? `${element2.name} يتطلب طاقة تأين أكبر` : 'متساويان في طاقة التأين';
      description = 'طاقة التأين تزداد عبر الدورة بسبب زيادة شحنة النواة الفعالة وتناقص الحجم الذري.';
    } else {
      result = value1 > value2 ? `${element1.name} أعلى قيمة` : value1 < value2 ? `${element2.name} أعلى قيمة` : 'متساويان في القيمة';
      description = 'تعتمد القيم على البنية الإلكترونية وشبكة الروابط الذرية.';
    }

    return { result, value1, value2, description };
  };

  const getPropertyIcon = (property: string) => {
    switch (property) {
      case 'electronegativity': return <Zap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
      case 'ionization_energy': return <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'atomic_radius': return <Atom className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'melting_point': return <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'boiling_point': return <TrendingUp className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      case 'density': return <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'atomic_mass': return <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default: return <Atom className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  const getPropertyUnit = (property: string) => {
    switch (property) {
      case 'electronegativity': return '';
      case 'ionization_energy': return 'kJ/mol';
      case 'atomic_radius': return 'pm';
      case 'melting_point': return '°C';
      case 'boiling_point': return '°C';
      case 'density': return 'g/cm³';
      case 'atomic_mass': return 'u';
      default: return '';
    }
  };

  const comparison = compareElements();

  return (
    <div className="w-full space-y-6" dir="rtl">
      <Card className="rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white">
                مختبر مقارنة العناصر المتقدم
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                قارن بين أي عنصرين في الجدول الدوري بدقة علمية وفق مؤشرات الكهروسلبية، طاقة التأين، والحجم الذري
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Property Selector */}
          <div className="max-w-md mx-auto space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center">
              اختر الخاصية الفيزيائية أو الكيميائية للمقارنة:
            </label>
            <Select value={comparisonProperty} onValueChange={setComparisonProperty}>
              <SelectTrigger className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="electronegativity">الكهروسلبية (السالبية الكهربائية)</SelectItem>
                <SelectItem value="ionization_energy">طاقة التأين الأولى (kJ/mol)</SelectItem>
                <SelectItem value="atomic_radius">نصف القطر الذري (Picometers)</SelectItem>
                <SelectItem value="atomic_mass">الكتلة الذرية النسبية (u)</SelectItem>
                <SelectItem value="melting_point">درجة الانصهار (°C)</SelectItem>
                <SelectItem value="boiling_point">درجة الغليان (°C)</SelectItem>
                <SelectItem value="density">الكثافة (g/cm³)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Side by Side Comparison Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Element 1 Column */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                العنصر الأول:
              </label>
              <div className="relative">
                <Input
                  placeholder="ابحث بالاسم أو الرمز..."
                  value={searchTerm1}
                  onChange={(e) => setSearchTerm1(e.target.value)}
                  className="pr-9 h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              {searchTerm1 && filteredElements1.length > 0 && (
                <div className="space-y-1 bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-lg">
                  {filteredElements1.map((el) => (
                    <button
                      key={el.symbol}
                      onClick={() => {
                        setElement1(el);
                        setSearchTerm1('');
                      }}
                      className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{el.symbol}</span>
                        <span>{el.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">#{el.atomic_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {element1 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
                  <span className="text-xs text-slate-400 font-mono">العدد الذري: {element1.atomic_number}</span>
                  <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400 leading-none">
                    {element1.symbol}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {element1.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    المجموعة {element1.group} • الدورة {element1.period}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Result & Difference Visualization */}
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-black text-sm">
                VS
              </div>

              {comparison && element1 && element2 && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-slate-850 dark:to-slate-900 border border-purple-200 dark:border-purple-800/60 shadow-md space-y-3 w-full"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    {getPropertyIcon(comparisonProperty)}
                    <span>{comparison.result}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-purple-200/60 dark:border-slate-700">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80">
                      <span className="text-[10px] text-slate-400 block">{element1.name}</span>
                      <strong className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">
                        {comparison.value1} {getPropertyUnit(comparisonProperty)}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80">
                      <span className="text-[10px] text-slate-400 block">{element2.name}</span>
                      <strong className="font-mono text-purple-600 dark:text-purple-400 text-sm">
                        {comparison.value2} {getPropertyUnit(comparisonProperty)}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {comparison.description}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Element 2 Column */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                العنصر الثاني:
              </label>
              <div className="relative">
                <Input
                  placeholder="ابحث بالاسم أو الرمز..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="pr-9 h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              {searchTerm2 && filteredElements2.length > 0 && (
                <div className="space-y-1 bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-lg">
                  {filteredElements2.map((el) => (
                    <button
                      key={el.symbol}
                      onClick={() => {
                        setElement2(el);
                        setSearchTerm2('');
                      }}
                      className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-600 dark:text-purple-400">{el.symbol}</span>
                        <span>{el.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">#{el.atomic_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {element2 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
                  <span className="text-xs text-slate-400 font-mono">العدد الذري: {element2.atomic_number}</span>
                  <div className="text-4xl font-black text-purple-600 dark:text-purple-400 leading-none">
                    {element2.symbol}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {element2.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    المجموعة {element2.group} • الدورة {element2.period}
                  </div>
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementComparison;
