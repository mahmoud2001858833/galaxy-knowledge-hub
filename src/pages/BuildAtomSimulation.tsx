
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAtomSimulation } from '@/hooks/useAtomSimulation';
import { ParticleControls } from '@/components/atom/ParticleControls';
import { AtomInfo } from '@/components/atom/AtomInfo';
import { ElectronConfiguration } from '@/components/atom/ElectronConfiguration';
import { SuggestedElements } from '@/components/atom/SuggestedElements';
import { AtomVisualization } from '@/components/atom/AtomVisualization';
import { SmartAssistant } from '@/components/atom/SmartAssistant';
import { AdvancedControls } from '@/components/atom/AdvancedControls';
import { allElements } from '@/data/all-elements';

const BuildAtomSimulation = () => {
  const navigate = useNavigate();
  const {
    particles,
    atomData,
    selectedSuggestedElement,
    addParticle,
    removeParticle,
    buildSuggestedElement,
    clearAll,
    setParticles
  } = useAtomSimulation();

  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPosition, setAssistantPosition] = useState({ x: 20, y: 100 });
  const [showElementInfo, setShowElementInfo] = useState(false);

  // معالج سحب المساعد
  const handleAssistantDrag = (event: any, info: any) => {
    setAssistantPosition({
      x: assistantPosition.x + info.delta.x,
      y: assistantPosition.y + info.delta.y
    });
  };

  // معلومات العنصر
  const getElementInfo = () => {
    const element = allElements.find(e => e.atomic_number === atomData.protons);
    if (!element) return null;

    return {
      name: element.name,
      symbol: element.symbol,
      atomicNumber: element.atomic_number,
      period: Math.ceil(element.atomic_number / 18) || 1,
      group: element.atomic_number <= 2 ? element.atomic_number : 
             element.atomic_number <= 10 ? element.atomic_number - 2 :
             element.atomic_number <= 18 ? element.atomic_number - 10 : 1,
      category: element.type || 'غير محدد',
      electronicConfiguration: element.electron_configuration || 'غير محدد',
      uses: ['استخدامات متنوعة في الصناعة', 'تطبيقات في الطب', 'استخدامات في التكنولوجيا'],
      properties: ['خصائص فيزيائية فريدة', 'خصائص كيميائية مميزة', 'تفاعلات خاصة']
    };
  };

  const elementInfo = getElementInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/scientific-simulations')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              العودة للمحاكاة
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              محاكاة بناء الذرة المحدثة والمطورة
            </h1>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAssistant(!showAssistant)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                المساعد الذكي
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="w-4 h-4 mr-1" />
                مسح الكل
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* لوحة التحكم - الجانب الأيسر */}
          <div className="xl:col-span-1 space-y-4">
            {/* التحكم في الجسيمات */}
            <ParticleControls
              atomData={atomData}
              onAddParticle={addParticle}
              onRemoveParticle={removeParticle}
            />

            {/* التحكم المتقدم */}
            <AdvancedControls
              atomData={atomData}
              particles={particles}
              onParticlesChange={setParticles}
            />

            {/* معلومات الذرة */}
            <AtomInfo
              atomData={atomData}
              onShowElementInfo={() => setShowElementInfo(!showElementInfo)}
            />

            {/* التوزيع الإلكتروني */}
            <ElectronConfiguration atomData={atomData} />

            {/* العناصر المقترحة */}
            <SuggestedElements
              selectedElement={selectedSuggestedElement}
              onBuildElement={buildSuggestedElement}
            />
          </div>

          {/* منطقة الذرة الرئيسية */}
          <div className="xl:col-span-3">
            <AtomVisualization particles={particles} />
          </div>
        </div>
      </div>

      {/* نافذة معلومات العنصر */}
      {showElementInfo && atomData.protons > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowElementInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm p-6 rounded-lg border border-purple-500/50 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300">معلومات العنصر</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowElementInfo(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{atomData.symbol}</div>
                <div className="text-lg text-purple-300">{atomData.element}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">العدد الذري:</span>
                  <span className="text-white ml-2">{atomData.protons}</span>
                </div>
                <div>
                  <span className="text-gray-300">العدد الكتلي:</span>
                  <span className="text-white ml-2">{atomData.massNumber}</span>
                </div>
                <div>
                  <span className="text-gray-300">البروتونات:</span>
                  <span className="text-red-400 ml-2">{atomData.protons}</span>
                </div>
                <div>
                  <span className="text-gray-300">النيوترونات:</span>
                  <span className="text-gray-400 ml-2">{atomData.neutrons}</span>
                </div>
                <div>
                  <span className="text-gray-300">الإلكترونات:</span>
                  <span className="text-blue-400 ml-2">{atomData.electrons}</span>
                </div>
                <div>
                  <span className="text-gray-300">الشحنة:</span>
                  <span className={`ml-2 ${atomData.charge === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {atomData.charge > 0 ? `+${atomData.charge}` : atomData.charge}
                  </span>
                </div>
              </div>
              
              {atomData.electronConfiguration && (
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-2">التوزيع الإلكتروني:</h4>
                  <p className="text-sm text-gray-300 bg-blue-900/20 p-3 rounded font-mono">
                    {atomData.electronConfiguration}
                  </p>
                </div>
              )}

              {atomData.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-yellow-300 mb-2">تحذيرات:</h4>
                  <ul className="text-sm text-yellow-200 bg-yellow-900/20 p-3 rounded space-y-1">
                    {atomData.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* المساعد الذكي القابل للسحب */}
      {showAssistant && (
        <SmartAssistant
          atomData={atomData}
          position={assistantPosition}
          onDrag={handleAssistantDrag}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
};

export default BuildAtomSimulation;
