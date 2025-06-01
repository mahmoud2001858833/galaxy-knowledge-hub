
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AtomData } from '@/types/atom';

interface ParticleControlsProps {
  atomData: AtomData;
  onAddParticle: (type: 'proton' | 'neutron' | 'electron') => void;
  onRemoveParticle: (type: 'proton' | 'neutron' | 'electron') => void;
}

export const ParticleControls: React.FC<ParticleControlsProps> = ({
  atomData,
  onAddParticle,
  onRemoveParticle
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-green-300 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          إضافة الجسيمات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* البروتونات */}
        <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-red-300 font-bold">البروتونات (P+)</span>
            <Badge className="bg-red-600 text-white">{atomData.protons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('proton')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('proton')}
              disabled={atomData.protons === 0}
              variant="outline"
              className="flex-1 text-xs"
            >
              <Minus className="w-3 h-3 mr-1" />
              حذف
            </Button>
          </div>
        </div>

        {/* النيوترونات */}
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-500/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 font-bold">النيوترونات (n°)</span>
            <Badge className="bg-gray-600 text-white">{atomData.neutrons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('neutron')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('neutron')}
              disabled={atomData.neutrons === 0}
              variant="outline"
              className="flex-1 text-xs"
            >
              <Minus className="w-3 h-3 mr-1" />
              حذف
            </Button>
          </div>
        </div>

        {/* الإلكترونات */}
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-300 font-bold">الإلكترونات (e-)</span>
            <Badge className="bg-blue-600 text-white">{atomData.electrons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('electron')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('electron')}
              disabled={atomData.electrons === 0}
              variant="outline"
              className="flex-1 text-xs"
            >
              <Minus className="w-3 h-3 mr-1" />
              حذف
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
