// Daily ADHD program report
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { geminiFetch } from "../_shared/gemini-shim.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAI(prompt: string) {
  const key = "shim-key"!;
  const r = await geminiFetch("ai-shim", {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'أنت مدرّب ADHD يكتب تقارير يومية قصيرة، إيجابية، وعملية للأهل. استخدم فصحى مبسّطة.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { childName, dayIndex, sessions = [] } = await req.json();
    const totals = sessions.reduce((acc: any, s: any) => {
      acc.score += s.score || 0;
      acc.games += 1;
      acc.acc += s.metrics?.accuracy || 0;
      return acc;
    }, { score: 0, games: 0, acc: 0 });
    const avgScore = totals.games ? Math.round(totals.score / totals.games) : 0;
    const avgAcc = totals.games ? (totals.acc / totals.games) : 0;

    const prompt = `الطفل ${childName ?? 'الطفل'} أنهى اليوم رقم ${dayIndex} ولعب ${totals.games} ألعاب.
متوسط النقاط: ${avgScore}/100. متوسط الدقة: ${(avgAcc*100).toFixed(0)}%.
تفاصيل: ${sessions.map((s: any) => `${s.game_key}: ${s.score}`).join('، ')}.

اكتب: 
1) جملة تشجيع واحدة.
2) ما الذي أبدع فيه (سطرين).
3) ما يحتاج تدريباً إضافياً (سطرين).
4) توصية واحدة محدّدة لليوم التالي.`;

    const ai = await callAI(prompt);
    return new Response(JSON.stringify({
      ai_report: ai,
      metrics: { avgScore, avgAccuracy: avgAcc, gamesCompleted: totals.games },
      recommendations: ai.split('\n').slice(-3).join('\n'),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
