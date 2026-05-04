// Heuristic mapping: dictionary entry → ParametricHand handshape + movement label.
// Goal: give every word a real *sign-language* hand illustration instead of an emoji.
import type { HandshapeId } from './index';

export type Movement =
  | 'none' | 'tap' | 'wave_h' | 'wave_v' | 'circle' | 'push' | 'pull'
  | 'up' | 'down' | 'tap_chest' | 'tap_chin' | 'tap_forehead' | 'two_hands';

export interface SignVisual {
  handshape: HandshapeId;
  movement: Movement;
  twoHanded?: boolean;
  // Optional per-sign hint for the description badge.
  hint?: string;
}

// Direct overrides keyed by Arabic word — high-confidence mappings only.
const WORD_MAP: Record<string, SignVisual> = {
  'مرحباً': { handshape: 'open_palm', movement: 'wave_h', hint: 'تلويح' },
  'مرحبا':  { handshape: 'open_palm', movement: 'wave_h', hint: 'تلويح' },
  'وداعاً': { handshape: 'open_palm', movement: 'wave_h', hint: 'تلويح' },
  'أهلاً':  { handshape: 'spread_hand', movement: 'two_hands', twoHanded: true },
  'السلام عليكم': { handshape: 'flat_hand', movement: 'tap_chest' },
  'وعليكم السلام': { handshape: 'prayer', movement: 'two_hands', twoHanded: true },
  'شكراً':   { handshape: 'flat_hand', movement: 'tap_chin' },
  'عفواً':   { handshape: 'open_palm', movement: 'circle' },
  'من فضلك': { handshape: 'flat_hand', movement: 'circle', hint: 'دائرة على الصدر' },
  'آسف':    { handshape: 'fist', movement: 'circle' },
  'نعم':    { handshape: 'thumbs_up', movement: 'tap' },
  'لا':     { handshape: 'thumbs_down', movement: 'tap' },
  'ربما':   { handshape: 'flat_hand', movement: 'wave_v' },
  'بخير':   { handshape: 'thumbs_up', movement: 'up' },
  'الحمد لله': { handshape: 'spread_hand', movement: 'up', twoHanded: true },
  'أحبك':   { handshape: 'love', movement: 'push' },
  'أنا':    { handshape: 'point', movement: 'tap_chest' },
  'أنت':    { handshape: 'point', movement: 'push' },
  'نحن':    { handshape: 'point', movement: 'circle', twoHanded: true },
  'هو':     { handshape: 'point', movement: 'push' },
  'هي':     { handshape: 'point', movement: 'push' },
  'هم':     { handshape: 'spread_hand', movement: 'wave_h' },
  'يأكل':   { handshape: 'pinch', movement: 'tap_chin' },
  'يشرب':   { handshape: 'fist', movement: 'tap_chin' },
  'يقرأ':   { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'يكتب':   { handshape: 'pinch', movement: 'wave_h' },
  'يتكلم':  { handshape: 'spread_hand', movement: 'wave_v' },
  'يسمع':   { handshape: 'bent_hand', movement: 'tap' },
  'يرى':    { handshape: 'victory', movement: 'push' },
  'يحب':    { handshape: 'fist', movement: 'tap_chest' },
  'يدرس':   { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'يساعد':  { handshape: 'flat_hand', movement: 'up', twoHanded: true },
  'يمشي':   { handshape: 'two', movement: 'wave_h' },
  'ينام':   { handshape: 'flat_hand', movement: 'tap' },
  'يلعب':   { handshape: 'love', movement: 'wave_h', twoHanded: true },
  // family
  'أب':    { handshape: 'five', movement: 'tap_forehead' },
  'أم':    { handshape: 'five', movement: 'tap_chin' },
  'أخ':    { handshape: 'one', movement: 'tap' },
  'أخت':   { handshape: 'one', movement: 'tap_chin' },
  // emergency
  'إسعاف': { handshape: 'crossed_fingers', movement: 'circle' },
  'شرطة':  { handshape: 'claw', movement: 'tap_chest' },
  'حريق':  { handshape: 'spread_hand', movement: 'up' },
  'خطر':   { handshape: 'finger_gun', movement: 'wave_v' },
  'طوارئ': { handshape: 'fist', movement: 'wave_v' },
  'دفاع مدني': { handshape: 'flat_hand', movement: 'tap_chest' },
  'اتصلوا': { handshape: 'call_me', movement: 'tap_chin' },
  'ساعدوني': { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  // travel
  'سفر':   { handshape: 'flat_hand', movement: 'push' },
  'مطار':  { handshape: 'love', movement: 'push' },
  'فندق':  { handshape: 'flat_hand', movement: 'tap' },
  'جواز سفر': { handshape: 'flat_hand', movement: 'tap' },
  'تأشيرة': { handshape: 'pinch', movement: 'tap' },
  'حقيبة': { handshape: 'fist', movement: 'down' },
  'سياحة': { handshape: 'spread_hand', movement: 'circle' },
  'شاطئ':  { handshape: 'flat_hand', movement: 'wave_h' },
  'متحف':  { handshape: 'flat_hand', movement: 'tap' },
  'خريطة': { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'بوصلة': { handshape: 'point', movement: 'circle' },
  'حدود':  { handshape: 'flat_hand', movement: 'wave_h', twoHanded: true },
  'ترجمة': { handshape: 'two', movement: 'wave_h', twoHanded: true },
  'دليل':  { handshape: 'point', movement: 'push' },
  'سياح':  { handshape: 'spread_hand', movement: 'circle' },
  'طيران': { handshape: 'love', movement: 'push' },
  'قطار':  { handshape: 'two', movement: 'wave_h' },
  'ميناء': { handshape: 'fist', movement: 'down' },
  // religion
  'الله':  { handshape: 'flat_hand', movement: 'up' },
  'صلاة':  { handshape: 'prayer', movement: 'two_hands', twoHanded: true },
  'صيام':  { handshape: 'flat_hand', movement: 'tap_chin' },
  'حج':    { handshape: 'fist', movement: 'circle' },
  'زكاة':  { handshape: 'spread_hand', movement: 'down' },
  'مسجد':  { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'كنيسة': { handshape: 'point_up', movement: 'two_hands', twoHanded: true },
  'قرآن':  { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'دعاء':  { handshape: 'spread_hand', movement: 'up', twoHanded: true },
  'رمضان': { handshape: 'flat_hand', movement: 'circle' },
  'عيد':   { handshape: 'spread_hand', movement: 'wave_v', twoHanded: true },
  'تكبير': { handshape: 'spread_hand', movement: 'up', twoHanded: true },
  'وضوء':  { handshape: 'flat_hand', movement: 'wave_h', twoHanded: true },
  'أذان':  { handshape: 'flat_hand', movement: 'tap', hint: 'بجانب الأذن' },
  'تلاوة': { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  'عمرة':  { handshape: 'fist', movement: 'circle' },
  'ما شاء الله': { handshape: 'spread_hand', movement: 'up' },
  'إن شاء الله': { handshape: 'crossed_fingers', movement: 'up' },
  'شكر لله': { handshape: 'prayer', movement: 'tap_chest', twoHanded: true },
};

// Category → fallback visual (must always return a valid handshape).
const CATEGORY_MAP: Record<string, SignVisual> = {
  greetings: { handshape: 'open_palm', movement: 'wave_h' },
  family:    { handshape: 'five', movement: 'tap_chin' },
  numbers:   { handshape: 'one', movement: 'tap' },
  alphabet_ar: { handshape: 'fist', movement: 'tap' },
  alphabet_en: { handshape: 'asl_a', movement: 'tap' },
  colors:    { handshape: 'spread_hand', movement: 'wave_v' },
  food:      { handshape: 'pinch', movement: 'tap_chin' },
  body:      { handshape: 'point', movement: 'tap_chest' },
  school:    { handshape: 'flat_hand', movement: 'two_hands', twoHanded: true },
  home:      { handshape: 'bent_hand', movement: 'tap' },
  time:      { handshape: 'point', movement: 'tap' },
  weather:   { handshape: 'spread_hand', movement: 'down' },
  animals:   { handshape: 'claw', movement: 'wave_h' },
  jobs:      { handshape: 'fist', movement: 'tap' },
  emotions:  { handshape: 'love', movement: 'tap_chest' },
  transport: { handshape: 'two', movement: 'wave_h' },
  sports:    { handshape: 'fist', movement: 'wave_v', twoHanded: true },
  religion:  { handshape: 'prayer', movement: 'two_hands', twoHanded: true },
  tech:      { handshape: 'point', movement: 'tap' },
  nature:    { handshape: 'five', movement: 'wave_v' },
  directions: { handshape: 'point', movement: 'push' },
  verbs:     { handshape: 'flat_hand', movement: 'wave_h' },
  adjectives:{ handshape: 'spread_hand', movement: 'wave_v' },
  emergency: { handshape: 'spread_hand', movement: 'up' },
  travel:    { handshape: 'love', movement: 'push' },
  shopping:  { handshape: 'pinch', movement: 'tap' },
};

// Sign-system specific overrides for the alphabet category and a few cores.
// (Used to make ASL/BSL/etc. show culturally-appropriate handshapes when known.)
const SYSTEM_OVERRIDES: Record<string, Record<string, SignVisual>> = {
  ASL: {
    'مرحباً': { handshape: 'flat_hand', movement: 'tap_forehead' }, // ASL HELLO = salute
    'مرحبا':  { handshape: 'flat_hand', movement: 'tap_forehead' },
    'شكراً':   { handshape: 'flat_hand', movement: 'tap_chin' },
    'أحبك':   { handshape: 'love', movement: 'push' }, // ILY
    'نعم':    { handshape: 'fist', movement: 'wave_v' }, // YES = nodding S-hand
    'لا':     { handshape: 'three', movement: 'tap' },   // NO = index+middle+thumb tap
  },
  BSL: {
    'مرحباً': { handshape: 'flat_hand', movement: 'wave_h' },
    'شكراً':   { handshape: 'flat_hand', movement: 'tap_chin' },
  },
  LSF: {
    'مرحباً': { handshape: 'flat_hand', movement: 'wave_h' },
  },
  ArSL: {
    'مرحباً': { handshape: 'flat_hand', movement: 'tap_chest' },
  },
};

export function getSignVisual(
  word: { ar: string; category: string; id?: string },
  signSystem: string = 'ArSL',
): SignVisual {
  const sysOverride = SYSTEM_OVERRIDES[signSystem]?.[word.ar];
  if (sysOverride) return sysOverride;
  if (WORD_MAP[word.ar]) return WORD_MAP[word.ar];
  return CATEGORY_MAP[word.category] || { handshape: 'open_palm', movement: 'none' };
}
