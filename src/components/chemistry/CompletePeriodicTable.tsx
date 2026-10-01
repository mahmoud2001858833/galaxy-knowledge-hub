import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FilterX, 
  Filter, 
  Info, 
  Atom, 
  Zap, 
  Target, 
  Activity, 
  Volume2, 
  Layers, 
  Sparkles, 
  Flame, 
  Check, 
  ArrowUpDown, 
  X,
  Compass,
  Cpu,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';

// Modern, light-first category styles with high contrast and readable text
const CATEGORY_THEMES: Record<ElementType, {
  name: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  badgeBg: string;
  bgDark: string;
  borderDark: string;
  textDark: string;
  accent: string;
}> = {
  'alkali-metal': {
    name: 'الفلزات القلوية',
    bgLight: 'bg-rose-50 hover:bg-rose-100',
    borderLight: 'border-rose-300',
    textLight: 'text-rose-900',
    badgeBg: 'bg-rose-500 text-white',
    bgDark: 'dark:bg-rose-950/40 dark:hover:bg-rose-900/50',
    borderDark: 'dark:border-rose-700/60',
    textDark: 'dark:text-rose-200',
    accent: '#f43f5e'
  },
  'alkaline-earth-metal': {
    name: 'الفلزات القلوية الترابية',
    bgLight: 'bg-amber-50 hover:bg-amber-100',
    borderLight: 'border-amber-300',
    textLight: 'text-amber-900',
    badgeBg: 'bg-amber-500 text-white',
    bgDark: 'dark:bg-amber-950/40 dark:hover:bg-amber-900/50',
    borderDark: 'dark:border-amber-700/60',
    textDark: 'dark:text-amber-200',
    accent: '#f59e0b'
  },
  'transition-metal': {
    name: 'الفلزات الانتقالية',
    bgLight: 'bg-blue-50 hover:bg-blue-100',
    borderLight: 'border-blue-300',
    textLight: 'text-blue-900',
    badgeBg: 'bg-blue-600 text-white',
    bgDark: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/50',
    borderDark: 'dark:border-blue-700/60',
    textDark: 'dark:text-blue-200',
    accent: '#2563eb'
  },
  'post-transition-metal': {
    name: 'فلزات ما بعد الانتقالية',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100',
    borderLight: 'border-emerald-300',
    textLight: 'text-emerald-900',
    badgeBg: 'bg-emerald-600 text-white',
    bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
    borderDark: 'dark:border-emerald-700/60',
    textDark: 'dark:text-emerald-200',
    accent: '#059669'
  },
  'metalloid': {
    name: 'أشباه الفلزات',
    bgLight: 'bg-teal-50 hover:bg-teal-100',
    borderLight: 'border-teal-300',
    textLight: 'text-teal-900',
    badgeBg: 'bg-teal-600 text-white',
    bgDark: 'dark:bg-teal-950/40 dark:hover:bg-teal-900/50',
    borderDark: 'dark:border-teal-700/60',
    textDark: 'dark:text-teal-200',
    accent: '#0d9488'
  },
  'nonmetal': {
    name: 'اللافلزات التفاعلية',
    bgLight: 'bg-cyan-50 hover:bg-cyan-100',
    borderLight: 'border-cyan-300',
    textLight: 'text-cyan-900',
    badgeBg: 'bg-cyan-600 text-white',
    bgDark: 'dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50',
    borderDark: 'dark:border-cyan-700/60',
    textDark: 'dark:text-cyan-200',
    accent: '#0891b2'
  },
  'halogen': {
    name: 'الهالوجينات',
    bgLight: 'bg-violet-50 hover:bg-violet-100',
    borderLight: 'border-violet-300',
    textLight: 'text-violet-900',
    badgeBg: 'bg-violet-600 text-white',
    bgDark: 'dark:bg-violet-950/40 dark:hover:bg-violet-900/50',
    borderDark: 'dark:border-violet-700/60',
    textDark: 'dark:text-violet-200',
    accent: '#7c3aed'
  },
  'noble-gas': {
    name: 'الغازات النبيلة',
    bgLight: 'bg-purple-50 hover:bg-purple-100',
    borderLight: 'border-purple-300',
    textLight: 'text-purple-900',
    badgeBg: 'bg-purple-600 text-white',
    bgDark: 'dark:bg-purple-950/40 dark:hover:bg-purple-900/50',
    borderDark: 'dark:border-purple-700/60',
    textDark: 'dark:text-purple-200',
    accent: '#9333ea'
  },
  'lanthanide': {
    name: 'اللانثانيدات (عناصر أرضية نادرة)',
    bgLight: 'bg-fuchsia-50 hover:bg-fuchsia-100',
    borderLight: 'border-fuchsia-300',
    textLight: 'text-fuchsia-900',
    badgeBg: 'bg-fuchsia-600 text-white',
    bgDark: 'dark:bg-fuchsia-950/40 dark:hover:bg-fuchsia-900/50',
    borderDark: 'dark:border-fuchsia-700/60',
    textDark: 'dark:text-fuchsia-200',
    accent: '#c026d3'
  },
  'actinide': {
    name: 'الأكتينيدات (عناصر مشعة)',
    bgLight: 'bg-pink-50 hover:bg-pink-100',
    borderLight: 'border-pink-300',
    textLight: 'text-pink-900',
    badgeBg: 'bg-pink-600 text-white',
    bgDark: 'dark:bg-pink-950/40 dark:hover:bg-pink-900/50',
    borderDark: 'dark:border-pink-700/60',
    textDark: 'dark:text-pink-200',
    accent: '#db2777'
  }
};

