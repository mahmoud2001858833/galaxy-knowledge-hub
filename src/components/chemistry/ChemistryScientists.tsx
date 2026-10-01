import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Award, Sparkles, MessageSquare, FlaskConical } from 'lucide-react';
import { CHEMISTRY_SCIENTISTS_LIST, CHEMISTRY_FIELDS, ChemistryScientistItem } from '@/data/chemistryScientistsData';
import { ScientistAIDialogueModal } from '@/components/shared/ScientistAIDialogueModal';

const ChemistryScientists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [nobelOnly, setNobelOnly] = useState(false);
  const [activeDialogueScientist, setActiveDialogueScientist] = useState<ChemistryScientistItem | null>(null);

  const filteredScientists = useMemo(() => {
    return CHEMISTRY_SCIENTISTS_LIST.filter(s => {
      const matchesSearch = !searchTerm.trim() || 
        s.nameArabic.includes(searchTerm) || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.famousFor.includes(searchTerm) ||
        s.description.includes(searchTerm);

      const matchesField = selectedField === 'all' || s.field === selectedField;
      const matchesNobel = !nobelOnly || s.nobelPrize;

      return matchesSearch && matchesField && matchesNobel;
    });
  }, [searchTerm, selectedField, nobelOnly]);

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>موسوعة علماء الكيمياء الكبرى ({CHEMISTRY_SCIENTISTS_LIST.length} عالم عبر التاريخ)</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              رواد وعمالقة علم الكيمياء
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              استكشف حياة وإسهامات أعظم الكيميائيين من جابر بن حيان مؤسس الكيمياء ولافوازييه إلى مندلييف وأحمد زويل، وتحدث معهم مباشرة بالذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-amber-500/30 text-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 block font-mono">
                {CHEMISTRY_SCIENTISTS_LIST.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">عالم موثق</span>
            </div>
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-amber-500/30 text-center">
              <span className="text-3xl font-black text-amber-400 block font-mono">
                {CHEMISTRY_SCIENTISTS_LIST.filter(s => s.nobelPrize).length}
              </span>
              <span className="text-xs text-slate-400 font-medium">حائز على نوبل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن عالم (مثال: جابر بن حيان، لافوازييه، مندلييف، أحمد زويل، الجدول الدوري)..."
            className="pr-12 py-3.5 bg-slate-950/90 border-slate-700 text-white rounded-2xl text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">التصنيف حسب التخصص الكيميائي:</span>
            <button
              onClick={() => setNobelOnly(!nobelOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                nobelOnly
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الحائزون على نوبل فقط</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CHEMISTRY_FIELDS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  selectedField === f.id
                    ? 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scientists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScientists.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/50 font-semibold">
                  {s.fieldArabic}
                </span>
                <span className="text-3xl">{s.avatarEmoji}</span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{s.nameArabic}</h3>
                {s.nobelPrize && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>نوبل</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-amber-400 font-mono mb-2" dir="ltr">{s.name}</p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{s.period}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{s.country}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200 font-medium mb-3">
                <span className="text-amber-400 font-bold block mb-0.5">اشتُهر بـ:</span>
                {s.famousFor}
              </div>

              {s.keyReactionOrFormula && (
                <div className="p-2 rounded-xl bg-slate-950 text-xs font-mono text-cyan-300 text-left mb-3 overflow-x-auto" dir="ltr">
                  {s.keyReactionOrFormula}
                </div>
              )}

              <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <Button
                onClick={() => setActiveDialogueScientist(s)}
                className="flex-1 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-amber-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>حوار بالذكاء الاصطناعي</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredScientists.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900/50 text-center space-y-3">
          <p className="text-slate-400 text-lg">لم يتم العثور على علماء يطابقون معايير البحث.</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedField('all');
              setNobelOnly(false);
            }}
            variant="outline"
            className="rounded-xl border-slate-700 text-amber-400"
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}

      {/* Scholar AI Dialogue Modal */}
      <ScientistAIDialogueModal
        scientist={activeDialogueScientist}
        isOpen={Boolean(activeDialogueScientist)}
        onClose={() => setActiveDialogueScientist(null)}
        subject="chemistry"
      />
    </div>
  );
};

export default ChemistryScientists;
