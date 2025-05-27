
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
import { 
  periodicElements, 
  getElementByName, 
  getElementsByType, 
  getElementsByState,
  getElementsByGroup,
  getElementsByPeriod
} from '@/data/periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';
import ElementComparison from './ElementComparison';

const EnhancedPeriodicTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterType, setFilterType] = useState<ElementType | null>(null);
  const [filteredElements, setFilteredElements] = useState(periodicElements);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hoverElement, setHoverElement] = useState<Element | null>(null);
  const [activeTab, setActiveTab] = useState('table');

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

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilteredElements(periodicElements);
  };

  const getElementColor = (type: ElementType) => {
    const group = elementGroups.find(g => g.type === type);
    return group?.color || 'bg-gray-400/70';
  };

  const getStateIcon = (state?: string) => {
    switch (state) {
      case 'solid': return '🟤';
      case 'liquid': return '💧';
      case 'gas': return '💨';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 backdrop-blur-xl">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            الجدول الدوري التفاعلي
          </h1>
          <p className="text-white/70 text-center">استكشف العناصر الكيميائية وقارن بين خصائصها</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border border-white/20">
            <TabsTrigger value="table" className="data-[state=active]:bg-cyan-500/30">
              <Atom className="h-4 w-4 mr-2" />
              الجدول الدوري
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-500/30">
              <Target className="h-4 w-4 mr-2" />
              مقارنة العناصر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
              {/* أدوات البحث والفلترة */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:max-w-xs">
                    <Input
                      type="text"
                      placeholder="ابحث عن عنصر..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 text-white border-white/20 backdrop-blur-sm placeholder:text-white/50"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-400" />
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        فلترة
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 bg-white/10 backdrop-blur-xl border-white/20">
                      <div className="p-4 space-y-2">
                        {elementGroups.map((group) => (
                          <Button
                            key={group.type}
                            variant={filterType === group.type ? "default" : "outline"}
                            className={`w-full justify-start mb-1 ${filterType === group.type ? 'bg-cyan-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
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
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                  >
                    <FilterX className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* مفتاح الألوان */}
              <div className="mb-6 flex flex-wrap gap-2 justify-center">
                {elementGroups.map((group) => (
                  <Badge 
                    key={group.type} 
                    className={`${group.color} text-white border-none cursor-pointer hover:scale-105 transition-transform backdrop-blur-sm`}
                    onClick={() => setFilterType(group.type as ElementType)}
                  >
                    {group.name}
                  </Badge>
                ))}
              </div>
              
              {/* الجدول الدوري */}
              <div className="overflow-auto p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="grid grid-cols-18 gap-1 min-w-[1200px]">
                  {Array.from({ length: 10 }).map((_, periodIndex) => (
                    <React.Fragment key={`period-${periodIndex + 1}`}>
                      {Array.from({ length: 18 }).map((_, groupIndex) => {
                        const element = periodicElements.find(
                          el => el.position?.x === groupIndex && el.position?.y === periodIndex
                        );
                        
                        if (!element) {
                          return <div key={`empty-${groupIndex}-${periodIndex}`} className="aspect-square"></div>;
                        }
                        
                        const isVisible = filteredElements.some(e => e.symbol === element.symbol);
                        
                        if (!isVisible) {
                          return <div key={`hidden-${element.symbol}`} className="aspect-square opacity-20">
                            <div className={`aspect-square rounded-lg p-1 ${getElementColor(element.type)} backdrop-blur-sm border border-white/10`}>
                              <div className="h-full flex flex-col items-center justify-center text-white/30">
                                <div className="text-lg font-bold">{element.symbol}</div>
                              </div>
                            </div>
                          </div>;
                        }
                        
                        return (
                          <motion.div
                            key={element.symbol}
                            className={`aspect-square rounded-lg cursor-pointer p-1 ${getElementColor(element.type)} backdrop-blur-lg relative border border-white/20 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105`}
                            onClick={() => setSelectedElement(element)}
                            onMouseEnter={() => setHoverElement(element)}
                            onMouseLeave={() => setHoverElement(null)}
                            whileHover={{ y: -2 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: (periodIndex + groupIndex) * 0.01 }}
                          >
                            <div className="absolute top-1 left-1 text-xs font-medium text-white/90">
                              {element.atomic_number}
                            </div>
                            <div className="absolute top-1 right-1 text-xs">
                              {getStateIcon(element.state_at_room_temp)}
                            </div>
                            <div className="h-full flex flex-col items-center justify-center text-white">
                              <div className="text-xl font-bold drop-shadow-lg">{element.symbol}</div>
                              <div className="text-xs mt-1 text-white/90 text-center truncate w-full px-1">
                                {element.name}
                              </div>
                              {element.atomic_mass && (
                                <div className="text-xs text-white/70">{element.atomic_mass.toFixed(1)}</div>
                              )}
                            </div>
                            
                            {/* Tooltip محسن */}
                            {hoverElement?.symbol === element.symbol && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute z-20 p-3 rounded-lg min-w-[180px] text-xs -top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white border border-cyan-500/30 shadow-xl"
                              >
                                <div className="font-bold text-cyan-400">{element.name}</div>
                                <div className="text-white/90">{element.symbol} - العدد الذري: {element.atomic_number}</div>
                                {element.atomic_mass && <div className="text-white/70">الكتلة الذرية: {element.atomic_mass}</div>}
                                {element.electronegativity && <div className="text-white/70">السالبية: {element.electronegativity}</div>}
                                <div className="text-cyan-300 text-xs mt-1">انقر للمزيد</div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <ElementComparison />
          </TabsContent>
        </Tabs>

        {/* نافذة تفاصيل العنصر المحسنة */}
        <AnimatePresence>
          {selectedElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedElement(null)}
            >
              <motion.div
                className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 15 }}
              >
                {/* Header with gradient */}
                <div className={`p-6 ${getElementColor(selectedElement.type)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <div className="text-white/80 text-sm mb-1">العدد الذري: {selectedElement.atomic_number}</div>
                      <h3 className="text-4xl font-bold text-white mb-2">{selectedElement.name}</h3>
                      <div className="text-white/90 text-lg">
                        {elementGroups.find(g => g.type === selectedElement.type)?.name}
                      </div>
                      {selectedElement.atomic_mass && (
                        <div className="text-white/80 text-sm mt-1">الكتلة الذرية: {selectedElement.atomic_mass} u</div>
                      )}
                    </div>
                    <div className="text-6xl font-bold text-white/90 bg-white/10 w-20 h-20 flex items-center justify-center rounded-xl backdrop-blur-sm shadow-lg">
                      {selectedElement.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* الخصائص الأساسية */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-cyan-400 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        المعلومات الأساسية
                      </h4>
                      <div className="space-y-2 bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-white/70">المجموعة:</span>
                          <span>{selectedElement.group}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">الدورة:</span>
                          <span>{selectedElement.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">الحالة الفيزيائية:</span>
                          <span className="flex items-center">
                            {getStateIcon(selectedElement.state_at_room_temp)}
                            <span className="mr-2">
                              {selectedElement.state_at_room_temp === 'solid' && 'صلب'}
                              {selectedElement.state_at_room_temp === 'liquid' && 'سائل'}
                              {selectedElement.state_at_room_temp === 'gas' && 'غاز'}
                            </span>
                          </span>
                        </div>
                        {selectedElement.electron_configuration && (
                          <div className="flex justify-between">
                            <span className="text-white/70">التوزيع الإلكتروني:</span>
                            <span className="text-xs">{selectedElement.electron_configuration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* الخصائص الكيميائية */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-purple-400 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        الخصائص الكيميائية
                      </h4>
                      <div className="space-y-2 bg-white/5 p-4 rounded-lg">
                        {selectedElement.electronegativity && (
                          <div className="flex justify-between">
                            <span className="text-white/70">السالبية الكهربائية:</span>
                            <span>{selectedElement.electronegativity}</span>
                          </div>
                        )}
                        {selectedElement.ionization_energy && (
                          <div className="flex justify-between">
                            <span className="text-white/70">طاقة التأين:</span>
                            <span>{selectedElement.ionization_energy} kJ/mol</span>
                          </div>
                        )}
                        {selectedElement.electron_affinity && (
                          <div className="flex justify-between">
                            <span className="text-white/70">الألفة الإلكترونية:</span>
                            <span>{selectedElement.electron_affinity} kJ/mol</span>
                          </div>
                        )}
                        {selectedElement.atomic_radius && (
                          <div className="flex justify-between">
                            <span className="text-white/70">نصف القطر الذري:</span>
                            <span>{selectedElement.atomic_radius} pm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* الاستخدامات */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-green-400 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      الاستخدامات والتطبيقات
                    </h4>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-white/90 leading-relaxed">{selectedElement.usage}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedElement(null)}
                      className="border-white/20 hover:bg-white/10 text-white px-6"
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
    </div>
  );
};

export default EnhancedPeriodicTable;
