
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
import { CyberLabHUD } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';

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
    };
  };

  const elementInfo = getElementInfo();

  const bindingEnergy = atomData.protons === 0 ? 0 : Number((atomData.protons * 7.8 + atomData.neutrons * 8.1).toFixed(1));
  const hudMetrics = [
    {
      id: 'atomic_num',
      label: 'العدد الذري (Z)',
      value: atomData.protons,
      unit: 'P+',
      color: 'text-red-400',
      progressPercent: Math.min(100, (atomData.protons / 20) * 100),
      trend: 'stable' as const
    },
    {
      id: 'mass_num',
      label: 'العدد الكتلي (A)',
      value: atomData.massNumber,
      unit: 'u',
      color: 'text-yellow-400',
      progressPercent: Math.min(100, (atomData.massNumber / 40) * 100),
      trend: 'stable' as const
    },
    {
      id: 'net_charge',
      label: 'صافي الشحنة (Q)',
      value: atomData.charge === 0 ? '0 (متعادل)' : atomData.charge > 0 ? `+${atomData.charge}` : `${atomData.charge}`,
      unit: 'e',
      color: atomData.charge === 0 ? 'text-emerald-400' : 'text-cyan-400',
      progressPercent: Math.min(100, Math.abs(atomData.charge) * 20),
      trend: atomData.charge === 0 ? 'stable' as const : 'up' as const
    },
    {
      id: 'binding_energy',
      label: 'طاقة الربط النووية',
      value: bindingEnergy,
      unit: 'MeV',
      color: 'text-purple-400',
      progressPercent: Math.min(100, (bindingEnergy / 300) * 100),
      trend: 'stable' as const
    }
  ];

  const challenges = [
    {
      id: 'carbon-12',
      title: 'بناء ذرة الكربون-12 المستقرة',
      description: 'اجمع 6 بروتونات و6 نيوترونات و6 إلكترونات لتحقيق الاستقرار النووي والشحنة المتعادلة (Q=0).',
      targetDescription: 'P=6, N=6, E=6',
      checkSuccess: () => atomData.protons === 6 && atomData.neutrons === 6 && atomData.electrons === 6,
      points: 200,
      badge: 'مهندس النظائر المستقرة'
    },
    {
      id: 'lithium-cation',
      title: 'توليد كاتيون الليثيوم الموجب (Li+)',
      description: 'ابنِ ذرة ليثيوم (3 بروتونات، 4 نيوترونات) مع شحنة موجبة (+1) عن طريق إزالة إلكترون التكافؤ.',
      targetDescription: 'P=3, E=2, شحنة +1',
      checkSuccess: () => atomData.protons === 3 && atomData.electrons === 2,
      points: 150,
      badge: 'خبير التأين الذري'
    },
    {
      id: 'radioactive-isotope',
      title: 'النظير المشع للتريتيوم (³H)',
      description: 'ابنِ نواة تحتوي بروتوناً واحداً ونيوترونين (A=3) لاكتشاف عدم التوازن النووي في النظائر الثقيلة.',
      targetDescription: 'P=1, N=2',
      checkSuccess: () => atomData.protons === 1 && atomData.neutrons === 2,
      points: 180,
      badge: 'مستكشف النشاط الإشعاعي'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للمحاكاة'}
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              مختبر بناء الذرة والفيزياء الذرية ثلاثي الأبعاد 3D
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

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Cyber-Lab Live Telemetry HUD */}
        <CyberLabHUD
          title="محطة القياسات الذرية والنووية الحية"
          statusBadge={atomData.isStable ? "STABLE NUCLEUS" : "ISOTOPE UNSTABLE"}
          waveformColor={atomData.isStable ? "#38bdf8" : "#f43f5e"}
          waveformSpeed={Math.max(0.5, atomData.protons * 0.15)}
          metrics={hudMetrics}
        />

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

          {/* منطقة الذرة الرئيسية + CoPilot & Challenges */}
          <div className="xl:col-span-3 space-y-4">
            {/* 3D Visualization */}
            <AtomVisualization particles={particles} />

            {/* Live AI Lab CoPilot & Challenge Engine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiveAILabCoPilot
                simName="مختبر بناء الذرة والفيزياء النووية"
                subject="physics"
                liveHint={
                  atomData.protons === 0
                    ? 'ابدأ بإضافة بروتون لتكوين نواة عنصر الهيدروجين.'
                    : !atomData.isStable
                    ? 'تحذير نووي: نسبة النيوترونات إلى البروتونات غير متوازنة، النواة عرضة للتحلل الإشعاعي (ألفا أو بيتا)!'
                    : atomData.charge !== 0
                    ? `الذرة حالياً في حالة تأين: ${atomData.charge > 0 ? 'كاتيون موجب' : 'أنيون سالب'}. أضف أو انزع إلكترونات للوصول للتعادل.`
                    : `ذرة ${atomData.element} مستقرة ومتعادلة كهربائياً مع توزيع إلكتروني تام.`
                }
                currentParameters={{
                  'العنصر الحالي': atomData.element || 'غير محدد',
                  'الرمز الكيميائي': atomData.symbol || 'X',
                  'العدد الذري': atomData.protons,
                  'العدد الكتلي': atomData.massNumber,
                  'صافي الشحنة': `${atomData.charge} e`,
                  'حالة الاستقرار': atomData.isStable ? 'مستقرة' : 'مشعة غير مستقرة',
                  'التوزيع الإلكتروني': atomData.electronConfiguration || 'فارغ'
                }}
              />

              <LabChallengeEngine challenges={challenges} />
            </div>
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
