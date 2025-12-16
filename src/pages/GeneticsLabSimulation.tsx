import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Dna, FlaskConical, Sparkles, Sun, Moon, Shuffle, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useGeneticsSimulation, TRAITS, DNA_BASES, MUTATION_TYPES } from '@/hooks/useGeneticsSimulation';

// DNA Helix 3D Animation Component
const DNAHelix = ({ sequence, isReplicating, replicationProgress }: { 
  sequence: string[]; 
  isReplicating: boolean;
  replicationProgress: number;
}) => {
  const baseColors: Record<string, string> = {
    'A': '#FF6B6B', 'T': '#4ECDC4', 'G': '#45B7D1', 'C': '#96CEB4'
  };
  const complementary: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };

  return (
    <div className="relative h-96 overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900 rounded-xl border border-purple-500/30">
      {/* Replication fork animation */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isReplicating ? replicationProgress / 100 : 0 }}
        style={{ transformOrigin: 'left' }}
      />
      
      <div className="flex justify-center items-center h-full py-8">
        <div className="relative">
          {/* DNA Strands */}
          {sequence.slice(0, 20).map((base, i) => {
            const replicated = isReplicating && (i / sequence.length) * 100 <= replicationProgress;
            const angle = i * 18;
            const yOffset = i * 18;
            
            return (
              <motion.div
                key={i}
                className="absolute flex items-center"
                style={{ top: yOffset }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ 
                  opacity: 1, 
                  x: replicated ? [-10, 0] : 0,
                  rotateY: angle
                }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                {/* Original strand */}
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ 
                    backgroundColor: baseColors[base],
                    boxShadow: `0 0 15px ${baseColors[base]}50`
                  }}
                  animate={{ 
                    x: replicated ? -30 : Math.sin(angle * Math.PI / 180) * 30,
                    scale: replicated ? 1.1 : 1
                  }}
                >
                  {base}
                </motion.div>

                {/* Hydrogen bonds */}
                <motion.div 
                  className="w-16 h-0.5 mx-1 flex items-center justify-center gap-1"
                  animate={{ 
                    opacity: replicated ? 0.3 : 1,
                    scaleX: replicated ? 1.5 : 1
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-white/60" />
                  <div className={`flex-1 h-0.5 ${base === 'A' || base === 'T' ? 'bg-white/40' : 'bg-white/60'}`} />
                  <div className="w-1 h-1 rounded-full bg-white/60" />
                  {(base === 'G' || base === 'C') && (
                    <div className="flex-1 h-0.5 bg-white/60" />
                  )}
                </motion.div>

                {/* Complementary strand */}
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ 
                    backgroundColor: baseColors[complementary[base]],
                    boxShadow: `0 0 15px ${baseColors[complementary[base]]}50`
                  }}
                  animate={{ 
                    x: replicated ? 30 : -Math.sin(angle * Math.PI / 180) * 30,
                    scale: replicated ? 1.1 : 1
                  }}
                >
                  {complementary[base]}
                </motion.div>

                {/* New replicated strands */}
                <AnimatePresence>
                  {replicated && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0, x: -60 }}
                        animate={{ opacity: 1, scale: 1, x: -70 }}
                        className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: baseColors[complementary[base]] }}
                      >
                        {complementary[base]}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0, x: 120 }}
                        animate={{ opacity: 1, scale: 1, x: 130 }}
                        className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: baseColors[base] }}
                      >
                        {base}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-gray-400">
        <span>5' → 3'</span>
        <span>3' ← 5'</span>
      </div>

      {/* Enzyme indicator */}
      {isReplicating && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold"
          style={{ top: `${replicationProgress * 3.5}px` }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          🧬 DNA Polymerase
        </motion.div>
      )}
    </div>
  );
};

