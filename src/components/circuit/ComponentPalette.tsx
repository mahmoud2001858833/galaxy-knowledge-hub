import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, Lightbulb, ToggleLeft, Gauge, 
  CircleDot, Zap, Settings, Radio
} from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

const COMPONENT_CATEGORIES = [
  {
    name: 'المصادر',
    nameEn: 'Sources',
    color: 'bg-red-500/20 border-red-500',
    components: [
      { type: 'battery', name: 'بطارية', icon: Battery, color: '#ff6b6b' },
    ]
  },
  {
    name: 'المقاومات',
    nameEn: 'Resistors',
    color: 'bg-amber-500/20 border-amber-500',
    components: [
      { type: 'resistor', name: 'مقاومة', icon: Settings, color: '#d4a574' },
    ]
  },
  {
    name: 'الإضاءة',
    nameEn: 'Lighting',
    color: 'bg-yellow-500/20 border-yellow-500',
    components: [
      { type: 'bulb', name: 'مصباح', icon: Lightbulb, color: '#ffd93d' },
      { type: 'led', name: 'LED', icon: CircleDot, color: '#6bcb77' },
    ]
  },
  {
    name: 'التحكم',
    nameEn: 'Control',
    color: 'bg-blue-500/20 border-blue-500',
    components: [
      { type: 'switch', name: 'مفتاح', icon: ToggleLeft, color: '#4ecdc4' },
    ]
  },
  {
    name: 'التخزين',
    nameEn: 'Storage',
    color: 'bg-purple-500/20 border-purple-500',
    components: [
      { type: 'capacitor', name: 'مكثف', icon: Radio, color: '#a66cff' },
    ]
  },
  {
    name: 'القياس',
    nameEn: 'Measurement',
    color: 'bg-green-500/20 border-green-500',
    components: [
      { type: 'ammeter', name: 'أميتر', icon: Gauge, color: '#ffd93d' },
      { type: 'voltmeter', name: 'فولتميتر', icon: Gauge, color: '#ff6b6b' },
    ]
  },
  {
    name: 'المحركات',
    nameEn: 'Motors',
    color: 'bg-cyan-500/20 border-cyan-500',
    components: [
      { type: 'motor', name: 'محرك', icon: Zap, color: '#00d9ff' },
    ]
  }
];

export default function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <Card className="bg-gray-900/90 border-gray-700 p-4 h-full overflow-y-auto">
      <h3 className="text-white font-bold mb-4 text-center">🔧 المكونات</h3>
      
      <div className="space-y-4">
        {COMPONENT_CATEGORIES.map((category, catIndex) => (
          <motion.div
            key={category.nameEn}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <Badge className={`${category.color} mb-2`}>
              {category.name}
            </Badge>
            
            <div className="grid grid-cols-2 gap-2">
              {category.components.map((component) => {
                const Icon = component.icon;
                return (
                  <motion.button
                    key={component.type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddComponent(component.type)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-all"
                    style={{ borderColor: component.color + '40' }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: component.color }}
                    />
                    <span className="text-xs text-gray-300">{component.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">📋 التعليمات</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• انقر على مكون لإضافته</li>
          <li>• اسحب المكونات لتحريكها</li>
          <li>• انقر على الأطراف لرسم الأسلاك</li>
          <li>• انقر مزدوج على المفتاح للتبديل</li>
        </ul>
      </div>
    </Card>
  );
}
