import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { FissionSimulation } from '@/components/nuclear/FissionSimulation';
import { FusionSimulation } from '@/components/nuclear/FusionSimulation';
import { EnergyDisplay } from '@/components/nuclear/EnergyDisplay';
import { NuclearQuiz } from '@/components/nuclear/NuclearQuiz';
import { EDUCATIONAL_CONTENT } from '@/data/nuclear-data';
import StarField from '@/components/StarField';

const NuclearReactionsSimulation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fission');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* الرأسية */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
              className="hover:bg-white/10"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                محاكاة التفاعلات النووية
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                استكشف قوة الذرة: الانشطار والاندماج النووي ⚛️
              </p>
            </div>
          </div>
        </motion.div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-sm border border-purple-500/20">
            <TabsTrigger 
              value="fission"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600"
            >
              ⚛️ الانشطار النووي
            </TabsTrigger>
            <TabsTrigger 
              value="fusion"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
            >
              ⭐ الاندماج النووي
            </TabsTrigger>
            <TabsTrigger 
              value="energy"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600"
            >
              ⚡ الطاقة
            </TabsTrigger>
            <TabsTrigger 
              value="quiz"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600"
            >
              🎯 اختبار
            </TabsTrigger>
          </TabsList>

          {/* محاكاة الانشطار */}
          <TabsContent value="fission" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/20 backdrop-blur-sm border-green-500/20 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      {EDUCATIONAL_CONTENT.fission.title}
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {EDUCATIONAL_CONTENT.fission.content.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {EDUCATIONAL_CONTENT.fission.facts.map((fact, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <FissionSimulation />
            </motion.div>
          </TabsContent>

          {/* محاكاة الاندماج */}
          <TabsContent value="fusion" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">
                      {EDUCATIONAL_CONTENT.fusion.title}
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {EDUCATIONAL_CONTENT.fusion.content.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {EDUCATIONAL_CONTENT.fusion.facts.map((fact, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <FusionSimulation />
            </motion.div>
          </TabsContent>

          {/* عرض الطاقة */}
          <TabsContent value="energy">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <EnergyDisplay />
            </motion.div>
          </TabsContent>

          {/* الاختبار */}
          <TabsContent value="quiz">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/20 backdrop-blur-sm border-pink-500/20 p-8">
                <NuclearQuiz />
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* تنبيه علمي */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-sm text-muted-foreground">
              <strong className="text-yellow-400">ملاحظة مهمة:</strong> هذه المحاكاة تبسيط تعليمي 
              لتوضيح مفاهيم التفاعلات النووية. الواقع أكثر تعقيداً ويتطلب ظروفاً دقيقة جداً.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NuclearReactionsSimulation;
