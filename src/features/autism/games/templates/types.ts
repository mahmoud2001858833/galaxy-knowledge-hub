export interface GameTemplateProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  durationSec?: number;
  instructions?: string;
  childName?: string;
  adaptations?: string[];
  onComplete: (metrics: { accuracy: number; raw?: Record<string, number> }, durationMs: number) => void;
  onSkip?: () => void;
}

export interface GameTemplateMeta {
  id: string;
  title: string;
  emoji: string;
  skill: string;
}

export const TEMPLATE_META: Record<string, GameTemplateMeta> = {
  bubble_tracking: { id: 'bubble_tracking', title: 'تتبّع الفقاعات', emoji: '🫧', skill: 'انتباه بصري' },
  look_with_me: { id: 'look_with_me', title: 'انظر معي', emoji: '👀', skill: 'انتباه مشترك' },
  emotion_cards: { id: 'emotion_cards', title: 'بطاقات المشاعر', emoji: '😊', skill: 'تمييز انفعالات' },
  calm_sounds: { id: 'calm_sounds', title: 'الأصوات الهادئة', emoji: '🔊', skill: 'تنظيم حسي' },
  story_sequence: { id: 'story_sequence', title: 'رتّب القصة', emoji: '🧩', skill: 'تسلسل أحداث' },
  magic_mirror: { id: 'magic_mirror', title: 'المرآة السحرية', emoji: '🪞', skill: 'تقليد' },
  change_the_rule: { id: 'change_the_rule', title: 'غيّر القاعدة', emoji: '🔁', skill: 'مرونة معرفية' },
  request_to_get: { id: 'request_to_get', title: 'اطلب لتحصل', emoji: '🗣️', skill: 'طلبات وظيفية' },
  social_choice: { id: 'social_choice', title: 'اختر الرد المناسب', emoji: '👫', skill: 'سيناريوهات اجتماعية' },
  rhythm_turns: { id: 'rhythm_turns', title: 'الإيقاع المتبادل', emoji: '🎵', skill: 'تبادل الأدوار' },
  spot_difference: { id: 'spot_difference', title: 'اعثر على الفرق', emoji: '🔍', skill: 'انتباه للتفاصيل' },
  name_response: { id: 'name_response', title: 'استجابة للاسم', emoji: '📣', skill: 'استجابة' },
};
