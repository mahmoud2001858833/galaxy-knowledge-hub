import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, History, Scale, Sparkles, Loader2, ChevronDown, BookOpen, Users, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EraInfo {
  name: string;
  period: string;
  customs: string[];
  laws: string[];
  characteristics: string[];
  socialAspects: string[];
}

interface ComparisonResult {
  era1: EraInfo;
  era2: EraInfo;
  changes: {
    category: string;
    from: string;
    to: string;
    significance: string;
  }[];
  summary: string;
}

const eras = [
  { id: 'pre-prophethood', name: 'قبل البعثة (الجاهلية)', icon: '🌑', color: 'from-gray-600 to-slate-700' },
  { id: 'post-prophethood-pre-hijra', name: 'بعد البعثة - قبل الهجرة', icon: '🌅', color: 'from-orange-600 to-amber-700' },
  { id: 'post-hijra', name: 'بعد الهجرة', icon: '🌟', color: 'from-emerald-600 to-teal-700' },
  { id: 'post-prophetic', name: 'بعد العصر النبوي', icon: '📚', color: 'from-blue-600 to-indigo-700' },
  { id: 'modern', name: 'العصر الحديث', icon: '🌍', color: 'from-purple-600 to-pink-700' }
];

const IslamicHistoricalEras = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [era1, setEra1] = useState<string>('');
  const [era2, setEra2] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [eraDetails, setEraDetails] = useState<EraInfo | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'compare'>('timeline');

  const fetchEraDetails = async (eraId: string) => {
    setLoading(true);
    setEraDetails(null);
    setSelectedEra(eraId);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-historical-eras', {
        body: { 
          type: 'getEraDetails',
          eraId
        }
      });

      if (error) throw error;

      if (data.era) {
        setEraDetails(data.era);
      }
    } catch (error) {
      console.error('Error fetching era details:', error);
      toast.error('حدث خطأ أثناء جلب المعلومات');
    } finally {
      setLoading(false);
    }
  };

  const compareEras = async () => {
    if (!era1 || !era2) {
      toast.error('يرجى اختيار فترتين للمقارنة');
      return;
    }

    if (era1 === era2) {
      toast.error('يرجى اختيار فترتين مختلفتين');
      return;
    }

    setLoading(true);
    setComparison(null);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-historical-eras', {
        body: { 
          type: 'compareEras',
          era1,
          era2
        }
      });

      if (error) throw error;

      if (data.comparison) {
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error('Error comparing eras:', error);
      toast.error('حدث خطأ أثناء المقارنة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-amber-950/40 to-slate-950`} dir={dir}>
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/islamic-education')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {t.common.back}
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <History className="w-10 h-10 text-amber-400" />
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-emerald-300">
                أحداث الفترات التاريخية
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                اكتشف تطور العادات والقوانين عبر العصور الإسلامية
              </p>
            </div>
          </motion.div>

          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={activeView === 'timeline' ? 'default' : 'outline'}
              onClick={() => setActiveView('timeline')}
              className={activeView === 'timeline' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-500/50 text-amber-300'}
            >
              <History className="w-4 h-4 ml-2" />
              الخط الزمني
            </Button>
            <Button
              variant={activeView === 'compare' ? 'default' : 'outline'}
              onClick={() => setActiveView('compare')}
              className={activeView === 'compare' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-500/50 text-emerald-300'}
            >
              <Scale className="w-4 h-4 ml-2" />
              أداة المقارنة
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'timeline' ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Timeline */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-amber-500 via-emerald-500 to-purple-500 rounded-full hidden md:block"></div>
                  
                  <div className="space-y-8">
                    {eras.map((era, index) => (
                      <motion.div
                        key={era.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${era.color} border-4 border-slate-900 shadow-lg`}></div>
                        </div>
                        
                        {/* Era Card */}
                        <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                          <Card 
                            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                              selectedEra === era.id 
                                ? 'bg-gradient-to-br from-slate-800/80 to-amber-900/40 border-amber-500/50 shadow-xl shadow-amber-500/20' 
                                : 'bg-slate-900/60 border-slate-700/50 hover:border-amber-500/30'
                            }`}
                            onClick={() => fetchEraDetails(era.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4 mb-3">
                                <span className="text-4xl">{era.icon}</span>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{era.name}</h3>
                                </div>
                              </div>
                              
                              {selectedEra === era.id && loading && (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                </div>
                              )}
                              
                              {selectedEra === era.id && eraDetails && !loading && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4 space-y-4"
                                >
                                  <p className="text-white/70 text-sm">{eraDetails.period}</p>
                                  
                                  {/* Customs */}
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
                                      <Users className="w-4 h-4" /> العادات
                                    </h4>
                                    <ul className="space-y-1">
                                      {eraDetails.customs.slice(0, 3).map((custom, idx) => (
                                        <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                                          <span className="text-amber-400">•</span>
                                          {custom}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  {/* Laws */}
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <h4 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
                                      <Gavel className="w-4 h-4" /> القوانين
                                    </h4>
                                    <ul className="space-y-1">
                                      {eraDetails.laws.slice(0, 3).map((law, idx) => (
                                        <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                                          <span className="text-emerald-400">•</span>
                                          {law}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="compare"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Comparison Tool */}
                <Card className="bg-slate-900/60 border-emerald-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-emerald-300 flex items-center gap-2">
                      <Scale className="w-6 h-6" />
                      أداة المقارنة التفاعلية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-white/70 mb-2">الفترة الأولى</label>
                        <Select value={era1} onValueChange={setEra1}>
                          <SelectTrigger className="bg-slate-800/50 border-amber-500/30 text-white">
                            <SelectValue placeholder="اختر الفترة الأولى" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-amber-500/30">
                            {eras.map((era) => (
                              <SelectItem key={era.id} value={era.id} className="text-white hover:bg-amber-600/30">
                                {era.icon} {era.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-white/70 mb-2">الفترة الثانية</label>
                        <Select value={era2} onValueChange={setEra2}>
                          <SelectTrigger className="bg-slate-800/50 border-emerald-500/30 text-white">
                            <SelectValue placeholder="اختر الفترة الثانية" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-emerald-500/30">
                            {eras.map((era) => (
                              <SelectItem key={era.id} value={era.id} className="text-white hover:bg-emerald-600/30">
                                {era.icon} {era.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={compareEras}
                      disabled={loading || !era1 || !era2}
                      className="w-full bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          جاري المقارنة...
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4 ml-2" />
                          قارن بين الفترتين
                        </>
                      )}
                    </Button>

                    {/* Comparison Results */}
                    <AnimatePresence>
                      {comparison && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-8 space-y-6"
                        >
                          {/* Summary */}
                          <div className="p-6 bg-gradient-to-br from-amber-900/30 to-emerald-900/30 rounded-2xl border border-amber-500/30">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-amber-400" />
                              ملخص المقارنة
                            </h3>
                            <p className="text-white/80 leading-relaxed">{comparison.summary}</p>
                          </div>

                          {/* Changes Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-slate-800/50">
                                  <th className="p-4 text-right text-amber-300 border border-slate-700/50">الجانب</th>
                                  <th className="p-4 text-right text-amber-300 border border-slate-700/50">{comparison.era1.name}</th>
                                  <th className="p-4 text-center border border-slate-700/50">
                                    <ArrowRight className="w-5 h-5 mx-auto text-emerald-400" />
                                  </th>
                                  <th className="p-4 text-right text-emerald-300 border border-slate-700/50">{comparison.era2.name}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparison.changes.map((change, idx) => (
                                  <tr key={idx} className="hover:bg-slate-800/30">
                                    <td className="p-4 border border-slate-700/50 text-white font-semibold">{change.category}</td>
                                    <td className="p-4 border border-slate-700/50 text-white/70">{change.from}</td>
                                    <td className="p-4 border border-slate-700/50 text-center">
                                      <Sparkles className="w-4 h-4 mx-auto text-purple-400" />
                                    </td>
                                    <td className="p-4 border border-slate-700/50 text-white/70">{change.to}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IslamicHistoricalEras;
