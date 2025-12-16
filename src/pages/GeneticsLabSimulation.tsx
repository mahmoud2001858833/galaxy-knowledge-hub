import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Dna, FlaskConical, Sparkles, Sun, Moon, Info, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useGeneticsSimulation, Trait, Allele } from '@/hooks/useGeneticsSimulation';

const GeneticsLabSimulation = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('punnett');

  const {
    traits,
    selectedTrait,
    parent1Alleles,
    parent2Alleles,
    offspring,
    dnaSequence,
    mutationType,
    mutationPosition,
    mutatedSequence,
    setSelectedTrait,
    setParent1Alleles,
    setParent2Alleles,
    performCross,
    replicateDNA,
    applyMutation,
    setMutationType,
    setMutationPosition,
    getTraitPhenotype,
    calculateRatios
  } = useGeneticsSimulation();

  const currentTrait = traits.find(t => t.id === selectedTrait);
  const ratios = calculateRatios();

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

                <Select value={selectedTrait} onValueChange={setSelectedTrait}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="اختر صفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {traits.map(trait => (
                      <SelectItem key={trait.id} value={trait.id}>
                        {trait.name}
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
                        <strong>الأليل السائد ({currentTrait.dominant.symbol}):</strong> {currentTrait.dominant.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>الأليل المتنحي ({currentTrait.recessive.symbol}):</strong> {currentTrait.recessive.name}
                      </p>
                    </div>

                    {/* Parent 1 */}
                    <div>
                      <label className={`block mb-2 font-bold ${isDarkMode ? 'text-white' : ''}`}>
                        👨 الأب (الطراز الجيني)
                      </label>
                      <div className="flex gap-2">
                        {['AA', 'Aa', 'aa'].map(genotype => (
                          <Button
                            key={genotype}
                            variant={parent1Alleles === genotype ? 'default' : 'outline'}
                            onClick={() => setParent1Alleles(genotype)}
                            className={parent1Alleles !== genotype && isDarkMode ? 'border-gray-600 text-white' : ''}
                          >
                            {genotype.replace(/A/g, currentTrait.dominant.symbol).replace(/a/g, currentTrait.recessive.symbol)}
                          </Button>
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        المظهر: {getTraitPhenotype(parent1Alleles)}
                      </p>
                    </div>

                    {/* Parent 2 */}
                    <div>
                      <label className={`block mb-2 font-bold ${isDarkMode ? 'text-white' : ''}`}>
                        👩 الأم (الطراز الجيني)
                      </label>
                      <div className="flex gap-2">
                        {['AA', 'Aa', 'aa'].map(genotype => (
                          <Button
                            key={genotype}
                            variant={parent2Alleles === genotype ? 'default' : 'outline'}
                            onClick={() => setParent2Alleles(genotype)}
                            className={parent2Alleles !== genotype && isDarkMode ? 'border-gray-600 text-white' : ''}
                          >
                            {genotype.replace(/A/g, currentTrait.dominant.symbol).replace(/a/g, currentTrait.recessive.symbol)}
                          </Button>
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        المظهر: {getTraitPhenotype(parent2Alleles)}
                      </p>
                    </div>

                    <Button onClick={performCross} className="w-full bg-purple-600 hover:bg-purple-700">
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

                {currentTrait && offspring.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {/* Punnett Square Grid */}
                    <div className="grid grid-cols-3 gap-1 mb-4">
                      <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                      <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-purple-900 text-white' : 'bg-purple-200'}`}>
                        {parent2Alleles[0]}
                      </div>
                      <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-purple-900 text-white' : 'bg-purple-200'}`}>
                        {parent2Alleles[1] || parent2Alleles[0]}
                      </div>
                      
                      <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-200'}`}>
                        {parent1Alleles[0]}
                      </div>
                      {offspring.slice(0, 2).map((o, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-3 text-center font-bold rounded ${
                            o.includes('A') || o[0] === o[0].toUpperCase()
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {o}
                        </motion.div>
                      ))}

                      <div className={`p-2 text-center font-bold ${isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-200'}`}>
                        {parent1Alleles[1] || parent1Alleles[0]}
                      </div>
                      {offspring.slice(2, 4).map((o, i) => (
                        <motion.div
                          key={i + 2}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: (i + 2) * 0.1 }}
                          className={`p-3 text-center font-bold rounded ${
                            o.includes('A') || o[0] === o[0].toUpperCase()
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {o}
                        </motion.div>
                      ))}
                    </div>

                    {/* Results */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📈 النسب المتوقعة:</h4>
                      <div className="space-y-2">
                        {Object.entries(ratios.genotype).map(([genotype, ratio]) => (
                          <div key={genotype} className="flex items-center gap-2">
                            <Badge variant="outline">{genotype}</Badge>
                            <div className={`flex-1 h-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${ratio}%` }}
                                className="h-full bg-purple-600 rounded-full"
                              />
                            </div>
                            <span className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>{ratio}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>الصفة السائدة</p>
                          <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{ratios.phenotype.dominant}%</p>
                        </div>
                        <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>الصفة المتنحية</p>
                          <p className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{ratios.phenotype.recessive}%</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
                    {dnaSequence.split('').map((base, i) => (
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
                    {dnaSequence.split('').map((base, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 + 0.5 }}
                        className="w-10 h-10 rounded flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: baseColors[complementaryBase[base]] }}
                      >
                        {complementaryBase[base]}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Button onClick={replicateDNA} className="bg-blue-600 hover:bg-blue-700">
                  <Dna className="w-4 h-4 ml-2" />
                  إنشاء تسلسل جديد
                </Button>

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
                  ⚡ محاكاة الطفرات الجينية
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-white' : ''}`}>نوع الطفرة:</label>
                    <Select value={mutationType} onValueChange={(v: any) => setMutationType(v)}>
                      <SelectTrigger className={isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="substitution">استبدال (Substitution)</SelectItem>
                        <SelectItem value="insertion">إضافة (Insertion)</SelectItem>
                        <SelectItem value="deletion">حذف (Deletion)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-white' : ''}`}>موقع الطفرة (1-{dnaSequence.length}):</label>
                    <input
                      type="number"
                      min={1}
                      max={dnaSequence.length}
                      value={mutationPosition}
                      onChange={(e) => setMutationPosition(parseInt(e.target.value) || 1)}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                  </div>

                  <Button onClick={applyMutation} className="w-full bg-red-600 hover:bg-red-700">
                    <Sparkles className="w-4 h-4 ml-2" />
                    تطبيق الطفرة
                  </Button>
                </div>

                {/* Mutation Types Info */}
                <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>📖 أنواع الطفرات:</h4>
                  <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-300' : ''}`}>
                    <li><strong>الاستبدال:</strong> تبديل قاعدة بأخرى</li>
                    <li><strong>الإضافة:</strong> إضافة قاعدة جديدة</li>
                    <li><strong>الحذف:</strong> إزالة قاعدة من التسلسل</li>
                  </ul>
                </div>
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
                  📊 نتيجة الطفرة
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>التسلسل الأصلي:</h4>
                    <div className="flex flex-wrap gap-1">
                      {dnaSequence.split('').map((base, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm ${
                            i === mutationPosition - 1 ? 'ring-2 ring-yellow-400' : ''
                          }`}
                          style={{ backgroundColor: baseColors[base] }}
                        >
                          {base}
                        </div>
                      ))}
                    </div>
                  </div>

                  {mutatedSequence && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>التسلسل بعد الطفرة:</h4>
                      <div className="flex flex-wrap gap-1">
                        {mutatedSequence.split('').map((base, i) => {
                          const isChanged = i === mutationPosition - 1 || 
                            (mutationType === 'insertion' && i === mutationPosition - 1) ||
                            (mutationType === 'deletion' && i >= mutationPosition - 1);
                          return (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm ${
                                isChanged ? 'ring-2 ring-red-400' : ''
                              }`}
                              style={{ backgroundColor: baseColors[base] }}
                            >
                              {base}
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                          <strong>التغيير:</strong> {
                            mutationType === 'substitution' ? 'تم استبدال قاعدة' :
                            mutationType === 'insertion' ? 'تم إضافة قاعدة جديدة' :
                            'تم حذف قاعدة'
                          } في الموقع {mutationPosition}
                        </p>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          الطول الأصلي: {dnaSequence.length} | الطول الجديد: {mutatedSequence.length}
                        </p>
                      </div>
                    </motion.div>
                  )}
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
