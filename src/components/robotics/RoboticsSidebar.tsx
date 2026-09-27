import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Cpu,
  Bot,
  Radar,
  BrainCircuit,
  Swords,
  Printer,
  Code2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  GraduationCap,
  Activity,
  CheckCircle2,
  Wand2,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface NavSectionItem {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconColor: string;
  group: 'foundations' | 'hardware' | 'ai' | 'industrial';
}

export const ROBOTICS_NAV_ITEMS: NavSectionItem[] = [
  {
    id: 'pathways',
    title: 'خريطة المسارات والاعتمادات',
    shortTitle: 'المسارات',
    subtitle: '4 مسارات من الصفر حتى مهندس روبوتات',
    badge: 'خارطة طريق',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: Layers,
    iconColor: 'text-blue-500',
    group: 'foundations'
  },
  {
    id: 'wokwi',
    title: 'محاكي العتاد والدوائر (Wokwi)',
    shortTitle: 'العتاد وWokwi',
    subtitle: 'متحكمات ESP32 وArduino وإشارات PWM',
    badge: 'محاكاة حية',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Cpu,
    iconColor: 'text-emerald-500',
    group: 'hardware'
  },
  {
    id: 'arm',
    title: 'حركيات الذراع الروبوتية (Kinematics)',
    shortTitle: 'الذراع والمفاصل',
    subtitle: 'حساب زوايا المفاصل وD-H Parameters',
    badge: '3D تفاعلي',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: Bot,
    iconColor: 'text-blue-500',
    group: 'hardware'
  },
  {
    id: 'amr',
    title: 'الملاحة الذاتية والليدار (360° LiDAR)',
    shortTitle: 'الملاحة والليدار',
    subtitle: 'مسح البيئة بـ SLAM وتفادي العقبات',
    badge: 'ToF Laser',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    icon: Radar,
    iconColor: 'text-cyan-500',
    group: 'hardware'
  },
  {
    id: 'vision',
    title: 'مختبر الرؤية الحاسوبية والوكلاء',
    shortTitle: 'الرؤية والذكاء',
    subtitle: 'نماذج YOLOv8 والتعرف على القطع',
    badge: 'YOLOv8',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: BrainCircuit,
    iconColor: 'text-purple-500',
    group: 'ai'
  },
  {
    id: 'arena',
    title: 'حلبة الأكواد والمتاهة (A* Arena)',
    shortTitle: 'حلبة المتاهة',
    subtitle: 'سباق خوارزميات البحث وتخطيط المسار',
    badge: 'تحدي كود',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Swords,
    iconColor: 'text-amber-500',
    group: 'ai'
  },
  {
    id: 'digital-twin',
    title: 'التوأم الرقمي والطباعة ثلاثية الأبعاد',
    shortTitle: 'التوأم وSTL',
    subtitle: '5 مشاريع كابستون وقوائم مواد BOM',
    badge: '5 مشاريع',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    icon: Printer,
    iconColor: 'text-indigo-500',
    group: 'industrial'
  },
  {
    id: 'code',
    title: 'استوديو ROS 2 & Python المتقدم',
    shortTitle: 'برمجة ROS 2',
    subtitle: 'العقد والمواضيع ومصفوفات التحويل الفوري',
    badge: 'طرفية حية',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: Code2,
    iconColor: 'text-purple-500',
    group: 'industrial'
  }
];

export const NAV_GROUPS = [
  { id: 'foundations', label: 'التأسيس والمسارات الأكاديمية' },
  { id: 'hardware', label: 'العتاد والمحاكاة الفيزيائية' },
  { id: 'ai', label: 'الذكاء الاصطناعي والرؤية' },
  { id: 'industrial', label: 'التصنيع والبرمجة الصناعية' }
];

interface RoboticsSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onResetAll?: () => void;
}

export const RoboticsSidebar: React.FC<RoboticsSidebarProps> = ({
  activeTab,
  onSelectTab,
  onResetAll
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<string[]>([
    'pathways',
    'arm'
  ]);

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setIsMobileOpen(false);
    if (!completedTabs.includes(id)) {
      setCompletedTabs(prev => [...prev, id]);
    }
  };

  const progressPercentage = Math.round((completedTabs.length / ROBOTICS_NAV_ITEMS.length) * 100);

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-6">
      {/* Sidebar Header & Brand */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-slate-900/10 dark:from-blue-900/30 dark:via-slate-900 dark:to-indigo-900/30 border border-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                مختبرات الروبوتات
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                8 بيئات تعلم تفاعلية
              </span>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1 inline-block" />
            نشط
          </Badge>
        </div>

        {/* Student Progress Metric */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              إنجاز التجارب:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              {completedTabs.length} / {ROBOTICS_NAV_ITEMS.length} ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Nav List with Grouping */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {NAV_GROUPS.map(group => {
          const groupItems = ROBOTICS_NAV_ITEMS.filter(item => item.group === group.id);
          return (
            <div key={group.id} className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                {group.label}
              </div>

              <div className="space-y-1.5">
                {groupItems.map(item => {
                  const isActive = activeTab === item.id;
                  const isCompleted = completedTabs.includes(item.id);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-right p-3 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden group ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                          : 'bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidePill"
                          className="absolute inset-y-0 start-0 w-1.5 bg-cyan-400 rounded-r-full"
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-500/10 group-hover:text-blue-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Title & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {item.title}
                          </h4>
                          {isCompleted && (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? 'text-cyan-300' : 'text-emerald-500'
                              }`}
                            />
                          )}
                        </div>

                        <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                              isActive
                                ? 'bg-white/20 text-white border-white/30'
                                : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                          <span
                            className={`text-[10px] flex items-center gap-0.5 font-bold ${
                              isActive ? 'text-amber-200' : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5 ml-0.5" />
                            شرح ذكي ✨
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Assistant Help Card in Sidebar */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/20 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Wand2 className="w-4 h-4 text-indigo-500" />
          <span>مرشد الذكاء الاصطناعي للروبوتات</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          في كل مختبر تفتحه، ستجد المعلم الذكي أعلى الصفحة يشرح لك المفهوم، المعادلة، ويعطيك تحدياً تفاعلياً للتطبيق!
        </p>
        {onResetAll && (
          <Button
            size="sm"
            variant="outline"
            onClick={onResetAll}
            className="w-full text-[11px] h-8 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3 h-3 ml-1" />
            إعادة ضبط كافة المحاكيات
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (RTL: Placed gracefully on side) */}
      <aside className="hidden lg:block w-80 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">المختبر الحالي:</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
              {ROBOTICS_NAV_ITEMS.find(i => i.id === activeTab)?.title || 'المختبرات'}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl gap-1.5 shadow-sm"
        >
          <Menu className="w-4 h-4 ml-1" />
          <span>قائمة المختبرات ({ROBOTICS_NAV_ITEMS.length})</span>
        </Button>
      </div>

      {/* Mobile Full Screen Drawer / Modal */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-5/6 max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  قائمة مختبرات الروبوتات
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
