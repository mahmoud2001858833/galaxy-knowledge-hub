
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { autoDistributeElectrons } from '@/utils/atomCalculations';
import type { AtomData, Particle } from '@/types/atom';

interface AdvancedControlsProps {
  atomData: AtomData;
  particles: Particle[];
  onParticlesChange: (particles: Particle[]) => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  atomData,
  particles,
  onParticlesChange
}) => {
  // التوزيع التلقائي للعنصر الحالي
  const handleAutoDistribute = () => {
    if (atomData.protons > 0) {
      const newParticles = autoDistributeElectrons(atomData.protons);
      onParticlesChange(newParticles);
    }
  };

  // إعادة توزيع الإلكترونات فقط
  const handleRedistributeElectrons = () => {
    const nucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron');
    const electronCount = particles.filter(p => p.type === 'electron').length;
    
    // إنشاء إلكترونات جديدة بالتوزيع الصحيح
    const newElectrons: Particle[] = [];
    for (let i = 0; i < electronCount; i++) {
      const electron: Particle = {
        id: `electron-${Date.now()}-${i}`,
        type: 'electron',
        x: 0,
        y: 0,
        orbitalLevel: 0,
        angle: 0,
        isLocked: false
      };
      newElectrons.push(electron);
    }
    
    // دمج النوكليونات مع الإلكترونات الجديدة وإعادة التنظيم
    const allParticles = [...nucleons, ...newElectrons];
    const reorganizedParticles = autoDistributeElectrons(atomData.protons);
    
    // الحفاظ على النوكليونات الحالية وإضافة الإلكترونات المعاد توزيعها
    const finalParticles = [
      ...nucleons,
      ...reorganizedParticles.filter(p => p.type === 'electron').slice(0, electronCount)
    ];
    
    onParticlesChange(finalParticles);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-cyan-300 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          التحكم المتقدم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* حالة التوزيع */}
        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
          <span className="text-sm text-gray-300">حالة التوزيع:</span>
          <Badge 
            variant={atomData.isValid ? "default" : "destructive"}
            className={atomData.isValid ? "bg-green-600" : "bg-red-600"}
          >
            {atomData.isValid ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                صحيح
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                خاطئ
              </>
            )}
          </Badge>
        </div>

        {/* التحذيرات */}
        {atomData.warnings.length > 0 && (
          <Alert className="bg-yellow-900/30 border-yellow-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              <div className="font-bold mb-1">تحذيرات:</div>
              <ul className="text-xs space-y-1">
                {atomData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* أزرار التحكم */}
        <div className="space-y-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAutoDistribute}
              disabled={atomData.protons === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              توزيع تلقائي للعنصر ({atomData.symbol})
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleRedistributeElectrons}
              disabled={atomData.electrons === 0}
              variant="outline"
              className="w-full bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
            >
              <Zap className="w-4 h-4 mr-2" />
              إعادة توزيع الإلكترونات فقط
            </Button>
          </motion.div>
        </div>

        {/* معلومات سريعة */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-900/30 p-2 rounded border border-red-500/30">
            <div className="text-red-300 font-bold">البروتونات</div>
            <div className="text-white">{atomData.protons}</div>
          </div>
          <div className="bg-gray-900/30 p-2 rounded border border-gray-500/30">
            <div className="text-gray-300 font-bold">النيوترونات</div>
            <div className="text-white">{atomData.neutrons}</div>
          </div>
          <div className="bg-blue-900/30 p-2 rounded border border-blue-500/30">
            <div className="text-blue-300 font-bold">الإلكترونات</div>
            <div className="text-white">{atomData.electrons}</div>
          </div>
          <div className={`p-2 rounded border ${
            atomData.charge === 0 ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'
          }`}>
            <div className={`font-bold ${atomData.charge === 0 ? 'text-green-300' : 'text-red-300'}`}>
              الشحنة
            </div>
            <div className="text-white">
              {atomData.charge > 0 ? `+${atomData.charge}` : atomData.charge}
            </div>
          </div>
        </div>

        {/* نصائح */}
        <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
          <div className="text-purple-300 font-bold text-xs mb-2">💡 نصائح:</div>
          <ul className="text-xs text-purple-200 space-y-1">
            <li>• المستوى الأول يتسع لـ 2 إلكترون</li>
            <li>• المستوى الثاني يتسع لـ 8 إلكترونات</li>
            <li>• المستوى الثالث يتسع لـ 18 إلكترون</li>
            <li>• عدد البروتونات = عدد الإلكترونات (ذرة متعادلة)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
