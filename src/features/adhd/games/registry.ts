// Unified ADHD games registry — diagnostic + therapy
import { Activity, Brain, Eye, Hand, Layers, Sparkles, Target, Timer, Wind, Trophy, Puzzle, Zap, Flame, Music, Rocket, Star, Crosshair, Shuffle, Gauge, Flag, Ghost, Bomb, Snowflake, Sun, Moon, Heart, Anchor, Compass } from 'lucide-react';

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
  color: string;
  impl: 'tap_target' | 'go_nogo' | 'memory_seq' | 'stroop' | 'rt_reflex' | 'switch' | 'breath' | 'pomodoro' | 'rhythm';
}

export const GAMES: GameDef[] = [
  // === Diagnostic Battery (6) ===
  { key: 'forest_hunter', title: 'صيّاد الغابة', description: 'انقر على الأرنب فقط — تجاهل الذئب. يقيس الانتباه المستمر.', kind: 'both', target: 'sustained_attention', durationSec: 90, icon: Eye, color: 'from-emerald-500 to-green-600', impl: 'tap_target' },
  { key: 'stop_rocket', title: 'إيقاف الصاروخ', description: 'انقر بسرعة، لكن توقّف عند الإشارة الحمراء. يقيس التحكم بالاندفاع.', kind: 'both', target: 'impulse_control', durationSec: 90, icon: Hand, color: 'from-rose-500 to-red-600', impl: 'go_nogo' },
  { key: 'color_chaos', title: 'فوضى الألوان', description: 'انقر على لون الكلمة لا معناه. يقيس المرونة المعرفية.', kind: 'both', target: 'cognitive_flexibility', durationSec: 90, icon: Layers, color: 'from-fuchsia-500 to-purple-600', impl: 'stroop' },
  { key: 'memory_garden', title: 'حديقة الذاكرة', description: 'تذكّر تسلسل الأزهار وأعد ترتيبها. يقيس الذاكرة العاملة.', kind: 'both', target: 'working_memory', durationSec: 90, icon: Brain, color: 'from-indigo-500 to-blue-600', impl: 'memory_seq' },
  { key: 'reaction_reflex', title: 'ردّ الفعل', description: 'انقر فور تغيّر اللون. يقيس سرعة المعالجة.', kind: 'both', target: 'reaction', durationSec: 60, icon: Activity, color: 'from-amber-500 to-orange-600', impl: 'rt_reflex' },
  { key: 'switcheroo', title: 'بدّلها', description: 'القاعدة تتغيّر فجأة — تكيّف! يقيس التحوّل المعرفي.', kind: 'both', target: 'cognitive_flexibility', durationSec: 90, icon: Sparkles, color: 'from-cyan-500 to-teal-600', impl: 'switch' },

  // === Extended Diagnostic Variants ===
  { key: 'space_watch', title: 'حارس الفضاء', description: 'راقب النيازك وانقر فقط على الذهبي منها.', kind: 'both', target: 'sustained_attention', durationSec: 120, icon: Star, color: 'from-slate-700 to-indigo-800', impl: 'tap_target' },
  { key: 'ninja_strike', title: 'ضربة النينجا', description: 'سرعة قصوى، لكن لا تخطئ الإشارة الحمراء.', kind: 'both', target: 'impulse_control', durationSec: 90, icon: Zap, color: 'from-red-600 to-pink-700', impl: 'go_nogo' },
  { key: 'word_color_dual', title: 'الكلمة واللون', description: 'تحدٍّ ستروب متقدّم لقياس المرونة.', kind: 'both', target: 'cognitive_flexibility', durationSec: 120, icon: Shuffle, color: 'from-purple-600 to-pink-600', impl: 'stroop' },
  { key: 'sequence_master', title: 'سيّد التسلسل', description: 'تسلسلات أطول لذاكرة عاملة قوية.', kind: 'both', target: 'working_memory', durationSec: 150, icon: Brain, color: 'from-blue-600 to-cyan-700', impl: 'memory_seq' },
  { key: 'lightning_tap', title: 'ومضة البرق', description: 'تفاعل فوري عند الضوء الأخضر.', kind: 'both', target: 'reaction', durationSec: 60, icon: Flame, color: 'from-yellow-500 to-amber-600', impl: 'rt_reflex' },
  { key: 'rule_swap', title: 'تبديل القواعد', description: 'تغيير قواعد متكرّر لتدريب المرونة.', kind: 'both', target: 'cognitive_flexibility', durationSec: 120, icon: Compass, color: 'from-teal-600 to-emerald-700', impl: 'switch' },

  // === Therapy Library (large) ===
  { key: 'pomodoro_quest', title: 'مهمة بومودورو', description: 'فترات تركيز قصيرة لبناء قدرة الانتباه.', kind: 'therapy', target: 'sustained_attention', durationSec: 300, icon: Timer, color: 'from-orange-500 to-red-500', impl: 'pomodoro' },
  { key: 'calm_breath', title: 'تنفّس الهدوء', description: 'تمرين تنفّس موجَّه لتنظيم الذات.', kind: 'therapy', target: 'self_regulation', durationSec: 180, icon: Wind, color: 'from-sky-400 to-cyan-500', impl: 'breath' },
  { key: 'token_hunt', title: 'صيد الرموز', description: 'انقر فقط على الرمز المطلوب لتدريب الكفّ.', kind: 'therapy', target: 'impulse_control', durationSec: 120, icon: Trophy, color: 'from-yellow-500 to-amber-600', impl: 'tap_target' },
  { key: 'mindful_maze', title: 'متاهة التركيز', description: 'القواعد تتغيّر — تدرّب على المرونة.', kind: 'therapy', target: 'cognitive_flexibility', durationSec: 120, icon: Puzzle, color: 'from-purple-500 to-pink-600', impl: 'switch' },
  { key: 'memory_builder', title: 'بنّاء الذاكرة', description: 'تسلسلات أطول مع كل جلسة لتنمية الذاكرة العاملة.', kind: 'therapy', target: 'working_memory', durationSec: 180, icon: Brain, color: 'from-blue-500 to-indigo-600', impl: 'memory_seq' },
  { key: 'rhythm_focus', title: 'إيقاع التركيز', description: 'انقر على الإيقاع لتحسين التوقيت والتركيز.', kind: 'therapy', target: 'timing', durationSec: 120, icon: Music, color: 'from-pink-500 to-rose-600', impl: 'rhythm' },
  { key: 'stop_signal_train', title: 'إشارة التوقّف', description: 'تدريب الكفّ بإشارات إيقاف عشوائية.', kind: 'therapy', target: 'inhibition', durationSec: 120, icon: Hand, color: 'from-red-500 to-rose-600', impl: 'go_nogo' },

  // === New Therapy Games ===
  { key: 'jungle_focus', title: 'تركيز الأدغال', description: 'تتبّع الحيوانات الذهبية بين الأشجار.', kind: 'therapy', target: 'sustained_attention', durationSec: 150, icon: Eye, color: 'from-green-600 to-emerald-700', impl: 'tap_target' },
  { key: 'ocean_breath', title: 'نفس المحيط', description: 'تنفّس بإيقاع الأمواج لتهدئة الدماغ.', kind: 'therapy', target: 'self_regulation', durationSec: 240, icon: Anchor, color: 'from-cyan-600 to-blue-700', impl: 'breath' },
  { key: 'star_catcher', title: 'صائد النجوم', description: 'لا تنقر إلا على النجوم الذهبية.', kind: 'therapy', target: 'impulse_control', durationSec: 120, icon: Star, color: 'from-violet-600 to-indigo-700', impl: 'tap_target' },
  { key: 'mind_maze_pro', title: 'متاهة العقل المتقدّمة', description: 'قواعد متغيّرة بسرعة — تحدٍّ مرن.', kind: 'therapy', target: 'cognitive_flexibility', durationSec: 180, icon: Puzzle, color: 'from-fuchsia-600 to-purple-700', impl: 'switch' },
  { key: 'memory_palace', title: 'قصر الذاكرة', description: 'بناء قصر من التسلسلات الطويلة.', kind: 'therapy', target: 'working_memory', durationSec: 240, icon: Brain, color: 'from-indigo-600 to-blue-800', impl: 'memory_seq' },
  { key: 'beat_master', title: 'سيّد الإيقاع', description: 'حافظ على الإيقاع لمدة طويلة.', kind: 'therapy', target: 'timing', durationSec: 180, icon: Music, color: 'from-pink-600 to-fuchsia-700', impl: 'rhythm' },
  { key: 'red_light_game', title: 'الضوء الأحمر', description: 'لعبة كلاسيكية لتدريب الكفّ السريع.', kind: 'therapy', target: 'inhibition', durationSec: 90, icon: Flag, color: 'from-rose-600 to-red-700', impl: 'go_nogo' },
  { key: 'speed_burst', title: 'انفجار السرعة', description: 'دفعات قصيرة من ردود فعل خاطفة.', kind: 'therapy', target: 'reaction', durationSec: 60, icon: Rocket, color: 'from-orange-600 to-red-600', impl: 'rt_reflex' },
  { key: 'color_spy', title: 'جاسوس الألوان', description: 'تدريب ستروب لطيف ومتدرّج.', kind: 'therapy', target: 'cognitive_flexibility', durationSec: 120, icon: Layers, color: 'from-teal-500 to-cyan-600', impl: 'stroop' },
  { key: 'numbers_quest', title: 'رحلة الأرقام', description: 'انقر على الرقم المطلوب — تدريب انتباه انتقائي.', kind: 'therapy', target: 'sustained_attention', durationSec: 180, icon: Target, color: 'from-amber-600 to-orange-700', impl: 'pomodoro' },
  { key: 'ghost_hunt', title: 'صيد الأشباح', description: 'انقر على الشبح فقط — تجاهل الباقي.', kind: 'therapy', target: 'impulse_control', durationSec: 120, icon: Ghost, color: 'from-slate-700 to-purple-800', impl: 'tap_target' },
  { key: 'bomb_defuse', title: 'تفكيك القنبلة', description: 'لا تنقر عند الإشارة! تدريب كفّ تحت ضغط.', kind: 'therapy', target: 'inhibition', durationSec: 90, icon: Bomb, color: 'from-red-700 to-orange-700', impl: 'go_nogo' },
  { key: 'snowflake_track', title: 'تعقّب الثلج', description: 'تتبّع رقاقات الثلج بسلاسة.', kind: 'therapy', target: 'sustained_attention', durationSec: 150, icon: Snowflake, color: 'from-sky-500 to-indigo-600', impl: 'tap_target' },
  { key: 'sun_rise_focus', title: 'شروق التركيز', description: 'جلسة هادئة لتعزيز الانتباه الصباحي.', kind: 'therapy', target: 'sustained_attention', durationSec: 240, icon: Sun, color: 'from-yellow-400 to-orange-500', impl: 'pomodoro' },
  { key: 'moon_calm', title: 'هدوء القمر', description: 'تنفّس مسائي لتنظيم النوم والانتباه.', kind: 'therapy', target: 'self_regulation', durationSec: 240, icon: Moon, color: 'from-indigo-700 to-slate-800', impl: 'breath' },
  { key: 'heart_rhythm', title: 'إيقاع القلب', description: 'مزامنة الإيقاع مع نبض القلب.', kind: 'therapy', target: 'timing', durationSec: 150, icon: Heart, color: 'from-rose-500 to-pink-600', impl: 'rhythm' },
  { key: 'precision_aim', title: 'دقّة التصويب', description: 'تدريب الانتباه الدقيق على هدف صغير.', kind: 'therapy', target: 'sustained_attention', durationSec: 120, icon: Crosshair, color: 'from-emerald-600 to-teal-700', impl: 'tap_target' },
  { key: 'gauge_control', title: 'ضابط السرعة', description: 'حافظ على رد فعل ثابت لا متسرّع.', kind: 'therapy', target: 'self_regulation', durationSec: 150, icon: Gauge, color: 'from-blue-600 to-indigo-700', impl: 'rt_reflex' },
  { key: 'flexible_mind', title: 'العقل المرن', description: 'انتقالات سريعة بين قاعدتين.', kind: 'therapy', target: 'cognitive_flexibility', durationSec: 150, icon: Shuffle, color: 'from-purple-700 to-fuchsia-700', impl: 'switch' },
];

export const SCREENING_BATTERY = ['forest_hunter','stop_rocket','color_chaos','memory_garden','reaction_reflex','switcheroo'];

// Recommended therapy sequence after diagnosis (ordered)
export const THERAPY_SEQUENCE = [
  'calm_breath','token_hunt','memory_builder','mindful_maze','pomodoro_quest','rhythm_focus','stop_signal_train',
  'jungle_focus','star_catcher','memory_palace','flexible_mind','heart_rhythm','red_light_game'
];

export function getGame(key: string) {
  return GAMES.find(g => g.key === key);
}

export function getTherapyGames() {
  return GAMES.filter(g => g.kind === 'therapy' || g.kind === 'both');
}

export function getDiagnosticGames() {
  return GAMES.filter(g => g.kind === 'screening' || g.kind === 'both');
}
