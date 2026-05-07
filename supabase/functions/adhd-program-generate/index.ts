// ADHD therapy program: 12 weeks × 7 days × 10 games. Saved once, fetched fast.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Therapy game library (mirrors src/features/adhd/games/registry.ts therapy keys)
const THERAPY_GAMES = [
  { key: 'pomodoro_quest', title: 'مهمة بومودورو', target: 'sustained_attention', desc: 'فترات تركيز قصيرة لبناء قدرة الانتباه.' },
  { key: 'calm_breath', title: 'تنفّس الهدوء', target: 'self_regulation', desc: 'تمرين تنفّس موجَّه لتنظيم الذات.' },
  { key: 'token_hunt', title: 'صيد الرموز', target: 'impulse_control', desc: 'انقر على الرمز المطلوب فقط لتدريب الكفّ.' },
  { key: 'mindful_maze', title: 'متاهة التركيز', target: 'cognitive_flexibility', desc: 'القواعد تتغيّر — تدرّب على المرونة.' },
  { key: 'memory_builder', title: 'بنّاء الذاكرة', target: 'working_memory', desc: 'تسلسلات أطول مع كل جلسة.' },
  { key: 'rhythm_focus', title: 'إيقاع التركيز', target: 'timing', desc: 'انقر على الإيقاع لتحسين التوقيت.' },
  { key: 'stop_signal_train', title: 'إشارة التوقّف', target: 'inhibition', desc: 'تدريب الكفّ بإشارات إيقاف عشوائية.' },
  { key: 'jungle_focus', title: 'تركيز الأدغال', target: 'sustained_attention', desc: 'تتبّع الحيوانات الذهبية بين الأشجار.' },
  { key: 'ocean_breath', title: 'نفس المحيط', target: 'self_regulation', desc: 'تنفّس بإيقاع الأمواج لتهدئة الدماغ.' },
  { key: 'star_catcher', title: 'صائد النجوم', target: 'impulse_control', desc: 'لا تنقر إلا على النجوم الذهبية.' },
  { key: 'mind_maze_pro', title: 'متاهة العقل المتقدّمة', target: 'cognitive_flexibility', desc: 'قواعد متغيّرة بسرعة.' },
  { key: 'memory_palace', title: 'قصر الذاكرة', target: 'working_memory', desc: 'بناء قصر من التسلسلات الطويلة.' },
  { key: 'beat_master', title: 'سيّد الإيقاع', target: 'timing', desc: 'حافظ على الإيقاع لمدة طويلة.' },
  { key: 'red_light_game', title: 'الضوء الأحمر', target: 'inhibition', desc: 'تدريب الكفّ السريع.' },
  { key: 'speed_burst', title: 'انفجار السرعة', target: 'reaction', desc: 'دفعات قصيرة من ردود فعل خاطفة.' },
  { key: 'color_spy', title: 'جاسوس الألوان', target: 'cognitive_flexibility', desc: 'تدريب ستروب لطيف.' },
  { key: 'numbers_quest', title: 'رحلة الأرقام', target: 'sustained_attention', desc: 'انقر على الرقم المطلوب فقط.' },
  { key: 'ghost_hunt', title: 'صيد الأشباح', target: 'impulse_control', desc: 'انقر على الشبح فقط.' },
  { key: 'bomb_defuse', title: 'تفكيك القنبلة', target: 'inhibition', desc: 'لا تنقر عند الإشارة!' },
  { key: 'snowflake_track', title: 'تعقّب الثلج', target: 'sustained_attention', desc: 'تتبّع رقاقات الثلج بسلاسة.' },
  { key: 'sun_rise_focus', title: 'شروق التركيز', target: 'sustained_attention', desc: 'جلسة هادئة لتعزيز الانتباه الصباحي.' },
  { key: 'moon_calm', title: 'هدوء القمر', target: 'self_regulation', desc: 'تنفّس مسائي لتنظيم النوم.' },
  { key: 'heart_rhythm', title: 'إيقاع القلب', target: 'timing', desc: 'مزامنة الإيقاع مع نبض القلب.' },
  { key: 'precision_aim', title: 'دقّة التصويب', target: 'sustained_attention', desc: 'تدريب الانتباه الدقيق على هدف صغير.' },
  { key: 'gauge_control', title: 'ضابط السرعة', target: 'self_regulation', desc: 'حافظ على رد فعل ثابت.' },
  { key: 'flexible_mind', title: 'العقل المرن', target: 'cognitive_flexibility', desc: 'انتقالات سريعة بين قاعدتين.' },
];

