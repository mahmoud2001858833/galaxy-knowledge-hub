
import React from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AtomData } from '@/types/atom';

interface ElectronConfigurationProps {
  atomData: AtomData;
}

export const ElectronConfiguration: React.FC<ElectronConfigurationProps> = ({ atomData }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-blue-300 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          التوزيع الإلكتروني
        </CardTitle>
      </CardHeader>
      <CardContent>
        {atomData.electronConfiguration ? (
          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <div className="text-sm font-mono text-white">{atomData.electronConfiguration}</div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            لا يوجد إلكترونات لعرض التوزيع
          </div>
        )}
      </CardContent>
    </Card>
  );
};
