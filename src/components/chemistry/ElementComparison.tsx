
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap, Target, Atom, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { periodicElements, getElementBySymbol } from '@/data/periodic-elements';
import { Element } from '@/types/periodic-table';

const ElementComparison = () => {
  const [element1, setElement1] = useState<Element | null>(null);
  const [element2, setElement2] = useState<Element | null>(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [comparisonProperty, setComparisonProperty] = useState<string>('electronegativity');

  const filteredElements1 = periodicElements.filter(el => 
    el.name.toLowerCase().includes(searchTerm1.toLowerCase()) || 
    el.symbol.toLowerCase().includes(searchTerm1.toLowerCase())
  ).slice(0, 5);

  const filteredElements2 = periodicElements.filter(el => 
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
        case 'reactivity':
          // تقدير النشاط بناءً على المجموعة والدورة
          if (element.group === 1 || element.group === 2) return element.period * 2;
          if (element.group === 17) return 8 - element.period;
          return 1;
        default:
          return 0;
      }
    };

    const value1 = getPropertyValue(element1, comparisonProperty);
    const value2 = getPropertyValue(element2, comparisonProperty);

    let result = '';
    if (comparisonProperty === 'atomic_radius') {
      result = value1 > value2 ? `${element1.name} أكبر` : value1 < value2 ? `${element2.name} أكبر` : 'متساويان';
    } else {
      result = value1 > value2 ? `${element1.name} أعلى` : value1 < value2 ? `${element2.name} أعلى` : 'متساويان';
    }

    return { result, value1, value2 };
  };

  const getPropertyIcon = (property: string) => {
    switch (property) {
      case 'electronegativity': return <Zap className="h-4 w-4" />;
      case 'ionization_energy': return <Target className="h-4 w-4" />;
      case 'electron_affinity': return <Activity className="h-4 w-4" />;
      case 'atomic_radius': return <Atom className="h-4 w-4" />;
      case 'reactivity': return <Activity className="h-4 w-4" />;
      default: return <Atom className="h-4 w-4" />;
    }
  };

  const getPropertyUnit = (property: string) => {
    switch (property) {
      case 'electronegativity': return '';
      case 'ionization_energy': return 'kJ/mol';
      case 'electron_affinity': return 'kJ/mol';
      case 'atomic_radius': return 'pm';
      case 'reactivity': return '';
      default: return '';
    }
  };

  const comparison = compareElements();

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-lg border-cyan-500/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            مقارنة العناصر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* اختيار الخاصية للمقارنة */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">اختر الخاصية للمقارنة</label>
            <Select value={comparisonProperty} onValueChange={setComparisonProperty}>
              <SelectTrigger className="bg-blue-900/30 border-cyan-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-900/90 border-cyan-500/30">
                <SelectItem value="electronegativity">السالبية الكهربائية</SelectItem>
                <SelectItem value="ionization_energy">طاقة التأين</SelectItem>
                <SelectItem value="electron_affinity">الألفة الإلكترونية</SelectItem>
                <SelectItem value="atomic_radius">نصف القطر الذري</SelectItem>
                <SelectItem value="reactivity">النشاط الكيميائي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* العنصر الأول */}
            <div className="space-y-3">
              <label className="text-white/70 text-sm">العنصر الأول</label>
              <div className="relative">
                <Input
                  placeholder="ابحث عن عنصر..."
                  value={searchTerm1}
                  onChange={(e) => setSearchTerm1(e.target.value)}
                  className="bg-blue-900/30 border-cyan-500/30 text-white pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
              </div>
              
              {searchTerm1 && filteredElements1.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredElements1.map((el) => (
                    <Button
                      key={el.symbol}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-blue-800/50"
                      onClick={() => {
                        setElement1(el);
                        setSearchTerm1('');
                      }}
                    >
                      <span className="font-bold mr-2">{el.symbol}</span>
                      {el.name}
                    </Button>
                  ))}
                </div>
              )}

              {element1 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{element1.symbol}</div>
                    <div className="text-cyan-300">{element1.name}</div>
                    <div className="text-white/60 text-sm">العدد الذري: {element1.atomic_number}</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* السهم والنتيجة */}
            <div className="flex flex-col items-center justify-center">
              <ArrowRight className="h-8 w-8 text-cyan-400 mb-4" />
              {comparison && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-center justify-center mb-2">
                    {getPropertyIcon(comparisonProperty)}
                    <span className="text-white font-bold mr-2">{comparison.result}</span>
                  </div>
                  <div className="text-xs text-white/70">
                    {element1?.name}: {comparison.value1} {getPropertyUnit(comparisonProperty)}
                    <br />
                    {element2?.name}: {comparison.value2} {getPropertyUnit(comparisonProperty)}
                  </div>
                </motion.div>
              )}
            </div>

            {/* العنصر الثاني */}
            <div className="space-y-3">
              <label className="text-white/70 text-sm">العنصر الثاني</label>
              <div className="relative">
                <Input
                  placeholder="ابحث عن عنصر..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="bg-blue-900/30 border-cyan-500/30 text-white pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
              </div>
              
              {searchTerm2 && filteredElements2.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredElements2.map((el) => (
                    <Button
                      key={el.symbol}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-blue-800/50"
                      onClick={() => {
                        setElement2(el);
                        setSearchTerm2('');
                      }}
                    >
                      <span className="font-bold mr-2">{el.symbol}</span>
                      {el.name}
                    </Button>
                  ))}
                </div>
              )}

              {element2 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-lg border border-purple-500/30"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{element2.symbol}</div>
                    <div className="text-purple-300">{element2.name}</div>
                    <div className="text-white/60 text-sm">العدد الذري: {element2.atomic_number}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementComparison;
