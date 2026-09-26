import { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chemicalReactions } from '@/data/chemical-reactions-data';
import { ReactionVisualization } from '@/components/chemical-reactions/ReactionVisualization';
import { ReactionControls } from '@/components/chemical-reactions/ReactionControls';
import { ReactionInfo } from '@/components/chemical-reactions/ReactionInfo';
import { ReactionsList } from '@/components/chemical-reactions/ReactionsList';
import { ChemicalQuiz } from '@/components/chemical-reactions/ChemicalQuiz';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CyberLabHUD } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';

const ChemicalReactionsSimulation = () => {
  const navigate = useNavigate();
  const [selectedReaction, setSelectedReaction] = useState(chemicalReactions[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showGeometry, setShowGeometry] = useState(false);

  // HUD telemetry
  const hudMetrics = [
    {
      id: 'reaction_type',
      label: 'نوع التفاعل',
      value: selectedReaction.type || 'تكوين روابط',
      unit: '',
      color: 'text-amber-400',
      progressPercent: 100,
      trend: 'stable' as const
    },
    {
      id: 'reactants_count',
      label: 'المواد المتفاعلة',
      value: selectedReaction.reactants ? selectedReaction.reactants.length : 2,
      unit: 'جزيئات',
      color: 'text-cyan-400',
      progressPercent: 50,
      trend: 'stable' as const
    },
    {
      id: 'products_count',
      label: 'المواد الناتجة',
      value: selectedReaction.products ? selectedReaction.products.length : 1,
      unit: 'جزيئات',
      color: 'text-emerald-400',
      progressPercent: 100,
      trend: 'up' as const
    },
    {
      id: 'sim_speed',
      label: 'سرعة العرض الجزيئي',
      value: `${speed}x`,
      unit: '',
      color: 'text-purple-400',
      progressPercent: (speed / 3) * 100,
      trend: 'stable' as const
    }
  ];

  const challenges = [
    {
      id: 'run-combustion',
      title: 'محاكاة تفاعل الاحتراق التام',
      description: 'اختر تفاعل احتراق الميثان أو الهيدروكربونات وشاهد كسر روابط C-H وتكوين ثاني أكسيد الكربون والماء.',
      targetDescription: 'تشغيل تفاعل احتراق',
      checkSuccess: () => selectedReaction.name.includes('احتراق') || selectedReaction.id.includes('combustion'),
      points: 150,
      badge: 'خبير تفاعلات الأكسدة'
    },
    {
      id: 'toggle-geometry',
      title: 'فحص الهندسة الجزيئية',
      description: 'فعّل وضع الأشكال الهندسية ثلاثية الأبعاد (VSEPR Geometry) لملاحظة زوايا الروابط الفراغية.',
      targetDescription: 'تفعيل وضع الهندسة الفراغية',
      checkSuccess: () => showGeometry,
      points: 100,
      badge: 'مهندس الجزيئات الفراغية'
    },
    {
      id: 'speed-control',
      title: 'التحكم الحركي الدقيق',
      description: 'قم بتغيير سرعة المحاكاة إلى 2x لملاحظة تسلسل مراحل كسر وإعادة تشكيل الروابط بسرعة أكبر.',
      targetDescription: 'السرعة >= 2x',
      checkSuccess: () => speed >= 2,
      points: 120,
      badge: 'راصد الآليات الجزيئية'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8" dir="rtl">
      <div className="container mx-auto px-4 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="text-slate-400 hover:text-white p-0 h-auto font-normal flex items-center gap-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للمحاكاة'}
            </Button>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              محاكاة التفاعلات الكيميائية وتكوين الروابط 3D
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              استكشف تكوين وكسر الروابط الكيميائية والهندسة الجزيئية الفراغية ثلاثية الأبعاد
            </p>
          </div>
        </div>

        {/* Live HUD Telemetry */}
        <CyberLabHUD
          title={`محطة رصد التفاعل: ${selectedReaction.name}`}
          statusBadge={isPlaying ? "REACTION IN PROGRESS" : "STANDBY"}
          showWaveform={true}
          waveformColor="#10b981"
          waveformSpeed={speed * 1.2}
          metrics={hudMetrics}
        />

        <Tabs defaultValue="simulation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger value="simulation" className="text-xs">المحاكاة ثلاثية الأبعاد</TabsTrigger>
            <TabsTrigger value="reactions" className="text-xs">مكتبة التفاعلات</TabsTrigger>
            <TabsTrigger value="info" className="text-xs">المعلومات العلمية</TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs">الاختبار المعرفي</TabsTrigger>
          </TabsList>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* 3D Visualization Canvas (3 Cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative" style={{ height: '580px' }}>
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                          <p className="text-muted-foreground">جاري تحميل المحاكاة ثلاثية الأبعاد...</p>
                        </div>
                      </div>
                    }
                  >
                    <ReactionVisualization
                      reaction={selectedReaction}
                      isPlaying={isPlaying}
                      speed={speed}
                      showGeometry={showGeometry}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Sidebar Controls, AI Co-Pilot & Challenges (1 Col) */}
              <div className="space-y-4">
                <ReactionControls
                  isPlaying={isPlaying}
                  speed={speed}
                  showGeometry={showGeometry}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onReset={() => {
                    setIsPlaying(false);
                  }}
                  onSpeedChange={setSpeed}
                  onToggleGeometry={() => setShowGeometry(!showGeometry)}
                />

                {/* Live AI Lab CoPilot */}
                <LiveAILabCoPilot
                  simName="محاكاة التفاعلات الكيميائية 3D"
                  subject="chemistry"
                  liveHint={`تفاعل ${selectedReaction.name}: المعادلة الموزونة هي [${selectedReaction.equation}]. راقب كيفية تصادم الجزيئات وانفصال الروابط لتشكيل النواتج المستقرة.`}
                  currentParameters={{
                    'التفاعل': selectedReaction.name,
                    'المعادلة الكيميائية': selectedReaction.equation,
                    'النوع': selectedReaction.type || 'تكوين روابط',
                    'سرعة العرض': `${speed}x`,
                    'إظهار الهندسة الفراغية': showGeometry ? 'نعم' : 'لا'
                  }}
                />

                {/* Challenges */}
                <LabChallengeEngine challenges={challenges} />
              </div>

            </div>
          </TabsContent>

          {/* Reactions List Tab */}
          <TabsContent value="reactions">
            <div className="max-w-4xl mx-auto">
              <ReactionsList
                reactions={chemicalReactions}
                selectedReaction={selectedReaction}
                onSelectReaction={(reaction) => {
                  setSelectedReaction(reaction);
                  setIsPlaying(false);
                }}
              />
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="max-w-4xl mx-auto">
              <ReactionInfo reaction={selectedReaction} />
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <div className="max-w-3xl mx-auto">
              <ChemicalQuiz />
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default ChemicalReactionsSimulation;
