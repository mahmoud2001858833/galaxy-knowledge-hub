
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FilterX, Filter, Sun, Moon, Info, Atom, Zap, Target, Activity } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';

const CompletePeriodicTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterType, setFilterType] = useState<ElementType | null>(null);
  const [filteredElements, setFilteredElements] = useState(completePeriodicElements);
  const [hoverElement, setHoverElement] = useState<Element | null>(null);

  // فلترة العناصر بناءً على البحث والفلتر المحدد
  useEffect(() => {
    let result = [...completePeriodicElements];
    
    if (searchTerm) {
      result = completePeriodicElements.filter(element => 
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (filterType) {
      result = completePeriodicElements.filter(el => el.type === filterType);
    }
    
    setFilteredElements(result);
  }, [searchTerm, filterType]);

  // إعادة ضبط الفلترة
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilteredElements(completePeriodicElements);
  };

  // الحصول على لون الخلفية حسب نوع العنصر
  const getElementColor = (type: ElementType) => {
    const group = elementGroups.find(g => g.type === type);
    return group?.color || 'bg-gray-400/70';
  };

  // ترتيب العناصر في شبكة الجدول الدوري
  const createPeriodicGrid = () => {
    // إنشاء شبكة 18 × 10 (7 دورات رئيسية + 2 للانثانيدات والأكتينيدات + 1 فراغ)
    const grid = Array(10).fill(null).map(() => Array(18).fill(null));
    
    completePeriodicElements.forEach(element => {
      let row = element.period - 1;
      let col = element.group - 1;

      // معالجة اللانثانيدات (57-71)
      if (element.atomic_number >= 57 && element.atomic_number <= 71) {
        row = 8; // الصف الثامن
        col = element.atomic_number - 57 + 3; // بدءً من العمود 3
      }
      // معالجة الأكتينيدات (89-103)
      else if (element.atomic_number >= 89 && element.atomic_number <= 103) {
        row = 9; // الصف التاسع
        col = element.atomic_number - 89 + 3; // بدءً من العمود 3
      }
      // معالجة عناصر المجموعة 18 (الغازات النبيلة)
      else if (element.group === 18) {
        col = 17;
      }
      // معالجة الهيدروجين (مجموعة خاصة)
      else if (element.atomic_number === 1) {
        row = 0;
        col = 0;
      }
      // معالجة الهيليوم
      else if (element.atomic_number === 2) {
        row = 0;
        col = 17;
      }

      if (row >= 0 && row < 10 && col >= 0 && col < 18) {
        grid[row][col] = element;
      }
    });

    return grid;
  };

  const periodicGrid = createPeriodicGrid();

  return (
    <div className="w-full">
      {/* شريط البحث والفلاتر */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="ابحث عن عنصر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/30 text-white backdrop-blur-lg"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-400" />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Filter className="h-4 w-4 mr-2" />
                فلترة حسب النوع
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-blue-900/90 border-cyan-500/30 backdrop-blur-xl">
              <div className="space-y-2">
                {elementGroups.map((group) => (
                  <Button
                    key={group.type}
                    variant={filterType === group.type ? "default" : "outline"}
                    className={`w-full justify-start ${filterType === group.type ? 'bg-cyan-600' : 'bg-blue-800/50 border-cyan-500/30'}`}
                    onClick={() => setFilterType(group.type as ElementType)}
                  >
                    <div className={`w-3 h-3 rounded-full ${group.color} mr-2`}></div>
                    {group.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            onClick={resetFilters}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-800/30"
          >
            <FilterX className="h-5 w-5" />
          </Button>
        </div>

        {/* مفتاح الألوان */}
        <div className="flex flex-wrap gap-2 justify-center">
          {elementGroups.map((group) => (
            <div 
              key={group.type} 
              className="flex items-center text-sm cursor-pointer px-3 py-1 rounded-full hover:bg-blue-900/30 transition-colors" 
              onClick={() => setFilterType(group.type as ElementType)}
            >
              <div className={`w-3 h-3 rounded-full ${group.color} ml-2`}></div>
              <span className="text-white/80 text-xs">{group.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* الجدول الدوري */}
      <div className="overflow-x-auto">
        <div className="min-w-[1400px] mx-auto">
          <div className="grid grid-cols-18 gap-1 p-4">
            {periodicGrid.map((row, rowIndex) => (
              row.map((element, colIndex) => {
                if (!element) {
                  return (
                    <div 
                      key={`empty-${rowIndex}-${colIndex}`} 
                      className="w-16 h-16"
                    ></div>
                  );
                }

                // إخفاء العنصر إذا لم يطابق الفلتر
                const isVisible = filteredElements.some(e => e.symbol === element.symbol);
                
                if (!isVisible) {
                  return (
                    <div 
                      key={`hidden-${element.symbol}`} 
                      className="w-16 h-16 opacity-20"
                    ></div>
                  );
                }

                return (
                  <motion.div
                    key={element.symbol}
                    className={`w-16 h-16 rounded-lg cursor-pointer p-1 ${getElementColor(element.type)} backdrop-blur-sm relative border border-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-200`}
                    onClick={() => setSelectedElement(element)}
                    onMouseEnter={() => setHoverElement(element)}
                    onMouseLeave={() => setHoverElement(null)}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* العدد الذري */}
                    <div className="absolute top-0.5 left-0.5 text-[8px] font-medium text-white/90">
                      {element.atomic_number}
                    </div>
                    
                    {/* رمز العنصر */}
                    <div className="h-full flex flex-col items-center justify-center text-white">
                      <div className="text-lg font-bold leading-none">{element.symbol}</div>
                      <div className="text-[8px] mt-0.5 text-white/80 text-center truncate w-full leading-none">
                        {element.name}
                      </div>
                    </div>
                    
                    {/* Tooltip عند التمرير */}
                    {hoverElement?.symbol === element.symbol && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-20 p-3 rounded-lg min-w-[150px] text-sm -top-16 left-1/2 transform -translate-x-1/2 bg-blue-900/95 text-white border border-cyan-500/30 shadow-xl backdrop-blur-lg"
                      >
                        <div className="font-bold text-cyan-300">{element.name}</div>
                        <div className="text-xs">{element.symbol} - العدد الذري: {element.atomic_number}</div>
                        <div className="text-xs text-white/80 mt-1">
                          المجموعة {element.group} • الدورة {element.period}
                        </div>
                        <div className="text-[10px] text-cyan-300 mt-1">انقر للتفاصيل</div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ))}
          </div>

          {/* عنواين الصفوف السفلية */}
          <div className="mt-4 text-center text-white/60 space-y-1">
            <div className="text-sm">اللانثانيدات</div>
            <div className="text-sm">الأكتينيدات</div>
          </div>
        </div>
      </div>

      {/* بطاقة معلومات العنصر المختار */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedElement(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-blue-900/95 backdrop-blur-xl shadow-2xl border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {/* Header with element info */}
              <div className={`p-6 ${getElementColor(selectedElement.type)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white/80 text-sm">العدد الذري: {selectedElement.atomic_number}</div>
                    <h3 className="text-3xl font-bold text-white mb-1">{selectedElement.name}</h3>
                    <div className="text-white/90 text-lg">
                      {elementGroups.find(g => g.type === selectedElement.type)?.name}
                    </div>
                  </div>
                  <div className="text-6xl font-bold text-white/90 bg-white/10 w-20 h-20 flex items-center justify-center rounded-xl backdrop-blur-sm">
                    {selectedElement.symbol}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 text-white space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-white/70">المجموعة</div>
                    <div className="font-medium text-cyan-300">{selectedElement.group}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-white/70">الدورة</div>
                    <div className="font-medium text-cyan-300">{selectedElement.period}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-white/70">الكتلة الذرية</div>
                    <div className="font-medium text-cyan-300">{selectedElement.atomic_mass?.toFixed(2)} u</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-white/70">الحالة الفيزيائية</div>
                    <div className="font-medium text-cyan-300">
                      {selectedElement.state_at_room_temp === 'solid' && 'صلب'}
                      {selectedElement.state_at_room_temp === 'liquid' && 'سائل'}
                      {selectedElement.state_at_room_temp === 'gas' && 'غاز'}
                    </div>
                  </div>
                </div>

                {/* خصائص إضافية */}
                {(selectedElement.electronegativity || selectedElement.melting_point || selectedElement.boiling_point) && (
                  <div className="space-y-3 border-t border-white/20 pt-4">
                    <h4 className="font-semibold text-cyan-300">الخصائص الفيزيائية والكيميائية</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {selectedElement.electronegativity && (
                        <div className="flex justify-between">
                          <span className="text-white/70">السالبية الكهربائية:</span>
                          <span className="text-cyan-300">{selectedElement.electronegativity}</span>
                        </div>
                      )}
                      {selectedElement.melting_point && (
                        <div className="flex justify-between">
                          <span className="text-white/70">نقطة الانصهار:</span>
                          <span className="text-cyan-300">{selectedElement.melting_point}°C</span>
                        </div>
                      )}
                      {selectedElement.boiling_point && (
                        <div className="flex justify-between">
                          <span className="text-white/70">نقطة الغليان:</span>
                          <span className="text-cyan-300">{selectedElement.boiling_point}°C</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* الاستخدامات */}
                <div className="space-y-2 border-t border-white/20 pt-4">
                  <div className="text-sm text-white/70">الاستخدامات</div>
                  <p className="text-sm leading-relaxed">{selectedElement.usage}</p>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedElement(null)}
                    className="border-cyan-500/30 hover:bg-blue-800/50 text-white"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* معلومات حول الجدول */}
      <div className="mt-6 p-4 rounded-lg border border-cyan-500/20 bg-blue-900/30 flex items-start gap-3">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-cyan-400" />
        <p className="text-sm text-white/80">
          يحتوي هذا الجدول الدوري على جميع العناصر الـ 118 المعروفة، مرتبة حسب أعدادها الذرية وموزعة في 18 مجموعة و 7 دورات. 
          اللانثانيدات والأكتينيدات معروضة في الصفوف السفلية. انقر على أي عنصر لعرض تفاصيله الكاملة.
        </p>
      </div>
    </div>
  );
};

export default CompletePeriodicTable;
