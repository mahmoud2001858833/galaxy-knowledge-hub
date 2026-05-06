// Sensory Bridge: Image → audio description + tactile (printable) model
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('SENSORY_TACTILE_GEMINI_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'SENSORY_TACTILE_GEMINI_KEY غير مهيأ' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `أنت محلّل صور تعليمي للمكفوفين. حلّل الصورة المرفقة وأعد JSON فقط بهذا الشكل بدون أي نص خارجي:
{
  "title": "عنوان قصير",
  "audioDescription": "وصف صوتي تفصيلي ومنظم باللغة العربية الفصحى يبدأ بنظرة عامة ثم العناصر من اليسار لليمين ومن الأعلى للأسفل، يصلح ليُقرأ بصوت عالٍ للمكفوف (200-400 كلمة)",
  "shortDescription": "ملخّص في جملة واحدة",
  "tactileRegions": [
    { "label": "اسم الجزء", "shape": "circle|rect|polygon", "x": 0-100, "y": 0-100, "w": 0-100, "h": 0-100, "texture": "smooth|bumpy|lined|dotted|cross", "elevation": 1-5, "description": "وصف الملمس المقترح" }
  ],
  "hapticPattern": [
    { "region": "اسم الجزء", "intensity": 1-10, "duration": 50-500, "pattern": "pulse|continuous|rhythm" }
  ],
  "printingNotes": "إرشادات لطباعة النموذج اللمسي بطابعة بريل/3D"
}
الإحداثيات بالنسبة المئوية للصورة. اجعل tactileRegions بين 4 و 10 مناطق رئيسية.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
            ],
          }],
          generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error('Gemini error:', response.status, t);
      return new Response(JSON.stringify({ error: 'فشل تحليل الصورة', details: t }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = { audioDescription: text }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'خطأ' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
