// Personalizes a diagnostic battery AFTER the 5 fixed baseline games.
// Receives baseline results + child profile, returns a tailored battery (4-6 games).
import { geminiFetch } from "../_shared/gemini-shim.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  'bubble_tracking','look_with_me','emotion_cards','calm_sounds','story_sequence',
  'magic_mirror','change_the_rule','request_to_get','social_choice','rhythm_turns',
  'spot_difference','name_response',
];

const SCHEMA = {
  type: 'object',
  properties: {
    games: {
      type: 'array', minItems: 4, maxItems: 6,
      items: {
        type: 'object',
        properties: {
          template_id: { type: 'string' },
          title_ar: { type: 'string' },
          instructions_ar: { type: 'string' },
          target_skill_ar: { type: 'string' },
          rationale_ar: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy','medium','hard'] },
          duration_sec: { type: 'integer' },
          adaptations_ar: { type: 'array', items: { type: 'string' } },
        },
        required: ['template_id','title_ar','instructions_ar','target_skill_ar','rationale_ar','difficulty','duration_sec'],
      },
    },
    strengths_ar: { type: 'array', items: { type: 'string' } },
    weaknesses_ar: { type: 'array', items: { type: 'string' } },
    overall_strategy_ar: { type: 'string' },
  },
  required: ['games','strengths_ar','weaknesses_ar','overall_strategy_ar'],
};

function fallback(weakIds: string[]) {
  const pick = weakIds.length ? weakIds : ['social_choice','change_the_rule','rhythm_turns','spot_difference'];
  return {
    strengths_ar: ['تفاعل أساسي مع الألعاب'],
    weaknesses_ar: ['يحتاج متابعة لمهارات اجتماعية ومرونة'],
    overall_strategy_ar: 'بطارية افتراضية تركّز على نقاط الضعف المحتملة.',
    games: pick.slice(0, 4).map((id) => ({
      template_id: id, title_ar: 'لعبة مخصّصة', instructions_ar: 'اتبع التعليمات داخل اللعبة.',
      target_skill_ar: 'مهارة مستهدفة', rationale_ar: 'تغطية للنقاط الضعيفة.',
      difficulty: 'medium', duration_sec: 70, adaptations_ar: ['قلّل ال