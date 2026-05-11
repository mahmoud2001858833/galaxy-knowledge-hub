// ADHD combined diagnostic report (game battery + optional questionnaire)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { geminiFetch } from "../_shared/gemini-shim.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAI(prompt: string): Promise<string> {
  const key = "shim-key";
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const r = await geminiFetch("ai-shim", {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'أنت أخصائي تقييم نفسي-عصبي للأطفال خبير في DSM-5-TR و ADHD. تكتب تقارير سريرية واضحة، رحيمة، عملية باللغة العربية الفصحى المبسّطة. لا تشخّص بشكل قاطع، بل تقدّم مؤشرات وتوصيات.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI: ${r.status} ${t}`);
  }
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { sessions = [], age, screening } = await req.json();
    // Aggregate metrics
    const agg: any = { games: sessions.length };
    let totalScore = 0; let count = 0;
    const perGame: any[] = [];
    for (const s of sessions) {
      perGame.push({ game: s.game_key, score: s.score, metrics: s.metrics });
      if (typeof s.score === 'number') { totalScore += s.score; count++; }
    }
    agg.avgScore = count ? Math.round(totalScore / count) : null;

    // 6-axis radar (0-100)
    const get = (g: string, m: string) => {
      const s = sessions.find((x: any) => x.game_key === g);
      return s?.metrics?.[m];
    };
    const axes = {
      attention: Math.round(((get('forest_hunter','accuracy') ?? 0.6) * 100)),
      impulse: Math.round(100 - Math.min(100, ((get('stop_rocket','commissions') ?? 5) * 8))),
      working_memory: Math.round(((get('memory_garden','accuracy') ?? 0.5) * 100)),
      flexibility: Math.round(((get('color_chaos','accuracy') ?? 0.5) * 100)),
      reaction: Math.round(Math.max(0, 100 - ((get('reaction_reflex','meanRT') ?? 600) - 250) / 5)),
      sustained: Math.round(100 - Math.min(100, ((get('switcheroo','rtCV') ?? 0.3) * 200))),
    };

    const prompt = `بيانات تقييم ADHD باللعب لطفل عمره ${age ?? 'غير محدد'}:

نتائج الألعاب:
${perGame.map(g => `- ${g.game}: نقاط ${g.score}, دقة ${g.metrics?.accuracy ?? '-'}, زمن استجابة ${g.metrics?.meanRT ?? '-'}ms, إغفالات ${g.metrics?.omissions ?? '-'}, اندفاعات ${g.metrics?.commissions ?? '-'}`).join('\n')}

المحاور الستة (0-100):
- الانتباه المستمر: ${axes.attention}
- التحكم بالاندفاع: ${axes.impulse}
- الذاكرة العاملة: ${axes.working_memory}
- المرونة المعرفية: ${axes.flexibility}
- زمن الاستجابة: ${axes.reaction}
- ثبات الأداء: ${axes.sustained}

${screening ? `استبيان: ${JSON.stringify(screening)}` : 'لا يوجد استبيان مرفق.'}

اكتب تقريراً من 5 أقسام:
1) ملخص الأداء (3 أسطر).
2) نقاط القوة.
3) نقاط الضعف الرئيسية.
4) فئة DSM-5-TR المحتملة (Inattentive / Hyperactive / Combined / غير كافي للحكم).
5) خمس توصيات عملية للأهل والمعلم.`;

    const aiReport = await callAI(prompt);

    // simple DSM tag heuristic
    let dsm = 'غير كافي للحكم';
    if (axes.attention < 50 && axes.impulse > 60) dsm = 'Predominantly Inattentive';
    else if (axes.impulse < 50 && axes.attention > 60) dsm = 'Predominantly Hyperactive-Impulsive';
    else if (axes.attention < 55 && axes.impulse < 55) dsm = 'Combined Presentation';

    return new Response(JSON.stringify({
      metrics: { agg, axes, perGame },
      ai_report: aiReport,
      dsm_category: dsm,
      recommendations: aiReport.split('\n').filter(l => /^\s*[-•\d]/.test(l)).slice(0, 8),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
