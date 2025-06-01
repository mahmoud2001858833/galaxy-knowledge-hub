
import React from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SUGGESTED_ELEMENTS } from '@/types/atom';
import type { SuggestedElement } from '@/types/atom';

interface SuggestedElementsProps {
  selectedElement: SuggestedElement | null;
  onBuildElement: (element: SuggestedElement) => void;
}

export const SuggestedElements: React.FC<SuggestedElementsProps> = ({
  selectedElement,
  onBuildElement
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-green-300 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          العناصر المقترحة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {SUGGESTED_ELEMENTS.map((element) => (
          <motion.div
            key={element.symbol}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => onBuildElement(element)}
              className={`w-full justify-start text-left p-3 h-auto ${
                selectedElement?.symbol === element.symbol
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/20'
              }`}
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{element.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{element.symbol}</span>
                    <span className="text-sm opacity-90">{element.name}</span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {element.protons}p, {element.neutrons}n, {element.electrons}e
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
