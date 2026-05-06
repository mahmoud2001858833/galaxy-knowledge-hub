// ADHD treatment program generator (creates plan + days + games)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const THERAPY_GAMES = [
  { key: 'pomodoro_quest', title: 'مهمة بومودورو', target: 'sustained_attention', desc: 'تدريب الانتباه المستمر بفترات قصيرة متدرّجة.' },
  { key: 'calm_breath', title: 'تنفّس الهدوء', target: 'self_regulation', desc: 'تمرين تنفّس موجَّه لتنظيم الذات.' },
  { key: 'token_hunt', title: 'صيد الرموز', target: 'impulse_control', desc: 'انقر فقط على الرمز المطلوب وتجنّب البقية.' },
  { key: 'mindful_maze', title: 'متاهة التركيز', target: 'cognitive_flexibility', desc: 'متاهة تتغيّر قواعدها لتدريب التحوّل المعرفي.' },
  { key: 'memory_builder', title: 'بنّاء الذاكرة', target: 'working_memory', desc: 'تذكّر تسلسلات متزايدة الطول.' },
  { key: 'rhythm_focus', title: 'إيقاع التركيز', target: 'timing', desc: 'انقر على الإيقاع لتحسين التوقيت والتركيز.' },
  { key: 'stop_signal_train', title: 'إشارة التوقّف', target: 'inhibition', desc: 'تدريب الكفّ المعرفي بإشارات إيقاف عشوائية.' },
];

function buildPlan(weeks: number, dailyMinutes: number, focusAreas: string[]) {
  const totalDays = weeks * 7;
  const days: any[] = [];
  for (let i = 1; i <= totalDays; i++) {
    const difficulty = Math.min(5, 1 + Math.floor((i - 1) / 7));
    // pick 3 games rotating, weighted to focus areas
    const pool = THERAPY_GAMES.slice().sort(() => {
      // bias by focus
      return Math.random() - 0.5;
    });
    const focused = focusAreas?.length
      ? pool.sort((a, b) => (focusAreas.includes(b.target) ? 1 : 0) - (focusAreas.includes(a.target) ? 1 : 0))
      : pool;
    const todayGames = focused.slice(0, dailyMinutes <= 15 ? 2 : dailyMinutes <= 25 ? 3 : 4);
    days.push({
      day_index: i,
      games: todayGames.map((g, idx) => ({
        game_key: g.key,
        title: g.title,
        description: g.desc,
        target_metric: g.target,
        order_index: idx,
        params: { difficulty, durationSec: Math.round((dailyMinutes * 60) / todayGames.length) },
      })),
    });
  }
  return { totalDays, days };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: auth } } }
    );
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const { childName, childAge, weeks = 4, focusAreas = [], dailyMinutes = 20, severity = 'moderate', goals = '' } = await req.json();

    const plan = buildPlan(weeks, dailyMinutes, focusAreas);

    const { data: program, error: progErr } = await supabase
      .from('adhd_programs')
      .insert({
        user_id: user.id,
        child_name: childName,
        child_age: childAge,
        weeks,
        focus_areas: focusAreas,
        daily_minutes: dailyMinutes,
        ai_plan: { severity, goals, generated_at: new Date().toISOString() },
      })
      .select('*')
      .single();
    if (progErr) throw progErr;

    // create days + games in batches
    const today = new Date();
    const dayRows = plan.days.map(d => ({
      program_id: program.id,
      day_index: d.day_index,
      scheduled_for: new Date(today.getTime() + (d.day_index - 1) * 86400000).toISOString().slice(0, 10),
    }));
    const { data: insertedDays, error: dErr } = await supabase.from('adhd_program_days').insert(dayRows).select('id, day_index');
    if (dErr) throw dErr;

    const gameRows: any[] = [];
    for (const d of plan.days) {
      const dayRow = insertedDays.find((x: any) => x.day_index === d.day_index);
      if (!dayRow) continue;
      for (const g of d.games) gameRows.push({ ...g, day_id: dayRow.id });
    }
    const { error: gErr } = await supabase.from('adhd_program_games').insert(gameRows);
    if (gErr) throw gErr;

    return new Response(JSON.stringify({ program, totalDays: plan.totalDays }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
