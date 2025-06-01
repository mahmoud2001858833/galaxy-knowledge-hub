
import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { AtomData } from '@/types/atom';

interface AtomInfoProps {
  atomData: AtomData;
  onShowElementInfo: () => void;
}

export const AtomInfo: React.FC<AtomInfoProps> = ({ atomData, onShowElementInfo }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-yellow-300 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          العنصر المُمثل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center mb-4">
          <motion.div 
            className="text-6xl font-bold text-white mb-2 cursor-pointer hover:scale-110 transition-transform"
            onClick={onShowElementInfo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {atomData.symbol}
          </motion.div>
          <div className="text-lg text-gray-300">{atomData.element}</div>
          <Badge 
            variant={atomData.isStable ? "default" : "destructive"}
            className="mt-2"
          >
            {atomData.isStable ? 'مستقر' : 'غير مستقر'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">العدد الذري:</span>
            <Badge variant="outline">{atomData.protons}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">العدد الكتلي:</span>
            <Badge variant="outline">{atomData.massNumber}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">الشحنة:</span>
            <Badge variant={atomData.charge === 0 ? "default" : "destructive"}>
              {atomData.charge > 0 ? `+${atomData.charge}` : atomData.charge}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
