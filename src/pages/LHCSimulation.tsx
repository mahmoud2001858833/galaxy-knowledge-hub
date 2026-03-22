import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Atom } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSimulationBack } from '@/hooks/useSimulationBack';
import { useLHCSimulation } from '@/hooks/useLHCSimulation';
import { LHCVisualization } from '@/components/lhc/LHCVisualization';
import { CollisionEffect } from '@/components/lhc/CollisionEffect';
import { ControlPanel } from '@/components/lhc/ControlPanel';
import { InfoDashboard } from '@/components/lhc/InfoDashboard';
import { EducationalSection } from '@/components/lhc/EducationalSection';
import { ScenariosPanel } from '@/components/lhc/ScenariosPanel';
import { QuizSection } from '@/components/lhc/QuizSection';
import { ExperimentLog } from '@/components/lhc/ExperimentLog';
import StarField from '@/components/StarField';

const LHCSimulation = () => {
  const navigate = useNavigate();
  const {
    state,
    realTimeData,
    experimentLog,
    setBeamEnergy,
    setBeamSpeed,
    setParticleType,
    setParticleCount,
    launchBeams,
    stopBeams,
    activateCollision,
    stopCollision,
    logExperiment,
    loadScenario
  } = useLHCSimulation();

  const [showCollision, setShowCollision] = useState(false);

  const handleCollision = () => {
    activateCollision();
    setShowCollision(true);
  };

  const handleCollisionComplete = (particles: any[]) => {
    const hasHiggs = particles.some(p => p.type === 'higgs-like');
    logExperiment(particles.length, hasHiggs);
    setTimeout(() => {
      stopCollision();
      setShowCollision(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <StarField starCount={200} speed={0.3} />

      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          className="p-6 border-b border-border/50 backdrop-blur-md bg-background/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="gap-2"
            >
              <ArrowLeft size={20} />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة'}
            </Button>
            <div className="flex items-center gap-3">
              <Atom className="text-primary" size={32} />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-foreground">مصادم الهدرونات الكبير</h1>
                <p className="text-sm text-muted-foreground">Large Hadron Collider (LHC)</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Visualization Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl min-h-[600px] relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LHCVisualization
                  beamsLaunched={state.beamsLaunched}
                  beamSpeed={state.beamSpeed}
                  collisionActive={state.collisionActive}
                />
                
                {showCollision && (
                  <CollisionEffect
                    isActive={showCollision}
                    energy={state.beamEnergy}
                    onComplete={handleCollisionComplete}
                  />
                )}
              </motion.div>

              <InfoDashboard data={realTimeData} />
            </div>

            {/* Control Panel */}
            <div>
              <ControlPanel
                beamEnergy={state.beamEnergy}
                beamSpeed={state.beamSpeed}
                particleType={state.particleType}
                particleCount={state.particleCount}
                beamsLaunched={state.beamsLaunched}
                collisionActive={state.collisionActive}
                onBeamEnergyChange={setBeamEnergy}
                onBeamSpeedChange={setBeamSpeed}
                onParticleTypeChange={setParticleType}
                onParticleCountChange={setParticleCount}
                onLaunchBeams={launchBeams}
                onStopBeams={stopBeams}
                onActivateCollision={handleCollision}
              />
            </div>
          </div>

          {/* Educational and Interactive Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <EducationalSection />
            <ScenariosPanel onLoadScenario={loadScenario} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuizSection />
            <ExperimentLog logs={experimentLog} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LHCSimulation;
