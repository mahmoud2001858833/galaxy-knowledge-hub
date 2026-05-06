// Unified ADHD games registry — diagnostic + therapy
import { Activity, Brain, Eye, Hand, Layers, Sparkles, Target, Timer, Wind, Trophy, Puzzle } from 'lucide-react';

export type GameKind = 'screening' | 'therapy';
export type GameTarget = 'sustained_attention' | 'impulse_control' | 'working_memory' | 'cognitive_flexibility' | 'reaction' | 'self_regulation' | 'inhibition' | 'timing';

export interface GameDef {
  key: string;
  title: string;
  description: string;
  kind: GameKind | 'both';
  target: GameTarget;
  durationSec: number;
  icon: any;
  color: string; // tailwind class
  // Implementation: 'builtin' = our generic engine; or path to legacy task
  impl: 'tap_target' | 'go_nogo' | 'memory_seq' | 'stroop' | 'rt_reflex' | 'switch' | 'breath' | 'pomodoro' | 'rhythm';
}

export const GAMES: GameDef[] = [
  // --- Diagnostic (screening) battery ---
  {
    key: 'forest_hunter',
    title: 'صيّاد الغابة',
    description: 'انقر على الأرنب فقط — تجاهل الذئب. يقيس الانتباه المستمر.',
    kind: 'both', target: 'sustained_attention', durationSec: 90,
    icon: Eye, color: 'from-emerald-500 to-green-600', impl: 'tap_target',
  },
  {
    key: 'stop_rocket',
    title: 'إيقاف الصاروخ',
    description: 'انقر بسرعة، لكن توقّف عند الإشارة الحمراء. يقيس التحكم بالاندفاع.',
    kind: 'both', target: 'impulse_control', durationSec: 90,
    icon: Hand, color: 'from-rose-500 to-red-600', impl: 'go_nogo',
  },
  {
    key: 'color_chaos',
    title: 'فوضى الألوان',
    description: 'انقر على لون الكلمة لا معناه. يقيس المرونة المعرفية.',
    kind: 'both', target: 'cognitive_flexibility', durationSec: 90,
    icon: Layers, color: 'from-fuchsia-500 to-purple-600', impl: 'stroop',
  },
  {
    key: 'memory_garden',
    title: 'حديقة الذاكرة',
    description: 'تذكّر تسلسل الأزهار وأعد ترتيبها. يقيس الذاكرة العاملة.',
    kind: 'both', target: 'working_memory', durationSec: 90,
    icon: Brain, color: 'from-indigo-500 to-blue-600', impl: 'memory_seq',
  },
  {
    key: 'reaction_reflex',
    title: 'ردّ الفعل',
    description: 'انقر فور تغيّر اللون. يقيس سرعة المعالجة.',
    kind: 'both', target: 'reaction', durationSec: 60,
    icon: Activity, color: 'from-amber-500 to-orange-600', impl: 'rt_reflex',
  },
  {
    key: 'switcheroo',
    title: 'بدّلها',
    description: 'القاعدة تتغيّر فجأة — تكيّف! يقيس التحوّل المعرفي.',
    kind: 'both', target: 'cognitive_flexibility', durationSec: 90,
    icon: Sparkles, color: 'from-cyan-500 to-teal-600', impl: 'switch',
  },
  // --- Therapy ---
  {
    key: 'pomodoro_quest',
    title: 'مهمة بومودورو',
    description: 'فترات تركيز قصيرة لبناء قدرة الانتباه.',
    kind: 'therapy', target: 'sustained_attention', durationSec: 300,
    icon: Timer, color: 'from-orange-500 to-red-500', impl: 'pomodoro',
  },
  {
    key: 'calm_breath',
    title: 'تنفّس الهدوء',
    description: 'تمرين تنفّس موجَّه لتنظيم الذات.',
    kind: 'therapy', target: 'self_regulation', durationSec: 180,
    icon: Wind, color: 'from-sky-400 to-cyan-500', impl: 'breath',
  },
  {
    key: 'token_hunt',
    title: 'صيد الرموز',
    description: 'انقر فقط على الرمز المطلوب لتدريب الكفّ.',
    kind: 'therapy', target: 'impulse_control', durationSec: 120,
    icon: Trophy, color: 'from-yellow-500 to-amber-600', impl: 'tap_target',
  },
  {
    key: 'mindful_maze',
    title: 'متاهة التركيز',
    description: 'القواعد تتغيّر — تدرّب على المرونة.',
    kind: 'therapy', target: 'cognitive_flexibility', durationSec: 120,
    icon: Puzzle, color: 'from-purple-500 to-pink-600', impl: 'switch',
  },
  {
    key: 'memory_builder',
    title: 'بنّاء الذاكرة',
    description: 'تسلسلات أطول مع كل جلسة لتنمية الذاكرة العاملة.',
    kind: 'therapy', target: 'working_memory', durationSec: 180,
    icon: Brain, color: 'from-blue-500 to-indigo-600', impl: 'memory_seq',
  },
  {
    key: 'rhythm_focus',
    title: 'إيقاع التركيز',
    description: 'انقر على الإيقاع لتحسين التوقيت والتركيز.',
    kind: 'therapy', target: 'timing', durationSec: 120,
    icon: Activity, color: 'from-pink-500 to-rose-600', impl: 'rhythm',
  },
  {
    key: 'stop_signal_train',
    title: 'إشارة التوقّف',
    description: 'تدريب الكفّ بإشارات إيقاف عشوائية.',
    kind: 'therapy', target: 'inhibition', durationSec: 120,
    icon: Hand, color: 'from-red-500 to-rose-600', impl: 'go_nogo',
  },
];

export const SCREENING_BATTERY = ['forest_hunter','stop_rocket','color_chaos','memory_garden','reaction_reflex','switcheroo'];

export function getGame(key: string) {
  return GAMES.find(g => g.key === key);
}
