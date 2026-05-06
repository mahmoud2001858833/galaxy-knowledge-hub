// ADHD game session analyzer + AI report
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Event {
  t: number; // ms since session start
  type: 'go' | 'nogo' | 'response' | 'miss' | 'switch';
  correct?: boolean;
  rt?: number;
  meta?: any;
}

function computeMetrics(events: Event[], gameKey: string) {
  const responses = events.filter(e => typeof e.rt === 'number');
  const correct = events.filter(e => e.correct === true);
  const wrong = events.filter(e => e.correct === false);
  const omissions = events.filter(e => e.type === 'miss').length;
  const commissions = events.filter(e => e.type === 'response' && e.correct === false).length;
  const rts = responses.map(e => e.rt as number).filter(rt => rt > 100 && rt < 3000);
  const meanRT = rts.length ? rts.reduce((a,b)=>a+b,0)/rts.length : 0;
  const variance = rts.length ? rts.reduce((s,rt)=>s+(rt-meanRT)**2,0)/rts.length : 0;
  const sdRT = Math.sqrt(variance);
  const cv = meanRT ? sdRT/meanRT : 0;
  const accuracy = events.length ? correct.length / Math.max(1, correct.length + wrong.length + omissions) : 0;

  return {
    game: gameKey,
    totalEvents: events.length,
    correct: correct.length,
    wrong: wrong.length,
    omissions,
    commissions,
    meanRT: Math.round(meanRT),
    sdRT: Math.round(sdRT),
    rtCV: Number(cv.toFixed(3)),
    accuracy: Number(accuracy.toFixed(3)),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { events = [], gameKey = 'unknown', durationMs = 0, age } = await req.json();
    const metrics = computeMetrics(events, gameKey);

    // Simple clinical interpretation per game
    const flags: string[] = [];
    if (metrics.omissions > 5) flags.push('انتباه_مستمر_منخفض');
    if (metrics.commissions > 4) flags.push('اندفاعية');
    if (metrics.rtCV > 0.35) flags.push('تذبذب_زمن_الاستجابة');
    if (metrics.accuracy < 0.6) flags.push('دقة_منخفضة');
    if (metrics.meanRT > 700) flags.push('بطء_معالجة');

    // Overall 0-100 score (higher = better)
    const score = Math.max(0, Math.min(100, Math.round(
      metrics.accuracy * 60
      - metrics.omissions * 2
      - metrics.commissions * 2.5
      - Math.max(0, (metrics.rtCV - 0.2)) * 50
      + 40
    )));

    const summary = {
      flags,
      durationMs,
      age: age ?? null,
      verdict:
        score >= 75 ? 'ضمن المعدّل الطبيعي'
        : score >= 55 ? 'مؤشرات حدّية تستحق الانتباه'
        : 'مؤشرات عالية لاحتمال صعوبات في الانتباه/التحكم',
    };

    return new Response(JSON.stringify({ metrics, summary, score }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
