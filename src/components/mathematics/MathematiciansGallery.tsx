import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Award, Sparkles, MessageSquare, BookOpen, Quote, Filter } from 'lucide-react';
import { MATHEMATICIANS_LIST, MATHEMATICIAN_ERAS, MATHEMATICIAN_FIELDS, MathematicianItem } from '@/data/mathematiciansData';
import { ScientistAIDialogueModal } from '@/components/shared/ScientistAIDialogueModal';

const MathematiciansGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [activeDialogueScientist, setActiveDialogueScientist] = useState<MathematicianItem | null>(null);

  // Filter mathematicians
  const filteredMathematicians = useMemo(() => {
    return MATHEMATICIANS_LIST.filter(m => {
      const matchesSearch = !searchTerm.trim() || 
        m.nameArabic.includes(searchTerm) || 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.famousFor.includes(searchTerm) ||
        m.description.includes(searchTerm);

      const matchesEra = selectedEra === 'all' || m.era === selectedEra;
      const matchesField = selectedField === 'all' || m.field === selectedField;

      return matchesSearch && matchesEra && matchesField;
    });
  }, [searchTerm, selectedEra, selectedField]);

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>موسوعة أعلام الرياضيات الكبرى ({MATHEMATICIANS_LIST.length} عالم عبر التاريخ)</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              أعلام وعباقرة الرياضيات
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              استكشف سير وإنجازات أعظم علماء الرياضيات الذين صاغوا لغة الكون، وتحدث معهم افتراضياً عبر الذكاء الاصطناعي لاستكشاف أسرار نظرياتهم ومعادلاتهم.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-purple-500/30 text-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 block font-mono">
                {MATHEMATICIANS_LIST.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">عالم موثق</span>
            </div>
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-purple-500/30 text-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 block font-mono">
                4
              </span>
              <span className="text-xs text-slate-400 font-medium">عصور حضارية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن عالم (مثال: الخوارزمي، فيثاغورس، أويلر، ريمان، نظرية الأعداد)..."
            className="pr-12 py-3.5 bg-slate-950/90 border-slate-700 text-white rounded-2xl text-sm"
          />
        </div>

        {/* Era Filter Chips */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-bold block">التصنيف حسب العصر والحضارة:</span>
          <div className="flex flex-wrap gap-2">
            {MATHEMATICIAN_ERAS.map((era) => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  selectedEra === era.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Field Filter Chips */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-bold block">التصنيف حسب التخصص الدقيق:</span>
          <div className="flex flex-wrap gap-2">
            {MATHEMATICIAN_FIELDS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedField === f.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mathematicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMathematicians.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/50 font-semibold">
                  {m.eraArabic}
                </span>
                <span className="text-3xl">{m.avatarEmoji}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-0.5">{m.nameArabic}</h3>
              <p className="text-xs text-cyan-400 font-mono mb-2" dir="ltr">{m.name}</p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{m.period}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{m.country}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200 font-medium mb-3">
                <span className="text-purple-400 font-bold block mb-0.5">اشتُهر بـ:</span>
                {m.famousFor}
              </div>

              {m.keyFormula && (
                <div className="p-2 rounded-xl bg-slate-950 text-xs font-mono text-cyan-300 text-left mb-3 overflow-x-auto" dir="ltr">
                  {m.keyFormula}
                </div>
              )}

              <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                {m.description}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <Button
                onClick={() => setActiveDialogueScientist(m)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-purple-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>حوار بالذكاء الاصطناعي</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMathematicians.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900/50 text-center space-y-3">
          <p className="text-slate-400 text-lg">لم يتم العثور على علماء يطابقون معايير البحث المحددة.</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedEra('all');
              setSelectedField('all');
            }}
            variant="outline"
            className="rounded-xl border-slate-700 text-purple-400"
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}

      {/* Scientist AI Dialogue Modal */}
      <ScientistAIDialogueModal
        scientist={activeDialogueScientist}
        isOpen={Boolean(activeDialogueScientist)}
        onClose={() => setActiveDialogueScientist(null)}
        subject="math"
      />
    </div>
  );
};

export default MathematiciansGallery;
