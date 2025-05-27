
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Atom, Target, Zap, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';

const CompletePeriodicTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterType, setFilterType] = useState<ElementType | null>(null);
  const [filteredElements, setFilteredElements] = useState(completePeriodicElements);
  const [hoverElement, setHoverElement] = useState<Element | null>(null);

  useEffect(() => {
    let result = [...completePeriodicElements];
    
    if (searchTerm) {
      result = completePeriodicElements.filter(element => 
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.atomic_number.toString().includes(searchTerm)
      );
    } else if (filterType) {
      result = completePeriodicElements.filter(element => element.type === filterType);
    }
    
    setFilteredElements(result);
  }, [searchTerm, filterType]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilteredElements(completePeriodicElements);
  };

  const getElementColor = (type: ElementType) => {
    const group = elementGroups.find(g => g.type === type);
    return group?.color || 'bg-gray-400/70';
  };

  const getStateIcon = (state?: string) => {
    switch (state) {
      case 'solid': return '⚪';
      case 'liquid': return '💧';
      case 'gas': return '💨';
      default: return '❓';
    }
  };

  const isElementVisible = (element: Element) => {
    return filteredElements.some(e => e.symbol === element.symbol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* خلفية زجاجية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-blue-500/10 to-purple-500/5 backdrop-blur-3xl" />
      
      <div className="relative z-10 p-4">
        {/* الهيدر */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            الجدول الدوري التفاعلي
          </h1>
          <p className="text-xl text-white/80">استكشف جميع العناصر الـ 118 بتصميم زجاجي أنيق</p>
        </motion.div>

        {/* أدوات البحث والفلترة */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث عن عنصر أو رقم ذري..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder:text-white/50 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          </div>
          
          <Button 
            variant="outline"
            onClick={resetFilters}
            className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
        </motion.div>

        {/* مفتاح الألوان */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="mb-8 flex flex-wrap gap-3 justify-center"
        >
          {elementGroups.map((group, index) => (
            <motion.div
              key={group.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.1 } }}
            >
              <Badge 
                className={`${group.color} text-white border-none cursor-pointer hover:scale-110 transition-all duration-300 backdrop-blur-sm px-4 py-2 text-sm shadow-lg`}
                onClick={() => setFilterType(group.type === filterType ? null : group.type as ElementType)}
              >
                {group.name}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* الجدول الدوري */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.4 } }}
          className="overflow-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
        >
          <div className="grid grid-cols-18 gap-1 min-w-[1400px] mx-auto">
            {/* إنشاء الجدول الدوري الكامل */}
            {Array.from({ length: 10 }).map((_, periodIndex) => (
              <React.Fragment key={`period-${periodIndex}`}>
                {Array.from({ length: 18 }).map((_, groupIndex) => {
                  // البحث عن العنصر في هذا الموقع
                  const element = completePeriodicElements.find(
                    el => el.position?.x === groupIndex && el.position?.y === periodIndex
                  );
                  
                  if (!element) {
                    return (
                      <div 
                        key={`empty-${groupIndex}-${periodIndex}`} 
                        className="aspect-square min-h-[60px]"
                      />
                    );
                  }
                  
                  const isVisible = isElementVisible(element);
                  const isHovered = hoverElement?.symbol === element.symbol;
                  
                  return (
                    <motion.div
                      key={element.symbol}
                      className={`aspect-square min-h-[60px] rounded-lg cursor-pointer relative border transition-all duration-300 ${
                        isVisible 
                          ? `${getElementColor(element.type)} backdrop-blur-lg border-white/30 hover:border-white/60 hover:scale-110 hover:z-10 shadow-lg hover:shadow-2xl` 
                          : 'bg-gray-600/20 border-gray-500/20 opacity-30'
                      }`}
                      onClick={() => isVisible && setSelectedElement(element)}
                      onMouseEnter={() => isVisible && setHoverElement(element)}
                      onMouseLeave={() => setHoverElement(null)}
                      whileHover={isVisible ? { y: -5 } : {}}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: { 
                          delay: (periodIndex + groupIndex) * 0.02,
                          duration: 0.3 
                        }
                      }}
                    >
                      {/* رقم العنصر */}
                      <div className="absolute top-1 left-1 text-xs font-bold text-white/90">
                        {element.atomic_number}
                      </div>
                      
                      {/* أيقونة الحالة */}
                      <div className="absolute top-1 right-1 text-xs">
                        {getStateIcon(element.state_at_room_temp)}
                      </div>
                      
                      {/* رمز العنصر واسمه */}
                      <div className="h-full flex flex-col items-center justify-center text-white p-1">
                        <div className="text-lg font-bold drop-shadow-lg">
                          {element.symbol}
                        </div>
                        <div className="text-xs text-center text-white/90 leading-tight">
                          {element.name}
                        </div>
                        {element.atomic_mass && (
                          <div className="text-xs text-white/70 mt-1">
                            {element.atomic_mass.toFixed(1)}
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip محسن */}
                      {isHovered && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute z-50 p-4 rounded-xl min-w-[220px] text-sm -top-28 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl text-white border border-cyan-500/30 shadow-2xl"
                        >
                          <div className="font-bold text-cyan-400 text-lg mb-2">
                            {element.name}
                          </div>
                          <div className="space-y-1 text-white/90">
                            <div>الرمز: {element.symbol}</div>
                            <div>العدد الذري: {element.atomic_number}</div>
                            {element.atomic_mass && (
                              <div>الكتلة الذرية: {element.atomic_mass}</div>
                            )}
                            {element.electronegativity && (
                              <div>السالبية: {element.electronegativity}</div>
                            )}
                            <div className="text-cyan-300 text-xs mt-2">
                              انقر للمزيد من التفاصيل
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          {/* اللانثانيدات والأكتينيدات */}
          <div className="mt-8 space-y-4">
            {/* اللانثانيدات */}
            <div>
              <h3 className="text-white font-bold mb-2 text-center">اللانثانيدات</h3>
              <div className="grid grid-cols-15 gap-1 max-w-4xl mx-auto">
                {completePeriodicElements
                  .filter(el => el.type === 'lanthanide')
                  .sort((a, b) => a.atomic_number - b.atomic_number)
                  .map((element, index) => {
                    const isVisible = isElementVisible(element);
                    const isHovered = hoverElement?.symbol === element.symbol;
                    
                    return (
                      <motion.div
                        key={element.symbol}
                        className={`aspect-square min-h-[60px] rounded-lg cursor-pointer relative border transition-all duration-300 ${
                          isVisible 
                            ? `${getElementColor(element.type)} backdrop-blur-lg border-white/30 hover:border-white/60 hover:scale-110 hover:z-10 shadow-lg hover:shadow-2xl` 
                            : 'bg-gray-600/20 border-gray-500/20 opacity-30'
                        }`}
                        onClick={() => isVisible && setSelectedElement(element)}
                        onMouseEnter={() => isVisible && setHoverElement(element)}
                        onMouseLeave={() => setHoverElement(null)}
                        whileHover={isVisible ? { y: -5 } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          transition: { delay: index * 0.05, duration: 0.3 }
                        }}
                      >
                        <div className="absolute top-1 left-1 text-xs font-bold text-white/90">
                          {element.atomic_number}
                        </div>
                        <div className="h-full flex flex-col items-center justify-center text-white p-1">
                          <div className="text-lg font-bold drop-shadow-lg">
                            {element.symbol}
                          </div>
                          <div className="text-xs text-center text-white/90 leading-tight">
                            {element.name}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
            
            {/* الأكتينيدات */}
            <div>
              <h3 className="text-white font-bold mb-2 text-center">الأكتينيدات</h3>
              <div className="grid grid-cols-15 gap-1 max-w-4xl mx-auto">
                {completePeriodicElements
                  .filter(el => el.type === 'actinide')
                  .sort((a, b) => a.atomic_number - b.atomic_number)
                  .map((element, index) => {
                    const isVisible = isElementVisible(element);
                    const isHovered = hoverElement?.symbol === element.symbol;
                    
                    return (
                      <motion.div
                        key={element.symbol}
                        className={`aspect-square min-h-[60px] rounded-lg cursor-pointer relative border transition-all duration-300 ${
                          isVisible 
                            ? `${getElementColor(element.type)} backdrop-blur-lg border-white/30 hover:border-white/60 hover:scale-110 hover:z-10 shadow-lg hover:shadow-2xl` 
                            : 'bg-gray-600/20 border-gray-500/20 opacity-30'
                        }`}
                        onClick={() => isVisible && setSelectedElement(element)}
                        onMouseEnter={() => isVisible && setHoverElement(element)}
                        onMouseLeave={() => setHoverElement(null)}
                        whileHover={isVisible ? { y: -5 } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          transition: { delay: index * 0.05, duration: 0.3 }
                        }}
                      >
                        <div className="absolute top-1 left-1 text-xs font-bold text-white/90">
                          {element.atomic_number}
                        </div>
                        <div className="h-full flex flex-col items-center justify-center text-white p-1">
                          <div className="text-lg font-bold drop-shadow-lg">
                            {element.symbol}
                          </div>
                          <div className="text-xs text-center text-white/90 leading-tight">
                            {element.name}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* إحصائيات سريعة */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-cyan-400">118</div>
              <div className="text-white/80 text-sm">عنصر كيميائي</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-400">18</div>
              <div className="text-white/80 text-sm">مجموعة</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-400">7</div>
              <div className="text-white/80 text-sm">دورة</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-400">10</div>
              <div className="text-white/80 text-sm">نوع عنصر</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* نافذة تفاصيل العنصر */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedElement(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Header with gradient */}
              <div className={`p-8 ${getElementColor(selectedElement.type)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="text-white/80 text-lg mb-2">
                      العدد الذري: {selectedElement.atomic_number}
                    </div>
                    <h3 className="text-5xl font-bold text-white mb-3">
                      {selectedElement.name}
                    </h3>
                    <div className="text-white/90 text-xl">
                      {elementGroups.find(g => g.type === selectedElement.type)?.name}
                    </div>
                    {selectedElement.atomic_mass && (
                      <div className="text-white/80 text-lg mt-2">
                        الكتلة الذرية: {selectedElement.atomic_mass} u
                      </div>
                    )}
                  </div>
                  <div className="text-7xl font-bold text-white/90 bg-white/20 w-28 h-28 flex items-center justify-center rounded-2xl backdrop-blur-lg shadow-xl">
                    {selectedElement.symbol}
                  </div>
                </div>
              </div>
              
              <div className="p-8 text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* الخصائص الأساسية */}
                  <div className="space-y-4">
                    <h4 className="text-2xl font-semibold text-cyan-400 flex items-center">
                      <Atom className="h-6 w-6 mr-3" />
                      المعلومات الأساسية
                    </h4>
                    <div className="space-y-3 bg-white/5 p-6 rounded-2xl backdrop-blur-lg">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70 text-lg">المجموعة:</span>
                        <span className="text-xl font-semibold">{selectedElement.group}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70 text-lg">الدورة:</span>
                        <span className="text-xl font-semibold">{selectedElement.period}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70 text-lg">الحالة الفيزيائية:</span>
                        <span className="flex items-center text-xl font-semibold">
                          {getStateIcon(selectedElement.state_at_room_temp)}
                          <span className="mr-2">
                            {selectedElement.state_at_room_temp === 'solid' && 'صلب'}
                            {selectedElement.state_at_room_temp === 'liquid' && 'سائل'}
                            {selectedElement.state_at_room_temp === 'gas' && 'غاز'}
                          </span>
                        </span>
                      </div>
                      {selectedElement.electron_configuration && (
                        <div className="py-2">
                          <span className="text-white/70 text-lg">التوزيع الإلكتروني:</span>
                          <div className="text-lg font-mono mt-1 bg-blue-900/30 p-2 rounded">
                            {selectedElement.electron_configuration}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* الخصائص الفيزيائية والكيميائية */}
                  <div className="space-y-4">
                    <h4 className="text-2xl font-semibold text-purple-400 flex items-center">
                      <Target className="h-6 w-6 mr-3" />
                      الخصائص الفيزيائية والكيميائية
                    </h4>
                    <div className="space-y-3 bg-white/5 p-6 rounded-2xl backdrop-blur-lg">
                      {selectedElement.electronegativity && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70 text-lg">السالبية الكهربائية:</span>
                          <span className="text-xl font-semibold">{selectedElement.electronegativity}</span>
                        </div>
                      )}
                      {selectedElement.ionization_energy && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70 text-lg">طاقة التأين:</span>
                          <span className="text-xl font-semibold">{selectedElement.ionization_energy} kJ/mol</span>
                        </div>
                      )}
                      {selectedElement.atomic_radius && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70 text-lg">نصف القطر الذري:</span>
                          <span className="text-xl font-semibold">{selectedElement.atomic_radius} pm</span>
                        </div>
                      )}
                      {selectedElement.melting_point && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70 text-lg">نقطة الانصهار:</span>
                          <span className="text-xl font-semibold">{selectedElement.melting_point}°C</span>
                        </div>
                      )}
                      {selectedElement.boiling_point && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70 text-lg">نقطة الغليان:</span>
                          <span className="text-xl font-semibold">{selectedElement.boiling_point}°C</span>
                        </div>
                      )}
                      {selectedElement.density && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-white/70 text-lg">الكثافة:</span>
                          <span className="text-xl font-semibold">{selectedElement.density} g/cm³</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* الاستخدامات */}
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold text-green-400 flex items-center">
                    <Activity className="h-6 w-6 mr-3" />
                    الاستخدامات والتطبيقات
                  </h4>
                  <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg">
                    <p className="text-white/90 leading-relaxed text-lg">
                      {selectedElement.usage}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedElement(null)}
                    className="border-white/30 hover:bg-white/10 text-white px-8 py-3 text-lg bg-white/5 backdrop-blur-lg"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletePeriodicTable;
