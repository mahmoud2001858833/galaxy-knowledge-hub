import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { geminiFetch } from "../_shared/gemini-shim.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language = 'ar' } = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    const LOVABLE_API_KEY = "shim-key";
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    const langName = language === 'ar' ? 'العربية' : language === 'en' ? 'الإنجليزية' : language;
    const transcribePrompt = `قم بتحويل هذا الملف الصوتي إلى نص. اللغة المتوقعة: ${langName}. أعد النص المنطوق فقط بدون أي إضافات أو تنسيق أو علامات اقتباس.`;

    // ── PRIORITY 1: Lovable AI Gateway (Gemini 2.5 Flash) ──
    if (LOVABLE_API_KEY) {
      try {
        console.log('Trying Lovable AI Gateway (gemini-2.5-flash) for STT…');
        const response = await geminiFetch("ai-shim", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: transcribePrompt },
                  {
                    type: 'input_audio',
                    input_audio: { data: audio, format: 'webm' },
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = (data?.choices?.[0]?.message?.content || '').trim();
          if (text) {
            return new Response(
              JSON.stringify({ text, service: 'lovable-gemini-2.5-flash' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.warn('Lovable gateway returned empty text — trying fallbacks');
        } else {
          const errorText = await response.text();
          console.warn(`Lovable gateway STT failed (${response.status}): ${errorText.slice(0, 200)}`);
          if (response.status === 429 || response.status === 402) {
            // Fall through to other providers
          }
        }
      } catch (e: any) {
        console.warn('Lovable gateway threw:', e);
      }
    }

    // ── PRIORITY 2: OpenAI Whisper (best quality for Arabic) ──
    if (OPENAI_API_KEY) {
      console.log('Trying OpenAI Whisper for STT…');
      try {
        const binaryString = atob(audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const formData = new FormData();
        const blob = new Blob([bytes], { type: 'audio/webm' });
        formData.append('file', blob, 'audio.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', language);

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const text = (result.text || '').trim();
          if (text) {
            return new Response(
              JSON.stringify({ text, service: 'openai-whisper' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          const errorText = await response.text();
          console.warn('OpenAI Whisper failed:', errorText.slice(0, 200));
        }
      } catch (e: any) {
        console.warn('Whisper threw:', e);
      }
    }

    // ── PRIORITY 3: Gemini Direct (fallback) ──
    if (GEMINI_API_KEY) {
      console.log('Trying Gemini Direct for STT…');
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: transcribePrompt },
                    { inlineData: { mimeType: 'audio/webm', data: audio } },
                  ],
                },
              ],
              generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
          if (text) {
            return new Response(
              JSON.stringify({ text, service: 'gemini-direct' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          const errorText = await response.text();
          console.error('Gemini direct failed:', errorText.slice(0, 200));
        }
      } catch (e: any) {
        console.warn('Gemini direct threw:', e);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'تعذّر تحويل الصوت إلى نص — جميع مزودي الخدمة فشلوا. تأكد من جودة التسجيل وحاول مرة أخرى.',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    console.error('Error in universal-speech-to-text:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
