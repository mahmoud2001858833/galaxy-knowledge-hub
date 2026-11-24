
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
            <Badge className="bg-red-600 text-white" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>{atomData.protons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('proton')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-xs font-bold shadow-sm"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('proton')}
              disabled={atomData.protons === 0}
              variant="outline"
              className="flex-1 text-xs font-semibold border-red-400/50"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              حذف
            </Button>
          </div>
        </div>

        {/* النيوترونات */}
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-500/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 font-bold">النيوترونات (n°)</span>
            <Badge className="bg-slate-600 text-white" style={{ backgroundColor: '#475569', color: '#ffffff' }}>{atomData.neutrons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('neutron')}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-xs font-bold shadow-sm"
              style={{ backgroundColor: '#334155', color: '#ffffff' }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('neutron')}
              disabled={atomData.neutrons === 0}
              variant="outline"
              className="flex-1 text-xs font-semibold border-slate-400/50"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              حذف
            </Button>
          </div>
        </div>

        {/* الإلكترونات */}
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-300 font-bold">الإلكترونات (e-)</span>
            <Badge className="bg-blue-700 text-white" style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}>{atomData.electrons}</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onAddParticle('electron')}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-xs font-bold shadow-sm"
              style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              إضافة
            </Button>
            <Button 
              onClick={() => onRemoveParticle('electron')}
              disabled={atomData.electrons === 0}
              variant="outline"
              className="flex-1 text-xs font-semibold border-blue-400/50"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              حذف
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
