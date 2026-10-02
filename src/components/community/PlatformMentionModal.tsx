import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Atom,
  Bot,
  BookOpen,
  Sparkles,
  BookMarked,
  HeartPulse,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PLATFORM_MENTION_RESOURCES,
  PlatformResourceMention
} from '@/data/platformMentionsData';

interface PlatformMentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource?: (resource: PlatformResourceMention) => void;
  onSelectMention?: (mention: PlatformResourceMention) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  simulations: Atom,
  robotics: Bot,
  curriculum: BookOpen,
  ai: Sparkles,
  journal: BookMarked,
  damij: HeartPulse
};

export const PlatformMentionModal: React.FC<PlatformMentionModalProps> = ({
  isOpen,
  onClose,
  onSelectResource
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredResources = useMemo(() => {
    let list = PLATFORM_MENTION_RESOURCES;

    if (activeTab !== 'all') {
      list = list.filter(r => r.categoryKey === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.badge.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              @
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                الإشارة إلى محاكاة أو قسم بالمنصة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر المحاكاة أو المختبر ليتم إرفاقه ببطاقة تفاعلية ينقر عليها زملاؤك للانتقال فوراً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن محاكاة أو مختبر (مثل: هادرونات LHC, ذراع روبوتية, كريسبر, توجيهي)..."
            className="ps-10 pe-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs sm:text-sm h-11"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'simulations', label: 'المحاكيات 3D' },
            { id: 'robotics', label: 'الروبوتات و AI' },
            { id: 'curriculum', label: 'المناهج و BTEC' },
            { id: 'ai', label: 'أدوات الذكاء الاصطناعي' },
            { id: 'journal', label: 'المجلة والمكتبة' },
            { id: 'damij', label: 'منصة دمج' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resource List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredResources.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              لم يتم العثور على مورد مطابق لبحثك.
            </div>
          ) : (
            filteredResources.map((res) => {
              const Icon = CATEGORY_ICONS[res.categoryKey] || Sparkles;

              return (
                <button
                  key={res.id}
                  onClick={() => {
                    onSelectResource(res);
                    onClose();
                  }}
                  className="w-full text-right p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50/60 dark:bg-slate-950/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {res.title}
                        </h4>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-blue-500/30 text-blue-600 dark:text-blue-400">
                          {res.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {res.summary}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>إرفاق</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