type TrendProperty = 'none' | 'electronegativity' | 'atomic_radius' | 'ionization_energy' | 'atomic_mass';

export const CompletePeriodicTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ElementType | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'solid' | 'liquid' | 'gas'>('all');
  const [activeTrend, setActiveTrend] = useState<TrendProperty>('none');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [inspectElement, setInspectElement] = useState<Element | null>(null);
  
  // Element Comparison Queue (max 3 elements)
  const [compareList, setCompareList] = useState<Element[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Default active inspect element
  const currentInspector = inspectElement || selectedElement || completePeriodicElements[0];

  // Fast Memoized 18x10 Periodic Grid Creation (Computed ONCE)
  const periodicGrid = useMemo(() => {
    const grid: (Element | null)[][] = Array(10).fill(null).map(() => Array(18).fill(null));

    completePeriodicElements.forEach(element => {
      let row = element.period - 1;
      let col = element.group - 1;

      // Lanthanides (57-71) placed in row 8
      if (element.atomic_number >= 57 && element.atomic_number <= 71) {
        row = 8;
        col = element.atomic_number - 57 + 3;
      }
      // Actinides (89-103) placed in row 9
      else if (element.atomic_number >= 89 && element.atomic_number <= 103) {
        row = 9;
        col = element.atomic_number - 89 + 3;
      }
      // Group 18 Noble Gases
      else if (element.group === 18) {
        col = 17;
      }
      // Hydrogen
      else if (element.atomic_number === 1) {
        row = 0;
        col = 0;
      }
      // Helium
      else if (element.atomic_number === 2) {
        row = 0;
        col = 17;
      }

      if (row >= 0 && row < 10 && col >= 0 && col < 18) {
        grid[row][col] = element;
      }
    });

    return grid;
  }, []);

  // Filter Matcher function (Pure & Fast)
  const isElementMatching = useCallback((element: Element) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = element.name.toLowerCase().includes(q);
      const matchSymbol = element.symbol.toLowerCase().includes(q);
      const matchNumber = element.atomic_number.toString() === q;
      if (!matchName && !matchSymbol && !matchNumber) return false;
    }

    if (selectedCategory !== 'all' && element.type !== selectedCategory) {
      return false;
    }

    if (stateFilter !== 'all' && element.state_at_room_temp !== stateFilter) {
      return false;
    }

    return true;
  }, [searchTerm, selectedCategory, stateFilter]);

  // Heatmap values min/max for trend visualization
  const trendExtremes = useMemo(() => {
    if (activeTrend === 'none') return null;
    let min = Infinity;
    let max = -Infinity;

    completePeriodicElements.forEach(el => {
      const val = el[activeTrend as keyof Element] as number | undefined;
      if (typeof val === 'number') {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    });

    return { min, max };
  }, [activeTrend]);

  // Calculate Heatmap Intensity Color (0 to 1)
  const getTrendStyle = useCallback((element: Element) => {
    if (activeTrend === 'none' || !trendExtremes) return null;
    const val = element[activeTrend as keyof Element] as number | undefined;
    if (typeof val !== 'number') return { opacity: 0.35 };

    const ratio = Math.max(0, Math.min(1, (val - trendExtremes.min) / (trendExtremes.max - trendExtremes.min || 1)));
    return {
      backgroundColor: `rgba(14, 165, 233, ${0.15 + ratio * 0.7})`,
      borderColor: `rgba(2, 132, 199, ${0.4 + ratio * 0.6})`,
    };
  }, [activeTrend, trendExtremes]);

  // Speech Pronunciation
  const speakElementName = (name: string, symbol: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`عنصر ${name}، رمزه الكيميائي ${symbol}`);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add / Remove from Compare
  const toggleCompare = (element: Element) => {
    if (compareList.some(e => e.symbol === element.symbol)) {
      setCompareList(prev => prev.filter(e => e.symbol !== element.symbol));
    } else {
      if (compareList.length >= 3) {
        setCompareList(prev => [...prev.slice(1), element]);
      } else {
        setCompareList(prev => [...prev, element]);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStateFilter('all');
    setActiveTrend('none');
  };

  return (
    <div className="w-full space-y-6" dir="rtl">
      {/* 1. Top Controls Bar: Search, Category Filters, State Filters, Trends */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Fast Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="ابحث بالاسم (حديد)، الرمز (Fe)، أو العدد الذري (26)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-xs h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* States of Matter Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-1">الحالة:</span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'solid', label: 'صلب 🪨' },
              { id: 'liquid', label: 'سائل 💧' },
              { id: 'gas', label: 'غاز 💨' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStateFilter(s.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  stateFilter === s.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Periodic Trends Visualization Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">التدرج الدوري:</span>
            <select
              value={activeTrend}
              onChange={(e) => setActiveTrend(e.target.value as TrendProperty)}
              className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="none">بدون تدرج حراري</option>
              <option value="electronegativity">الكهروسلبية (Electronegativity)</option>
              <option value="atomic_radius">نصف القطر الذري (Atomic Radius)</option>
              <option value="ionization_energy">طاقة التأين (Ionization Energy)</option>
              <option value="atomic_mass">الكتلة الذرية (Atomic Mass)</option>
            </select>

            {(searchTerm || selectedCategory !== 'all' || stateFilter !== 'all' || activeTrend !== 'none') && (
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                title="إلغاء كافة الفلاتر"
              >
                <FilterX className="w-4 h-4" />
                <span>إعادة ضبط</span>
              </Button>
            )}
          </div>
        </div>

        {/* 2. Category Color Legend Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            كافة العائلات (118)
          </button>

          {Object.entries(CATEGORY_THEMES).map(([typeKey, theme]) => {
            const isSelected = selectedCategory === typeKey;
            const count = completePeriodicElements.filter(e => e.type === typeKey).length;
            return (
              <button
                key={typeKey}
                onClick={() => setSelectedCategory(typeKey as ElementType)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${theme.badgeBg} border-transparent shadow-sm scale-105`
                    : `${theme.bgLight} ${theme.borderLight} ${theme.textLight} ${theme.bgDark} ${theme.borderDark} ${theme.textDark} hover:scale-102`
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: theme.accent }}
                />
                <span>{theme.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Fast Active Element Inspector & Telemetry Bar */}
      {currentInspector && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-cyan-200/80 dark:border-cyan-800/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-md ${
              CATEGORY_THEMES[currentInspector.type]?.borderLight || 'border-cyan-400'
            } bg-white dark:bg-slate-800`}>
              <span className="text-[10px] text-slate-400 font-bold">{currentInspector.atomic_number}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {currentInspector.symbol}
              </span>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                {currentInspector.atomic_mass?.toFixed(2)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  عنصر {currentInspector.name} ({currentInspector.symbol})
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  CATEGORY_THEMES[currentInspector.type]?.badgeBg || 'bg-cyan-600 text-white'
                }`}>
                  {CATEGORY_THEMES[currentInspector.type]?.name}
                </span>
                <button
                  onClick={() => speakElementName(currentInspector.name, currentInspector.symbol)}
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"
                  title="استماع لنطق العنصر"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl line-clamp-1">
                <strong>الاستخدام:</strong> {currentInspector.usage || 'عنصر كيميائي أساسي في التفاعلات والصناعات الحديثة'}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>المجموعة: <strong className="text-cyan-600 dark:text-cyan-400">{currentInspector.group}</strong></span>
                <span>الدورة: <strong className="text-cyan-600 dark:text-cyan-400">{currentInspector.period}</strong></span>
                <span>التوزيع: <strong className="text-purple-600 dark:text-purple-400">{currentInspector.electron_configuration || 'غير محدد'}</strong></span>
                {currentInspector.electronegativity && (
                  <span>الكهروسلبية: <strong className="text-emerald-600 dark:text-emerald-400">{currentInspector.electronegativity}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Button
              onClick={() => toggleCompare(currentInspector)}
              variant={compareList.some(e => e.symbol === currentInspector.symbol) ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl text-xs font-bold h-9"
            >
              <Target className="w-3.5 h-3.5 ml-1.5 text-cyan-500" />
              <span>
                {compareList.some(e => e.symbol === currentInspector.symbol) ? 'تمت الإضافة للمقارنة' : 'أضف للمقارنة'}
              </span>
            </Button>

            <Button
              onClick={() => setSelectedElement(currentInspector)}
              size="sm"
              className="rounded-xl text-xs font-black h-9 bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5 shadow-sm"
            >
              <Info className="w-3.5 h-3.5" />
              <span>البطاقة الشاملة</span>
            </Button>
          </div>
        </div>
      )}

      {/* Floating Compare Drawer Trigger (if any elements in compare queue) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {compareList.map(e => (
              <span key={e.symbol} className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-black">
                {e.symbol}
              </span>
            ))}
          </div>
          <Button
            onClick={() => setCompareModalOpen(true)}
            size="sm"
            className="h-8 text-xs font-black rounded-xl bg-cyan-600 text-white"
          >
            مقارنة العناصر ({compareList.length})
          </Button>
          <button
            onClick={() => setCompareList([])}
            className="text-slate-400 hover:text-rose-500 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. The 18x10 Periodic Grid with High Performance Native CSS Rendering */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="min-w-[1080px] max-w-[1380px] mx-auto space-y-2">
          
          {/* Top Column Headers: Groups 1 to 18 */}
          <div className="grid grid-cols-18 gap-1.5 text-center text-[10px] font-mono text-slate-400 pb-1">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="font-bold">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Rows 1 to 7 (Main Periodic Table) */}
          <div className="space-y-1.5">
            {periodicGrid.slice(0, 7).map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-18 gap-1.5">
                {row.map((element, colIndex) => {
                  if (!element) {
                    return (
                      <div 
                        key={`empty-${rowIndex}-${colIndex}`} 
                        className="aspect-square"
                      />
                    );
                  }

                  const matching = isElementMatching(element);
                  const theme = CATEGORY_THEMES[element.type];
                  const trendStyle = getTrendStyle(element);

                  return (
                    <div
                      key={element.symbol}
                      onClick={() => {
                        setSelectedElement(element);
                        setInspectElement(element);
                      }}
                      onMouseEnter={() => setInspectElement(element)}
                      style={trendStyle || undefined}
                      className={`aspect-square rounded-xl p-1 flex flex-col justify-between cursor-pointer border transition-transform duration-150 hover:scale-110 hover:z-20 relative select-none ${
                        theme?.bgLight || 'bg-slate-50'
                      } ${theme?.borderLight || 'border-slate-200'} ${theme?.textLight || 'text-slate-900'} ${
                        theme?.bgDark || 'dark:bg-slate-800'
                      } ${theme?.borderDark || 'dark:border-slate-700'} ${theme?.textDark || 'dark:text-white'} ${
                        matching ? 'opacity-100 shadow-xs hover:shadow-md' : 'opacity-20 pointer-events-none'
                      }`}
                    >
                      {/* Atomic Number & Mass */}
                      <div className="flex items-center justify-between text-[8px] font-mono leading-none opacity-70">
                        <span className="font-bold">{element.atomic_number}</span>
                        <span className="hidden xl:inline">{element.atomic_mass ? Math.round(element.atomic_mass) : ''}</span>
                      </div>

                      {/* Symbol & Name */}
                      <div className="text-center my-auto">
                        <div className="text-xs sm:text-sm font-black leading-none tracking-tight">
                          {element.symbol}
                        </div>
                        <div className="text-[7.5px] font-bold leading-none truncate max-w-full mt-0.5 opacity-85">
                          {element.name}
                        </div>
                      </div>

                      {/* State indicator dot */}
                      <div className="flex justify-end items-center text-[7px] leading-none opacity-60">
                        {element.state_at_room_temp === 'gas' && '💨'}
                        {element.state_at_room_temp === 'liquid' && '💧'}
                        {element.state_at_room_temp === 'solid' && '🪨'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Spacer between Main Table and Lanthanides / Actinides */}
          <div className="pt-6 pb-2">
            <div className="border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 pt-2 px-2">
              <span className="font-bold">سلسلة العناصر الأرضية النادرة والمشعة (اللانثانيدات والأكتينيدات)</span>
              <span className="text-[10px]">الموضع الأصلي: الدورات 6 و 7 في المجموعة 3</span>
            </div>
          </div>

          {/* Rows 8 & 9 (Lanthanides & Actinides) */}
          <div className="space-y-1.5 pt-1">
            {periodicGrid.slice(8, 10).map((row, rowIndex) => (
              <div key={rowIndex + 8} className="grid grid-cols-18 gap-1.5 items-center">
                {/* Series Label in first 3 columns */}
                <div className="col-span-3 text-right pr-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {rowIndex === 0 ? 'اللانثانيدات (57-71):' : 'الأكتينيدات (89-103):'}
                </div>

                {/* 15 elements across columns 4 to 18 */}
                {row.slice(3).map((element, colIndex) => {
                  if (!element) return <div key={`empty-lanth-${colIndex}`} className="aspect-square" />;

                  const matching = isElementMatching(element);
                  const theme = CATEGORY_THEMES[element.type];
                  const trendStyle = getTrendStyle(element);

                  return (
                    <div
                      key={element.symbol}
                      onClick={() => {
                        setSelectedElement(element);
                        setInspectElement(element);
                      }}
                      onMouseEnter={() => setInspectElement(element)}
                      style={trendStyle || undefined}
                      className={`aspect-square rounded-xl p-1 flex flex-col justify-between cursor-pointer border transition-transform duration-150 hover:scale-110 hover:z-20 relative select-none ${
                        theme?.bgLight || 'bg-slate-50'
                      } ${theme?.borderLight || 'border-slate-200'} ${theme?.textLight || 'text-slate-900'} ${
                        theme?.bgDark || 'dark:bg-slate-800'
                      } ${theme?.borderDark || 'dark:border-slate-700'} ${theme?.textDark || 'dark:text-white'} ${
                        matching ? 'opacity-100 shadow-xs hover:shadow-md' : 'opacity-20 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono leading-none opacity-70">
                        <span className="font-bold">{element.atomic_number}</span>
                      </div>

                      <div className="text-center my-auto">
                        <div className="text-xs sm:text-sm font-black leading-none tracking-tight">
                          {element.symbol}
                        </div>
                        <div className="text-[7.5px] font-bold leading-none truncate max-w-full mt-0.5 opacity-85">
                          {element.name}
                        </div>
                      </div>

                      <div className="flex justify-end text-[7px] leading-none opacity-60">
                        {rowIndex === 1 ? '☢️' : '✨'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 4. Full Comprehensive Element Details Modal */}
      <Dialog open={!!selectedElement} onOpenChange={(open) => !open && setSelectedElement(null)}>
        {selectedElement && (
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6" dir="rtl">
            <DialogHeader className="text-right">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-md ${
                    CATEGORY_THEMES[selectedElement.type]?.borderLight || 'border-cyan-400'
                  } bg-slate-50 dark:bg-slate-800`}>
                    <span className="text-[10px] text-slate-400 font-bold">{selectedElement.atomic_number}</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {selectedElement.symbol}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {selectedElement.atomic_mass?.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>عنصر {selectedElement.name}</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">({selectedElement.symbol})</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-white font-bold text-[10px] ${
                        CATEGORY_THEMES[selectedElement.type]?.badgeBg || 'bg-cyan-600'
                      }`}>
                        {CATEGORY_THEMES[selectedElement.type]?.name}
                      </span>
                      <span>&bull;</span>
                      <span>العدد الذري: {selectedElement.atomic_number}</span>
                      <span>&bull;</span>
                      <span>المجموعة {selectedElement.group} &bull; الدورة {selectedElement.period}</span>
                    </DialogDescription>
                  </div>
                </div>

                <Button
                  onClick={() => speakElementName(selectedElement.name, selectedElement.symbol)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>نطق</span>
                </Button>
              </div>
            </DialogHeader>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">الكتلة الذرية</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {selectedElement.atomic_mass?.toFixed(3)} u
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">الحالة في 25°C</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedElement.state_at_room_temp === 'gas' && 'غاز 💨'}
                  {selectedElement.state_at_room_temp === 'liquid' && 'سائل 💧'}
                  {selectedElement.state_at_room_temp === 'solid' && 'صلب 🪨'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">الكهروسلبية (Pauling)</span>
                <div className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  {selectedElement.electronegativity !== undefined ? selectedElement.electronegativity : 'غير متاح'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">طاقة التأين الأولى</span>
                <div className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {selectedElement.ionization_energy ? `${selectedElement.ionization_energy} kJ/mol` : 'غير متاح'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">نصف القطر الذري</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedElement.atomic_radius ? `${selectedElement.atomic_radius} pm` : 'غير متاح'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">درجة الانصهار</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {selectedElement.melting_point !== undefined ? `${selectedElement.melting_point} °C` : 'غير متاح'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">درجة الغليان</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {selectedElement.boiling_point !== undefined ? `${selectedElement.boiling_point} °C` : 'غير متاح'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] text-slate-400">الكثافة</span>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {selectedElement.density !== undefined ? `${selectedElement.density} g/cm³` : 'غير متاح'}
                </div>
              </div>
            </div>

            {/* Electron Configuration Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>التوزيع الإلكتروني للمدارات</span>
                </span>
                <span className="font-mono text-sm">{selectedElement.electron_configuration || '1s²...'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                يحدد التوزيع الإلكتروني سلوك العنصر الكيميائي، تكافؤه، وروابطه التساهمية والأيونية في المركبات.
              </p>
            </div>

            {/* Real World Applications & Usage */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>الاستخدامات والتطبيقات العملية:</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedElement.usage || 'يستخدم في العديد من التطبيقات الصناعية والتقنية والسبائك الهندسية الحديثة.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => {
                  toggleCompare(selectedElement);
                  setSelectedElement(null);
                }}
                variant="outline"
                className="rounded-2xl text-xs gap-1.5"
              >
                <Target className="w-4 h-4 text-cyan-500" />
                <span>
                  {compareList.some(e => e.symbol === selectedElement.symbol) ? 'إزالة من المقارنة' : 'مقارنة مع عناصر أخرى'}
                </span>
              </Button>

              <Button
                onClick={() => setSelectedElement(null)}
                className="rounded-2xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* 5. Element Comparison Dialog */}
      <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="max-w-4xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-500" />
              <span>مقارنة الخصائص الكيميائية والفيزيائية للعناصر المختارة</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              مقارنة تحليلية مباشرة بين العناصر المحددة
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareList.map(el => (
              <div 
                key={el.symbol}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{el.symbol}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{el.name}</h4>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${
                    CATEGORY_THEMES[el.type]?.badgeBg || 'bg-cyan-600'
                  }`}>
                    {CATEGORY_THEMES[el.type]?.name}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">العدد الذري:</span>
                    <strong className="font-mono">{el.atomic_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الكتلة الذرية:</span>
                    <strong className="font-mono">{el.atomic_mass?.toFixed(2)} u</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الكهروسلبية:</span>
                    <strong className="font-mono text-cyan-600 dark:text-cyan-400">{el.electronegativity ?? '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">نصف القطر الذري:</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">{el.atomic_radius ? `${el.atomic_radius} pm` : '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">طاقة التأين:</span>
                    <strong className="font-mono text-purple-600 dark:text-purple-400">{el.ionization_energy ? `${el.ionization_energy} kJ/mol` : '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحالة في 25°C:</span>
                    <strong>
                      {el.state_at_room_temp === 'solid' ? 'صلب' : el.state_at_room_temp === 'liquid' ? 'سائل' : 'غاز'}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700 line-clamp-2">
                  {el.usage}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={() => setCompareList([])}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs text-rose-500"
            >
              مسح المقارنة
            </Button>
            <Button
              onClick={() => setCompareModalOpen(false)}
              size="sm"
              className="rounded-xl text-xs font-bold px-6"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompletePeriodicTable;
