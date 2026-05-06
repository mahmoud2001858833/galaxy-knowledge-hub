// ADHD Screening AI report — Lovable Gateway (Gemini)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body { assessmentId: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { assessmentId } = (await req.json()) as Body;
    if (!assessmentId || typeof assessmentId !== 'string') {
      return new Response(JSON.stringify({ error: 'assessmentId required' }), { status: 400, headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), { status: 500, headers: corsHeaders });
    }

    // Fetch assessment via service role (RLS bypass) — id is opaque UUID
    const aRes = await fetch(`${SUPABASE_URL}/rest/v1/adhd_assessments?id=eq.${assessmentId}&select=*`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const rows = await aRes.json();
    const a = rows?.[0];
    if (!a) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsHeaders });

    const prompt = `أنت خبير سريري في اضطراب فرط الحركة وتشتت الانتباه (ADHD) ومستند إلى DSM-5-TR و AAP 2019 و NICE NG87.

نتائج المقياس "${a.instrument}" للشخص (عمر: ${a.subject_age ?? 'غير محدد'}):
- أعراض تشتت إيجابية: ${a.scores?.inattentionPositive ?? 0} / 9 (متوسط ${a.scores?.inattentionMean?.toFixed?.(2) ?? '—'})
- أعراض فرط حركة إيجابية: ${a.scores?.hyperactivityPositive ?? 0} / 9 (متوسط ${a.scores?.hyperactivityMean?.toFixed?.(2) ?? '—'})
- النمط: ${a.subtype}
- الشدّة: ${a.severity}

اكتب تقريراً عربياً منظّماً بهذا الترتيب بالضبط (استخدم عناوين بصياغة "## "):
## 1) الخلاصة التفريقية
## 2) التفسير حسب DSM-5-TR
## 3) تشخيصات تفريقية يجب استبعادها
   (قلق، اكتئاب، اضطراب نوم، صعوبات تعلم، اضطراب طيف توحّد، صدمة)
## 4) العلامات الحمراء التي تستدعي إحالة عاجلة
## 5) خطة تدخّل أولية (سلوكية + صفّية + منزلية + تثقيفية)
## 6) متى يجب التفكير بالتقييم الدوائي
## 7) المراجع المختصرة

استخدم لغة واضحة، تجنّب أي توصية بأدوية محدّدة، وأكّد على ضرورة الإحالة للطبيب.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'تقارير سريرية مهنية عربية مبنية على الأدلة.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: 'ai_error', detail: t }), { status: 500, headers: corsHeaders });
    }
    const aiData = await aiRes.json();
    const report = aiData?.choices?.[0]?.message?.content ?? '';

    await fetch(`${SUPABASE_URL}/rest/v1/adhd_assessments?id=eq.${assessmentId}`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ai_report: report }),
    });

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