function pickGamesForDay(dayIdx: number, focusAreas: string[], dailyMinutes: number) {
  // Weight: prefer games whose target matches focus areas
  const weighted = THERAPY_GAMES.map(g => {
    const baseWeight = focusAreas.length === 0 ? 1 : (focusAreas.includes(g.target) ? 3 : 1);
    return { g, weight: baseWeight };
  });
  // Deterministic shuffle by day
  const seed = dayIdx * 1009;
  const arr = [...weighted];
  for (let i = arr.length - 1; i > 0; i--) {
    const r = (Math.sin(seed + i) + 1) / 2;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Sort partially by weight while keeping randomness
  arr.sort((a, b) => b.weight - a.weight + (Math.sin(seed + a.g.key.length) - Math.sin(seed + b.g.key.length)) * 0.5);

  // Take 10 distinct games
  const pickedKeys = new Set<string>();
  const picked: typeof THERAPY_GAMES = [];
  for (const { g } of arr) {
    if (picked.length >= 10) break;
    if (pickedKeys.has(g.key)) continue;
    pickedKeys.add(g.key);
    picked.push(g);
  }
  // If somehow less than 10, fill from full list
  for (const g of THERAPY_GAMES) {
    if (picked.length >= 10) break;
    if (!pickedKeys.has(g.key)) { pickedKeys.add(g.key); picked.push(g); }
  }

  const difficulty = Math.min(5, 1 + Math.floor((dayIdx - 1) / 14)); // increases every 2 weeks
  const perGameSec = Math.max(45, Math.round((dailyMinutes * 60) / 10));
  return picked.map((g, idx) => ({
    game_key: g.key,
    title: g.title,
    description: g.desc,
    target_metric: g.target,
    order_index: idx,
    params: { difficulty, durationSec: perGameSec },
  }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: auth } } }
    );
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const body = await req.json();
    const {
      childName, childAge,
      weeks = 12,
      focusAreas = [],
      dailyMinutes = 30,
      severity = 'moderate', goals = '',
    } = body;

    // Idempotent: return existing active program
    const { data: existing } = await supabase
      .from('adhd_programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ program: existing, existing: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalDays = weeks * 7;

    const { data: program, error: progErr } = await supabase
      .from('adhd_programs')
      .insert({
        user_id: user.id,
        child_name: childName,
        child_age: childAge,
        weeks,
        focus_areas: focusAreas,
        daily_minutes: dailyMinutes,
        ai_plan: { severity, goals, generated_at: new Date().toISOString(), gamesPerDay: 10 },
      })
      .select('*')
      .single();
    if (progErr) throw progErr;

    // Insert all days
    const today = new Date();
    const dayRows = [];
    for (let i = 1; i <= totalDays; i++) {
      dayRows.push({
        program_id: program.id,
        day_index: i,
        scheduled_for: new Date(today.getTime() + (i - 1) * 86400000).toISOString().slice(0, 10),
      });
    }
    const { data: insertedDays, error: dErr } = await supabase
      .from('adhd_program_days')
      .insert(dayRows)
      .select('id, day_index');
    if (dErr) throw dErr;

    // Build all games
    const gameRows: any[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const dayRow = insertedDays!.find((x: any) => x.day_index === i);
      if (!dayRow) continue;
      const games = pickGamesForDay(i, focusAreas, dailyMinutes);
      for (const g of games) gameRows.push({ ...g, day_id: dayRow.id });
    }

    // Insert in batches
    const BATCH = 200;
    for (let i = 0; i < gameRows.length; i += BATCH) {
      const slice = gameRows.slice(i, i + BATCH);
      const { error: gErr } = await supabase.from('adhd_program_games').insert(slice);
      if (gErr) throw gErr;
    }

    return new Response(JSON.stringify({ program, totalDays, totalGames: gameRows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('adhd-program-generate', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
