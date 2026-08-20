import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, BookOpen, ListChecks, Trophy, GraduationCap, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulationBack } from '@/hooks/useSimulationBack';

interface SimLessonShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  objectives: string[];
  concepts: string[];
  steps: string[];
  scene: ReactNode;
  controls: ReactNode;
  explanation: ReactNode;
  charts?: ReactNode;
  challenge?: ReactNode;
  quiz?: ReactNode;
  notebook?: ReactNode;
}

/** Unified page layout for every 3D experiment. */
export const SimLessonShell = ({
  title,
  subtitle,
  icon,
  objectives,
  concepts,
  steps,
  scene,
  controls,
  explanation,
  charts,
  challenge,
  quiz,
  notebook,
}: SimLessonShellProps) => {
  const { goBack, backLabel } = useSimulationBack();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <Button variant="ghost" onClick={goBack} className="gap-2">
            <ArrowLeft size={18} />
            {backLabel}
          </Button>
          <div className="flex items-center gap-3 text-right">
            <div>
              <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
            </div>
            {icon}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <div className="relative h-[420px] overflow-hidden rounded-xl border border-border shadow-xl md:h-[560px]">
              {scene}
            </div>
          </div>
          <div className="space-y-4">{controls}</div>
        </motion.div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              أهداف التعلّم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="grid gap-2 sm:grid-cols-2">
              {objectives.map((o) => (
                <li key={o} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {o}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              {concepts.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="explain" dir="rtl" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="explain" className="gap-1 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" /> الشرح
            </TabsTrigger>
            <TabsTrigger value="steps" className="gap-1 text-xs sm:text-sm">
              <ListChecks className="h-4 w-4" /> الخطوات
            </TabsTrigger>
            <TabsTrigger value="challenge" className="gap-1 text-xs sm:text-sm">
              <Trophy className="h-4 w-4" /> التحدي
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1 text-xs sm:text-sm">
              <GraduationCap className="h-4 w-4" /> الاختبار
            </TabsTrigger>
            <TabsTrigger value="notebook" className="gap-1 text-xs sm:text-sm">
              <NotebookPen className="h-4 w-4" /> الدفتر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explain" className="space-y-4">
            {explanation}
            {charts}
          </TabsContent>

          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">خطوات إجراء التجربة</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {steps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenge">{challenge}</TabsContent>
          <TabsContent value="quiz">{quiz}</TabsContent>
          <TabsContent value="notebook">{notebook}</TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
