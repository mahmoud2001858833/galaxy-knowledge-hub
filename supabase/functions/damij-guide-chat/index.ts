// Damij Smart Guide chat — uses Lovable AI Gateway (Gemini) with multi-fallback.
// Returns { reply: string, navigate?: string } so the client can offer one-click navigation.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECTION_MAP = `
أقسام منصة دامج وروابطها:
- /damij                      → الصفحة الرئيسية لدامج (نظرة عامة على الأقسام الستة).
- /damij/sign                 → مترجم لغة الإشارة (إشارة↔نص/صوت، 100+ لغة، 6 أنظمة عالمية، قاموس داخلي).
- /damij/sign/dictionary      → إدارة قاموس لغة الإشارة (للمشرفين فقط).
- /damij/sensory              → الجسر الحسّي العكسي (تحويل أي محتوى للحاسة المتاحة للطالب).
- /damij/autism               → التوحّد: تشخيص بالألعاب وفق DSM-5 و M-CHAT-R و ADOS-2 + علاج تفاعلي.
- /damij/adhd                 → ADHD: فحص بالاستبيان، تشخيص باللعب، CPT/N-Back/Stroop/GoNoGo، برامج علاجية.
- /damij/adhd/screening       → الفحص بالاستبيان لـ ADHD.
- /damij/adhd/games           → بطارية ألعاب التشخيص لـ ADHD.
- /damij/adhd/program/setup   → إعداد برنامج علاجي مخصص.
- /damij/adhd/assessment      → التقييم العصبي-النفسي (CPT, N-Back, Stroop, Go/No-Go).
- /damij/adhd/interventions   → التدخلات السلوكية وToken Economy.
- /damij/adhd/dashboard       → لوحة المتابعة الطولية.
- /damij/braille              → بريل العالمي (نص↔بريل، OCR، دروس تفاعلية، Tactile PDF).
- /damij/clinical             → مختبر المحاكاة السريرية للبحث وتجريب البروتوكولات.
- /damij/sources              → مكتبة المراجع العلمية (DSM-5-TR, ICF-CY, UNESCO...).
`;

interface Msg { role: 'user' | 'assistant' | 'system'; content: string; }

async function callGateway(messages: Msg[], lang: string) {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');

  const system = `أنت "مرشد دامج الذكي" — مساعد ذكاء اصطناعي ودود، احترافي، ومتخصص في منصة دامج للتعليم الدامج والتشخيص الذكي.

قواعد صارمة:
1) أجب دائماً باللغة (${lang}). إن طُلب تغيير اللغة فالتزم بذلك.
2) أنت تعرف أقسام المنصة التالية فقط، لا تخترع أقساماً غير موجودة:
${SECTION_MAP}
3) إذا سأل المستخدم عن قسم/ميزة موجودة، اشرحها بإيجاز (٢-٤ جمل) واقترح زيارة المسار المناسب عبر حقل JSON "navigate".
4) ردّك يجب أن يكون JSON صالحاً فقط بهذا الشكل بدون أي نص حوله:
{"reply": "نص الجواب للمستخدم بلغته", "navigate": "/damij/xxx" أو ""}
5) لا تذكر أنك Gemini أو OpenAI. أنت "مرشد دامج الذكي" من فريق منصة دامج.
6) إذا السؤال خارج نطاق دامج، اعتذر بلطف ووجّه المستخدم لأقسام المنصة.`;

  const body = {
    model: 'google/gemini-2.5-flash',
    messages: [{ role: 'system', content: system }, ...messages],
    response_format: { type: 'json_object' },
  };

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (resp.status === 429) throw new Error('RATE_LIMIT');
  if (resp.status === 402) throw new Error('PAYMENT_REQUIRED');
  if (!resp.ok) throw new Error(`gateway ${resp.status}: ${(await resp.text()).slice(0, 200)}`);

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? '{}';
  try { return JSON.parse(text); }
  catch { return { reply: text, navigate: '' }; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages = [], lang = 'ar' } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const trimmed = messages.slice(-12); // keep recent context only
    const result = await callGateway(trimmed, lang);

    return new Response(JSON.stringify({
      reply: String(result.reply ?? '').trim() || '...',
      navigate: typeof result.navigate === 'string' && result.navigate.startsWith('/damij') ? result.navigate : '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = (e as Error).message;
    console.error('damij-guide-chat error:', msg);
    const status = msg === 'RATE_LIMIT' ? 429 : msg === 'PAYMENT_REQUIRED' ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
