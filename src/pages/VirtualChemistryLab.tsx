import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Trash2 } from 'lucide-react';
import { Lab3DScene } from '@/components/virtual-lab/Lab3DScene';
import { ChemicalSelector } from '@/components/virtual-lab/ChemicalSelector';
import { EnvironmentControls } from '@/components/virtual-lab/EnvironmentControls';
import { ReactionResult } from '@/components/virtual-lab/ReactionResult';
import { SafetyIndicator } from '@/components/virtual-lab/SafetyIndicator';
import { Chemical, findReaction, Reaction } from '@/data/virtual-lab-data';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const VirtualChemistryLab = () => {
  const navigate = useNavigate();
  
  // State
  const [selectedChemicals, setSelectedChemicals] = useState<Chemical[]>([]);
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1.0);
  const [burnerOn, setBurnerOn] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(0.5);
  const [isReacting, setIsReacting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [liquidLevel, setLiquidLevel] = useState(0);
  const [mixedColor, setMixedColor] = useState('#e0f7fa');
  const [showBubbles, setShowBubbles] = useState(false);
  const [showSteam, setShowSteam] = useState(false);

  // Check for reaction whenever chemicals change
  useEffect(() => {
    if (selectedChemicals.length >= 2) {
      const reaction = findReaction(selectedChemicals.map(c => c.id));
      setCurrentReaction(reaction);
      
      if (reaction) {
        toast.success('تم اكتشاف تفاعل محتمل!', {
          description: reaction.description
        });
      }
    } else {
      setCurrentReaction(null);
    }
  }, [selectedChemicals]);

  // Update visual effects based on temperature
  useEffect(() => {
    if (temperature > 80) {
      setShowSteam(true);
    } else {
      setShowSteam(false);
    }

    if (temperature > 50 && burnerOn) {
      setShowBubbles(true);
    } else {
      setShowBubbles(false);
    }
  }, [temperature, burnerOn]);

  // Update liquid level and color based on selected chemicals
  useEffect(() => {
    if (selectedChemicals.length > 0) {
      setLiquidLevel(Math.min(selectedChemicals.length * 25, 100));
      
      // Mix colors
      if (selectedChemicals.length === 1) {
        setMixedColor(selectedChemicals[0].color);
      } else {
        // Simple color mixing (can be improved)
        const avgColor = '#a0d0e0'; // Default mixed color
        setMixedColor(currentReaction?.color_change || avgColor);
      }
    } else {
      setLiquidLevel(0);
      setMixedColor('#e0f7fa');
    }
  }, [selectedChemicals, currentReaction]);

  const handleAddChemical = (chemical: Chemical) => {
    if (selectedChemicals.length >= 4) {
      toast.error('لا يمكن إضافة أكثر من 4 مواد');
      return;
    }
    
    setSelectedChemicals([...selectedChemicals, chemical]);
    toast.success(`تمت إضافة ${chemical.nameAr}`);
  };

  const handleRemoveChemical = (chemicalId: string) => {
    setSelectedChemicals(selectedChemicals.filter(c => c.id !== chemicalId));
  };

  const handleStartReaction = () => {
    if (!currentReaction) {
      toast.error('لا يوجد تفاعل متاح للمواد المحددة');
      return;
    }

    setIsReacting(true);
    toast.loading('جارٍ التفاعل...', { duration: 3000 });

    // Simulate reaction
    setTimeout(() => {
      setIsReacting(false);
      toast.success('اكتمل التفاعل!', {
        description: currentReaction.description
      });

      // Update temperature based on reaction energy
      if (currentReaction.energy === 'exothermic') {
        setTemperature(prev => Math.min(prev + 30, 500));
      } else if (currentReaction.energy === 'endothermic') {
        setTemperature(prev => Math.max(prev - 20, -20));
      }
    }, 3000);
  };

  const handleClearAll = () => {
    setSelectedChemicals([]);
    setTemperature(25);
    setPressure(1.0);
    setBurnerOn(false);
    setFlameIntensity(0.5);
    setCurrentReaction(null);
    setIsReacting(false);
    toast.success('تم مسح جميع المواد');
  };

  const handleReset = () => {
    setTemperature(25);
    setPressure(1.0);
    setBurnerOn(false);
    setFlameIntensity(0.5);
    toast.success('تم إعادة تعيين الإعدادات');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div 
        className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/scientific-simulations')}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🧪 معمل الكيمياء الافتراضي
                </h1>
                <p className="text-sm text-muted-foreground">
                  استكشف التفاعلات الكيميائية في بيئة آمنة وتفاعلية ثلاثية الأبعاد
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                مسح الكل
              </Button>
              <Button
                size="sm"
                onClick={handleStartReaction}
                disabled={!currentReaction || isReacting}
              >
                <Play className="w-4 h-4 mr-2" />
                بدء التفاعل
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - 3D Scene */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Lab3DScene
              selectedChemicals={selectedChemicals}
              mixedColor={mixedColor}
              liquidLevel={liquidLevel}
              temperature={temperature}
              showBubbles={showBubbles}
              showSteam={showSteam}
              burnerOn={burnerOn}
              flameIntensity={flameIntensity}
            />

            <ReactionResult 
              reaction={currentReaction}
              isReacting={isReacting}
            />
          </motion.div>

          {/* Right Panel - Controls */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SafetyIndicator selectedChemicals={selectedChemicals} />
            
            <EnvironmentControls
              temperature={temperature}
              pressure={pressure}
              burnerOn={burnerOn}
              flameIntensity={flameIntensity}
              onTemperatureChange={setTemperature}
              onPressureChange={setPressure}
              onBurnerToggle={() => setBurnerOn(!burnerOn)}
              onFlameIntensityChange={setFlameIntensity}
              onReset={handleReset}
            />

            <ChemicalSelector
              selectedChemicals={selectedChemicals}
              onAddChemical={handleAddChemical}
              onRemoveChemical={handleRemoveChemical}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VirtualChemistryLab;