// Enhanced Punnett Square Component
const PunnettSquareVisual = ({ 
  parent1, 
  parent2, 
  results, 
  isDarkMode,
  currentTrait
}: {
  parent1: string[];
  parent2: string[];
  results: string[];
  isDarkMode: boolean;
  currentTrait: any;
}) => {
  const grid: string[][] = [];
  for (let i = 0; i < 2; i++) {
    const row: string[] = [];
    for (let j = 0; j < 2; j++) {
      const allele1 = parent1[i];
      const allele2 = parent2[j];
      const genotype = [allele1, allele2].sort((a, b) => {
        if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
        if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
        return 0;
      }).join('');
      row.push(genotype);
    }
    grid.push(row);
  }

  const isDominant = (g: string) => g.includes(currentTrait?.alleles[0]?.symbol || 'A');

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Decorative elements */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl rounded-3xl" />
      
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-purple-500/30">
        {/* Headers */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-20" />
          <div className="flex gap-2">
            {parent2.map((allele, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-20 h-12 bg-gradient-to-b from-pink-600 to-pink-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                {allele}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex">
          <div className="flex flex-col gap-2 mr-2">
            {parent1.map((allele, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="w-12 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                {allele}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {grid.flat().map((genotype, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.15 + 0.4, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center font-bold text-xl shadow-xl
                  ${isDominant(genotype) 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                  }`}
              >
                <span>{genotype}</span>
                <span className="text-xs opacity-80 mt-1">
                  {isDominant(genotype) ? 'سائد' : 'متنحي'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-600" />
            <span className="text-gray-300">سائد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-orange-500" />
            <span className="text-gray-300">متنحي</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mutation Comparison Component
const MutationVisual = ({
  original,
  mutated,
  mutationType,
  isDarkMode
}: {
  original: string[];
  mutated: string[];
  mutationType: string;
  isDarkMode: boolean;
}) => {
  const baseColors: Record<string, string> = {
    'A': '#FF6B6B', 'T': '#4ECDC4', 'G': '#45B7D1', 'C': '#96CEB4'
  };

  const getMutationLabel = () => {
    switch (mutationType) {
      case 'substitution': return '🔄 استبدال';
      case 'deletion': return '❌ حذف';
      case 'insertion': return '➕ إضافة';
      default: return '🧬 طفرة';
    }
  };

  return (
    <div className="space-y-6">
      {/* Original Sequence */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">✅</span> التسلسل الأصلي
        </h4>
        <div className="flex flex-wrap gap-1">
          {original.slice(0, 15).map((base, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
              style={{ 
                backgroundColor: baseColors[base],
                boxShadow: `0 0 10px ${baseColors[base]}40`
              }}
            >
              {base}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mutation Indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex justify-center"
      >
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-xl">
          <Zap className="w-5 h-5 animate-pulse" />
          {getMutationLabel()}
        </div>
      </motion.div>

      {/* Mutated Sequence */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">⚠️</span> التسلسل بعد الطفرة
        </h4>
        <div className="flex flex-wrap gap-1">
          {mutated.slice(0, 15).map((base, i) => {
            const isDifferent = original[i] !== base;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: isDifferent ? 180 : 0 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.03 + 0.5 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg relative
                  ${isDifferent ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''}`}
                style={{ 
                  backgroundColor: baseColors[base],
                  boxShadow: isDifferent ? `0 0 20px #ef444450` : `0 0 10px ${baseColors[base]}40`
                }}
              >
                {base}
                {isDifferent && (
                  <motion.span
                    className="absolute -top-1 -right-1 text-xs"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    ⚡
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Effect description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-500/30"
      >
        <h4 className="text-orange-400 font-bold mb-2">💡 تأثير الطفرة:</h4>
        <p className="text-gray-300 text-sm">
          {mutationType === 'substitution' && 'تم استبدال قاعدة نيتروجينية بأخرى، مما قد يؤدي إلى تغيير الحمض الأميني الناتج.'}
          {mutationType === 'deletion' && 'تم حذف قاعدة نيتروجينية، مما يسبب إزاحة إطار القراءة وتغيير جميع الأحماض الأمينية التالية.'}
          {mutationType === 'insertion' && 'تم إضافة قاعدة نيتروجينية جديدة، مما يسبب إزاحة إطار القراءة.'}
        </p>
      </motion.div>
    </div>
  );
};

const GeneticsLabSimulation = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('punnett');
  const [replicationProgress, setReplicationProgress] = useState(0);

  const {
    state,
    currentTrait,
    phenotypeRatios,
    genotypeRatios,
    dnaSequenceString,
    complementaryString,
    mutationComparison,
    setSelectedTrait,
    setParentGenotype,
    calculatePunnettSquare,
    generateNewDNASequence,
    startReplication,
    advanceReplication,
    stopReplication,
    applyMutation,
    resetMutation,
  } = useGeneticsSimulation();

  useEffect(() => {
    calculatePunnettSquare();
  }, [state.parent1.genotype, state.parent2.genotype, state.selectedTrait]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isReplicating) {
      interval = setInterval(() => {
        setReplicationProgress(prev => {
          if (prev >= 100) {
            stopReplication();
            return 0;
          }
          return prev + 2;
        });
        advanceReplication();
      }, 100);
    } else {
      setReplicationProgress(0);
    }
    return () => clearInterval(interval);
  }, [state.isReplicating, advanceReplication, stopReplication]);

  const baseColors: Record<string, string> = {
    'A': '#FF6B6B', 'T': '#4ECDC4', 'G': '#45B7D1', 'C': '#96CEB4'
  };

  const getGenotypeOptions = () => {
    if (!currentTrait) return [];
    const [dominant, recessive] = currentTrait.alleles;
    return [
      { value: `${dominant.symbol}${dominant.symbol}`, label: `${dominant.symbol}${dominant.symbol} (متماثل سائد)`, genotype: [dominant.symbol, dominant.symbol] },
      { value: `${dominant.symbol}${recessive.symbol}`, label: `${dominant.symbol}${recessive.symbol} (هجين)`, genotype: [dominant.symbol, recessive.symbol] },
      { value: `${recessive.symbol}${recessive.symbol}`, label: `${recessive.symbol}${recessive.symbol} (متماثل متنحي)`, genotype: [recessive.symbol, recessive.symbol] }
    ];
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-purple-950 via-gray-900 to-green-950' : 'bg-gradient-to-br from-purple-50 via-white to-green-50'} transition-colors duration-500`}>
      {/* Floating DNA decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            style={{ left: `${i * 20 + 10}%`, top: `${Math.random() * 80}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧬
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className={isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800'}
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            🧬 مختبر الوراثة والجينات
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={isDarkMode ? 'text-white' : 'text-gray-800'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </motion.div>

      <div className="p-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-gray-800/50 p-1">
            <TabsTrigger value="punnett" className="gap-2 data-[state=active]:bg-purple-600">
              <FlaskConical className="w-4 h-4" />
              مربع بانيت
            </TabsTrigger>
            <TabsTrigger value="dna" className="gap-2 data-[state=active]:bg-blue-600">
              <Dna className="w-4 h-4" />
              تضاعف DNA
            </TabsTrigger>
            <TabsTrigger value="mutations" className="gap-2 data-[state=active]:bg-red-600">
              <Sparkles className="w-4 h-4" />
              الطفرات
            </TabsTrigger>
          </TabsList>

          {/* Punnett Square Tab */}
          <TabsContent value="punnett">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/70 border-purple-500/30 backdrop-blur-sm' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  🔬 اختيار الصفة الوراثية
                </h3>

                <Select value={state.selectedTrait} onValueChange={setSelectedTrait}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="اختر صفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAITS.map(trait => (
                      <SelectItem key={trait.id} value={trait.id}>
                        {trait.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentTrait && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 space-y-4"
                  >
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gray-100'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong className="text-green-400">الأليل السائد ({currentTrait.alleles[0].symbol}):</strong> {currentTrait.alleles[0].nameAr}
                      </p>
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong className="text-yellow-400">الأليل المتنحي ({currentTrait.alleles[1].symbol}):</strong> {currentTrait.alleles[1].nameAr}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block mb-2 font-bold ${isDarkMode ? 'text-white' : ''}`}>
                          👨 الأب (الطراز الجيني)
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {getGenotypeOptions().map(opt => (
                            <Button
                              key={opt.value}
                              variant={state.parent1.genotype.join('') === opt.value ? 'default' : 'outline'}
                              onClick={() => setParentGenotype(1, opt.genotype as [string, string])}
                              className={`${state.parent1.genotype.join('') === opt.value ? 'bg-blue-600 hover:bg-blue-700' : ''} ${state.parent1.genotype.join('') !== opt.value && isDarkMode ? 'border-gray-600 text-white' : ''}`}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block mb-2 font-bold ${isDarkMode ? 'text-white' : ''}`}>
                          👩 الأم (الطراز الجيني)
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {getGenotypeOptions().map(opt => (
                            <Button
                              key={opt.value}
                              variant={state.parent2.genotype.join('') === opt.value ? 'default' : 'outline'}
                              onClick={() => setParentGenotype(2, opt.genotype as [string, string])}
                              className={`${state.parent2.genotype.join('') === opt.value ? 'bg-pink-600 hover:bg-pink-700' : ''} ${state.parent2.genotype.join('') !== opt.value && isDarkMode ? 'border-gray-600 text-white' : ''}`}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculatePunnettSquare} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Shuffle className="w-4 h-4 ml-2" />
                      إجراء التهجين
                    </Button>
                  </motion.div>
                )}
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/70 border-purple-500/30 backdrop-blur-sm' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  📊 مربع بانيت والنتائج
                </h3>
                
                {currentTrait && state.punnettResults.length > 0 && (
                  <>
                    <PunnettSquareVisual
                      parent1={state.parent1.genotype}
                      parent2={state.parent2.genotype}
                      results={state.punnettResults.map(r => r.genotype.join(''))}
                      isDarkMode={isDarkMode}
                      currentTrait={currentTrait}
                    />

                    {/* Results Charts */}
                    <div className="mt-6 space-y-4">
                      <h4 className="text-white font-bold">📈 النسب المتوقعة:</h4>
                    {genotypeRatios.map((ratio, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-16 justify-center">{ratio.genotype}</Badge>
                        <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(ratio.count / 4) * 100}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          />
                        </div>
                        <span className="text-white font-bold w-12">{ratio.count}/4</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* DNA Replication Tab */}
        <TabsContent value="dna">
          <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/70 border-blue-500/30 backdrop-blur-sm' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
              🧬 محاكاة تضاعف الـ DNA المرئية
            </h3>

            <DNAHelix
              sequence={dnaSequenceString.split('')}
              isReplicating={state.isReplicating}
              replicationProgress={replicationProgress}
            />

            {state.isReplicating && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>تقدم التضاعف</span>
                  <span>{Math.round(replicationProgress)}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500"
                    style={{ width: `${replicationProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={() => generateNewDNASequence(20)} className="bg-blue-600 hover:bg-blue-700">
                <Dna className="w-4 h-4 ml-2" />
                تسلسل جديد
              </Button>
              {!state.isReplicating ? (
                <Button onClick={startReplication} className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Play className="w-4 h-4 ml-2" />
                  بدء التضاعف
                </Button>
              ) : (
                <Button onClick={stopReplication} className="bg-red-600 hover:bg-red-700">
                  إيقاف
                </Button>
              )}
            </div>

            <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
              <h4 className="text-white font-bold mb-3">📚 قواعد الارتباط:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(baseColors).map(([base, color]) => (
                  <div key={base} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: color }}>
                      {base}
                    </div>
                    <span className="text-white">↔</span>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" 
                      style={{ backgroundColor: baseColors[base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'G' ? 'C' : 'G'] }}>
                      {base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'G' ? 'C' : 'G'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Mutations Tab */}
        <TabsContent value="mutations">
          <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/70 border-red-500/30 backdrop-blur-sm' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
              ⚡ محاكاة الطفرات الجينية
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {MUTATION_TYPES.map((mutation) => (
                <motion.button
                  key={mutation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyMutation(mutation.id)}
                  className="p-4 rounded-xl border-2 text-right transition-all border-gray-600 bg-gray-800/50 hover:border-red-500/50"
                >
                  <div className="text-2xl mb-2">
                    {mutation.id === 'substitution' ? '🔄' : mutation.id === 'deletion' ? '❌' : '➕'}
                  </div>
                  <h4 className="text-white font-bold">{mutation.nameAr}</h4>
                  <p className="text-gray-400 text-sm mt-1">{mutation.description}</p>
                </motion.button>
              ))}
            </div>

            {mutationComparison && (
              <MutationVisual
                original={mutationComparison.original.split('')}
                mutated={mutationComparison.mutated.split('')}
                mutationType="substitution"
                isDarkMode={isDarkMode}
              />
            )}

              <Button onClick={resetMutation} variant="outline" className="mt-4">
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة تعيين
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeneticsLabSimulation;
