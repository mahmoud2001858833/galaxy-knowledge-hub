import { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chemicalReactions } from '@/data/chemical-reactions-data';
import { ReactionVisualization } from '@/components/chemical-reactions/ReactionVisualization';
import { ReactionControls } from '@/components/chemical-reactions/ReactionControls';
import { ReactionInfo } from '@/components/chemical-reactions/ReactionInfo';
import { ReactionsList } from '@/components/chemical-reactions/ReactionsList';
import { ChemicalQuiz } from '@/components/chemical-reactions/ChemicalQuiz';
import { Loader2 } from 'lucide-react';

const ChemicalReactionsSimulation = () => {
  const [selectedReaction, setSelectedReaction] = useState(chemicalReactions[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showGeometry, setShowGeometry] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-chemistry-50/20 dark:to-chemistry-900/10 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-chemistry-primary to-chemistry-secondary bg-clip-text text-transparent">
            محاكاة التفاعلات الكيميائية
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            استكشف عالم الكيمياء من خلال محاكاة تفاعلية ثلاثية الأبعاد تُظهر تكوين الجزيئات والروابط الكيميائية بشكل مرئي
          </p>
        </div>

        <Tabs defaultValue="simulation" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="simulation">المحاكاة</TabsTrigger>
            <TabsTrigger value="reactions">التفاعلات</TabsTrigger>
            <TabsTrigger value="info">المعلومات</TabsTrigger>
            <TabsTrigger value="quiz">الاختبار</TabsTrigger>
          </TabsList>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <div className="bg-card rounded-lg border border-border overflow-hidden shadow-xl" style={{ height: '600px' }}>
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                          <p className="text-muted-foreground">جاري تحميل المحاكاة...</p>
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
                <ReactionInfo reaction={selectedReaction} />
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

        {/* Educational Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground max-w-3xl mx-auto p-6 bg-muted/30 rounded-lg">
          <p>
            💡 <strong>ملاحظة:</strong> هذه محاكاة تعليمية مبسطة للتفاعلات الكيميائية. في الواقع، التفاعلات الكيميائية أكثر تعقيداً 
            وتتضمن تفاصيل دقيقة على المستوى الجزيئي والإلكتروني.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChemicalReactionsSimulation;
