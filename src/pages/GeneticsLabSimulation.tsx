import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Dna, FlaskConical, Sparkles, Sun, Moon, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useGeneticsSimulation, TRAITS, DNA_BASES, MUTATION_TYPES } from '@/hooks/useGeneticsSimulation';

const GeneticsLabSimulation = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('punnett');

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

  // Auto-calculate Punnett square when parents change
  useEffect(() => {
    calculatePunnettSquare();
  }, [state.parent1.genotype, state.parent2.genotype, state.selectedTrait]);

  // Animation for DNA replication
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isReplicating) {
      interval = setInterval(() => {
        advanceReplication();
      }, 200);
    }
    return () => clearInterval(interval);
  }, [state.isReplicating, advanceReplication]);

  // DNA base colors
  const baseColors: Record<string, string> = {
    'A': '#FF6B6B',
    'T': '#4ECDC4',
    'G': '#45B7D1',
    'C': '#96CEB4'
  };

  const complementaryBase: Record<string, string> = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G'
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

  const renderPunnettSquare = () => {
    if (!currentTrait || state.punnettResults.length === 0) return null;
    
    const parent1 = state.parent1.genotype;
    const parent2 = state.parent2.genotype;
    
    // Create the 2x2 grid
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

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Punnett Square Grid */}
        <div className="grid grid-cols-3 gap-1 mb-4 max-w-xs mx-auto">
          <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-purple-900 text-white' : 'bg-purple-200'}`}>
            {parent2[0]}
          </div>
          <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-purple-900 text-white' : 'bg-purple-200'}`}>
            {parent2[1]}
          </div>
          
          <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-200'}`}>
            {parent1[0]}
          </div>
          {grid[0].map((g, i) => (
            <motion.div
              key={`r0-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 text-center font-bold rounded ${
                g.includes(currentTrait.alleles[0].symbol)
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}
            >
              {g}
            </motion.div>
          ))}

          <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-200'}`}>
            {parent1[1]}
          </div>
          {grid[1].map((g, i) => (
            <motion.div
              key={`r1-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (i + 2) * 0.1 }}
              className={`p-3 text-center font-bold rounded ${
                g.includes(currentTrait.alleles[0].symbol)
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}
            >
              {g}
            </motion.div>
          ))}
        </div>

        {/* Results */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📈 النسب المتوقعة:</h4>
          <div className="space-y-2">
            {genotypeRatios.map((ratio, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="outline">{ratio.genotype}</Badge>
                <div className={`flex-1 h-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(ratio.count / 4) * 100}%` }}
                    className="h-full bg-purple-600 rounded-full"
                  />
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>{ratio.count}/4</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {phenotypeRatios.map((ratio, i) => (
              <div key={i} className={`p-2 rounded text-center ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>{ratio.phenotype}</p>
                <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{ratio.count}/4</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-purple-950 via-gray-900 to-green-950' : 'bg-gradient-to-br from-purple-50 via-white to-green-50'} transition-colors duration-500`}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 flex items-center justify-between"
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

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="punnett" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              مربع بانيت
            </TabsTrigger>
            <TabsTrigger value="dna" className="gap-2">
              <Dna className="w-4 h-4" />
              تضاعف DNA
            </TabsTrigger>
            <TabsTrigger value="mutations" className="gap-2">
              <Sparkles className="w-4 h-4" />
              الطفرات
            </TabsTrigger>
          </TabsList>

          {/* Punnett Square Tab */}
          <TabsContent value="punnett">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Controls */}
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-purple-500/30' : 'bg-white'}`}>
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
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>الأليل السائد ({currentTrait.alleles[0].symbol}):</strong> {currentTrait.alleles[0].nameAr}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>الأليل المتنحي ({currentTrait.alleles[1].symbol}):</strong> {currentTrait.alleles[1].nameAr}
                      </p>
                    </div>

                    {/* Parent 1 */}
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
                            className={state.parent1.genotype.join('') !== opt.value && isDarkMode ? 'border-gray-600 text-white' : ''}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        المظهر: {state.parent1.phenotype}
                      </p>
                    </div>

                    {/* Parent 2 */}
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
                            className={state.parent2.genotype.join('') !== opt.value && isDarkMode ? 'border-gray-600 text-white' : ''}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        المظهر: {state.parent2.phenotype}
                      </p>
                    </div>

                    <Button onClick={calculatePunnettSquare} className="w-full bg-purple-600 hover:bg-purple-700">
                      <Shuffle className="w-4 h-4 ml-2" />
                      إجراء التهجين
                    </Button>
                  </motion.div>
                )}
              </Card>

              {/* Punnett Square Result */}
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-purple-500/30' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  📊 مربع بانيت والنتائج
                </h3>
                {renderPunnettSquare()}
              </Card>
            </div>
          </TabsContent>

          {/* DNA Replication Tab */}
          <TabsContent value="dna">
            <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-blue-500/30' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                🧬 محاكاة تضاعف الـ DNA
              </h3>

              <div className="space-y-6">
                {/* Original DNA Strand */}
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>الشريط الأصلي (5' → 3')</h4>
                  <div className="flex flex-wrap gap-1">
                    {dnaSequenceString.split('').map((base, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="w-10 h-10 rounded flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: baseColors[base] }}
                      >
                        {base}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Base Pairing */}
                <div className="flex justify-center">
                  <div className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
                    ⬇️ الارتباط الهيدروجيني ⬇️
                  </div>
                </div>

                {/* Complementary Strand */}
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>الشريط المكمل (3' → 5')</h4>
                  <div className="flex flex-wrap gap-1">
                    {complementaryString.split('').map((base, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 + 0.5 }}
                        className="w-10 h-10 rounded flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: baseColors[base] }}
                      >
                        {base}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => generateNewDNASequence(20)} className="bg-blue-600 hover:bg-blue-700">
                    <Dna className="w-4 h-4 ml-2" />
                    إنشاء تسلسل جديد
                  </Button>
                  {!state.isReplicating ? (
                    <Button onClick={startReplication} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 ml-2" />
                      بدء التضاعف
                    </Button>
                  ) : (
                    <Button onClick={stopReplication} className="bg-red-600 hover:bg-red-700">
                      إيقاف
                    </Button>
                  )}
                </div>

                {/* Base Pairing Rules */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📚 قواعد الارتباط:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: baseColors['A'] }}>A</span>
                      <span>↔</span>
                      <span className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: baseColors['T'] }}>T</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>(رابطتان)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: baseColors['G'] }}>G</span>
                      <span>↔</span>
                      <span className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: baseColors['C'] }}>C</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>(3 روابط)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Mutations Tab */}
          <TabsContent value="mutations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  ⚡ أنواع الطفرات
                </h3>

                <div className="space-y-2">
                  {MUTATION_TYPES.map(mutation => (
                    <Button
                      key={mutation.id}
                      variant={state.mutationType === mutation.id ? 'default' : 'outline'}
                      onClick={() => applyMutation(mutation.id)}
                      className={`w-full justify-between ${state.mutationType !== mutation.id && isDarkMode ? 'border-gray-600 text-white' : ''}`}
                    >
                      <span>{mutation.nameAr}</span>
                      <Badge variant={
                        mutation.effect === 'harmful' ? 'destructive' : 
                        mutation.effect === 'beneficial' ? 'default' : 'secondary'
                      }>
                        {mutation.effect === 'harmful' ? 'ضار' : 
                         mutation.effect === 'beneficial' ? 'مفيد' : 'محايد'}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={resetMutation}
                  variant="outline"
                  className={`w-full mt-4 ${isDarkMode ? 'border-gray-600 text-white' : ''}`}
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  إعادة تعيين
                </Button>

                {state.mutationType && (
                  <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>
                      {MUTATION_TYPES.find(m => m.id === state.mutationType)?.nameAr}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {MUTATION_TYPES.find(m => m.id === state.mutationType)?.description}
                    </p>
                  </div>
                )}
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  🔬 مقارنة التسلسل
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>التسلسل الأصلي:</h4>
                    <div className="flex flex-wrap gap-1">
                      {mutationComparison.original.split('').map((base, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm ${
                            mutationComparison.differences.includes(i) ? 'ring-2 ring-yellow-400' : ''
                          }`}
                          style={{ backgroundColor: baseColors[base] }}
                        >
                          {base}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>التسلسل بعد الطفرة:</h4>
                    <div className="flex flex-wrap gap-1">
                      {mutationComparison.mutated.split('').map((base, i) => (
                        <motion.div
                          key={i}
                          initial={mutationComparison.differences.includes(i) ? { scale: 1.2 } : {}}
                          animate={{ scale: 1 }}
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm ${
                            mutationComparison.differences.includes(i) ? 'ring-2 ring-red-400' : ''
                          }`}
                          style={{ backgroundColor: baseColors[base] || '#666' }}
                        >
                          {base}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {mutationComparison.lengthChange !== 0 && (
                    <Badge variant={mutationComparison.lengthChange > 0 ? 'default' : 'destructive'}>
                      {mutationComparison.lengthChange > 0 ? `+${mutationComparison.lengthChange}` : mutationComparison.lengthChange} قاعدة
                    </Badge>
                  )}

                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      عدد التغييرات: {mutationComparison.differences.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeneticsLabSimulation;
