
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FilterX, Filter, Sun, Moon, Info, Atom } from 'lucide-react';
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
import { 
  periodicElements, 
  getElementByName, 
  getElementsByType, 
  getElementsByState,
  getElementsByGroup,
  getElementsByPeriod
} from '@/data/periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';

const SmartPeriodicTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterType, setFilterType] = useState<ElementType | null>(null);
  const [filteredElements, setFilteredElements] = useState(periodicElements);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hoverElement, setHoverElement] = useState<Element | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // فلترة العناصر بناءً على البحث والفلتر المحدد
  useEffect(() => {
    let result = [...periodicElements];
    
    if (searchTerm) {
      result = periodicElements.filter(element => 
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (filterType) {
      result = getElementsByType(filterType);
    }
    
    setFilteredElements(result);
  }, [searchTerm, filterType]);

  // التبديل بين الوضع الليلي والنهاري
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // إعادة ضبط الفلترة
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilteredElements(periodicElements);
  };

  // الحصول على لون الخلفية حسب نوع العنصر
  const getElementColor = (type: ElementType) => {
    const group = elementGroups.find(g => g.type === type);
    return group?.color || 'bg-gray-400/70';
  };

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-950/40' : 'bg-blue-50/80'} backdrop-blur-lg border ${isDarkMode ? 'border-cyan-500/20' : 'border-cyan-300/30'} shadow-xl transition-colors duration-300`}>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'} flex items-center`}>
            <Atom className="mr-2 h-6 w-6 text-cyan-400" />
            الجدول الدوري الذكي
          </h2>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-xs">
              <Input
                type="text"
                placeholder="ابحث عن عنصر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isDarkMode ? 'bg-blue-900/30 text-white border-cyan-500/30' : 'bg-white/80 text-blue-900 border-blue-200'}`}
              />
              <Search className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`${isDarkMode ? 'bg-blue-900/30 text-white border-cyan-500/30 hover:bg-blue-800/50' : 'bg-white/80 text-blue-900 border-blue-200 hover:bg-blue-50'}`}>
                  <Filter className="h-4 w-4 mr-2" />
                  فلترة
                </Button>
              </PopoverTrigger>
              <PopoverContent className={`w-64 p-0 ${isDarkMode ? 'bg-blue-900/90 border-cyan-500/30' : 'bg-white border-blue-200'}`}>
                <Tabs defaultValue="type">
                  <TabsList className="w-full">
                    <TabsTrigger value="type">النوع</TabsTrigger>
                    <TabsTrigger value="state">الحالة</TabsTrigger>
                    <TabsTrigger value="group">المجموعة</TabsTrigger>
                  </TabsList>
                  <TabsContent value="type" className="p-4 space-y-2">
                    {elementGroups.map((group) => (
                      <Button
                        key={group.type}
                        variant={filterType === group.type ? "default" : "outline"}
                        className={`w-full justify-start mb-1 ${filterType === group.type ? 'bg-cyan-600' : isDarkMode ? 'bg-blue-800/50 border-cyan-500/30' : 'bg-white/90'}`}
                        onClick={() => setFilterType(group.type as ElementType)}
                      >
                        <div className={`w-3 h-3 rounded-full ${group.color} mr-2`}></div>
                        {group.name}
                      </Button>
                    ))}
                  </TabsContent>
                  <TabsContent value="state" className="p-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start mb-1"
                      onClick={() => {
                        setFilteredElements(getElementsByState('solid'));
                        setFilterType(null);
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                      صلب
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start mb-1"
                      onClick={() => {
                        setFilteredElements(getElementsByState('liquid'));
                        setFilterType(null);
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                      سائل
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start mb-1"
                      onClick={() => {
                        setFilteredElements(getElementsByState('gas'));
                        setFilterType(null);
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
                      غاز
                    </Button>
                  </TabsContent>
                  <TabsContent value="group" className="p-4 space-y-2 max-h-60 overflow-auto">
                    {[...Array(18)].map((_, i) => (
                      <Button
                        key={`group-${i+1}`}
                        variant="outline"
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          setFilteredElements(getElementsByGroup(i+1));
                          setFilterType(null);
                        }}
                      >
                        المجموعة {i+1}
                      </Button>
                    ))}
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className={isDarkMode ? 'text-cyan-400 hover:text-cyan-300 hover:bg-blue-800/30' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50'}
            >
              <FilterX className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-cyan-400 hover:text-cyan-300 hover:bg-blue-800/30' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {elementGroups.map((group) => (
            <div 
              key={group.type} 
              className="flex items-center text-sm cursor-pointer px-2 py-1 rounded-full hover:bg-blue-900/30 transition-colors" 
              onClick={() => setFilterType(group.type as ElementType)}
            >
              <div className={`w-3 h-3 rounded-full ${group.color} ml-1`}></div>
              <span className={isDarkMode ? 'text-white/80' : 'text-blue-900/80'}>
                {group.name}
              </span>
            </div>
          ))}
        </div>
        
        <div className="overflow-auto p-2 rounded-lg border border-cyan-500/20 bg-blue-950/20 backdrop-blur-sm" ref={tableRef}>
          <div className="grid grid-cols-18 gap-1 min-w-[1000px]">
            {/* يتم إنشاء شبكة الجدول الدوري هنا - 18 عمود × 7 صفوف */}
            {Array.from({ length: 7 }).map((_, periodIndex) => (
              <React.Fragment key={`period-${periodIndex + 1}`}>
                {Array.from({ length: 18 }).map((_, groupIndex) => {
                  // البحث عن عنصر في هذه الموقع (إذا وجد)
                  const element = periodicElements.find(
                    el => el.position?.x === groupIndex && el.position?.y === periodIndex
                  );
                  
                  // تخطي الخلايا الفارغة التي لا تحتوي على عنصر
                  if (!element) {
                    return <div key={`empty-${groupIndex}-${periodIndex}`} className="aspect-square"></div>;
                  }
                  
                  // إظهار العنصر فقط إذا كان مطابقاً للفلتر أو لم يتم تحديد فلتر
                  const isVisible = filteredElements.some(e => e.symbol === element.symbol);
                  
                  if (!isVisible) {
                    return <div key={`hidden-${element.symbol}`} className="aspect-square"></div>;
                  }
                  
                  return (
                    <motion.div
                      key={element.symbol}
                      className={`aspect-square rounded-lg cursor-pointer p-1 ${getElementColor(element.type)} backdrop-blur-sm relative border ${isDarkMode ? 'border-white/10' : 'border-black/10'} hover:shadow-lg transition-all duration-200`}
                      onClick={() => setSelectedElement(element)}
                      onMouseEnter={() => setHoverElement(element)}
                      onMouseLeave={() => setHoverElement(null)}
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute top-1 left-1 text-xs font-medium text-white/90">
                        {element.atomic_number}
                      </div>
                      <div className="h-full flex flex-col items-center justify-center text-white">
                        <div className="text-xl font-bold">{element.symbol}</div>
                        <div className="text-xs mt-1 text-white/80 text-center truncate w-full">
                          {element.name}
                        </div>
                      </div>
                      
                      {/* Tooltip عند تمرير المؤشر */}
                      {hoverElement?.symbol === element.symbol && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`absolute z-10 p-2 rounded-md min-w-[120px] text-xs -top-14 left-1/2 transform -translate-x-1/2 ${isDarkMode ? 'bg-blue-900/95 text-white' : 'bg-white/95 text-blue-900'} border ${isDarkMode ? 'border-cyan-500/30' : 'border-blue-200'} shadow-lg`}
                        >
                          <div className="font-bold">{element.name}</div>
                          <div>{element.symbol} - {element.atomic_number}</div>
                          <div className="text-[10px] opacity-80">انقر للتفاصيل</div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
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
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div
                className={`relative max-w-md w-full rounded-xl overflow-hidden ${isDarkMode ? 'bg-blue-900/90' : 'bg-white/90'} backdrop-blur-xl shadow-2xl border ${isDarkMode ? 'border-cyan-500/30' : 'border-blue-200/70'}`}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className={`p-6 ${getElementColor(selectedElement.type)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white/80 text-sm">العدد الذري: {selectedElement.atomic_number}</div>
                      <h3 className="text-3xl font-bold text-white">{selectedElement.name}</h3>
                      <div className="mt-1 text-white/90">
                        {elementGroups.find(g => g.type === selectedElement.type)?.name}
                      </div>
                    </div>
                    <div className="text-5xl font-bold text-white/90 bg-white/10 w-16 h-16 flex items-center justify-center rounded-lg backdrop-blur-sm">{selectedElement.symbol}</div>
                  </div>
                </div>
                
                <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-sm opacity-70">المجموعة</div>
                      <div className="font-medium">{selectedElement.group}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm opacity-70">الدورة</div>
                      <div className="font-medium">{selectedElement.period}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm opacity-70">الحالة الفيزيائية</div>
                      <div className="font-medium">
                        {selectedElement.state_at_room_temp === 'solid' && 'صلب'}
                        {selectedElement.state_at_room_temp === 'liquid' && 'سائل'}
                        {selectedElement.state_at_room_temp === 'gas' && 'غاز'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm opacity-70">الاستخدامات</div>
                    <p>{selectedElement.usage}</p>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                    className="mt-6 flex justify-end"
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedElement(null)}
                      className={`${isDarkMode ? 'border-cyan-500/30 hover:bg-blue-800/50' : 'border-blue-200 hover:bg-blue-50'} px-6`}
                    >
                      إغلاق
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* عنصر للمعلومات حول الجدول الدوري */}
        <div className={`mt-4 p-4 rounded-lg border ${isDarkMode ? 'border-cyan-500/20 bg-blue-900/30' : 'border-blue-200 bg-white/50'} flex items-start gap-3`}>
          <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-blue-900/80'}`}>
            يمثل الجدول الدوري للعناصر الكيميائية ترتيبًا منهجيًا للعناصر وفقًا لخصائصها الكيميائية والفيزيائية. يمكنك البحث عن العناصر أو تصفيتها حسب نوعها أو حالتها. انقر على أي عنصر للحصول على معلومات إضافية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartPeriodicTable;
