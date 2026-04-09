import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, difficulty, count, topicDescription } = await req.json();

    if (!subject || !difficulty || !count || !topicDescription) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const pointsMap: Record<string, number> = {
      'سهل': 10,
      'متوسط': 20,
      'صعب': 30,
    };

    // Generate puzzles text via Lovable AI Gateway
    const textPrompt = `أنت مولّد ألغاز تعليمية. أنشئ ${count} لغز تعليمي في مادة "${subject}" بمستوى صعوبة "${difficulty}" حول الموضوع التالي: "${topicDescription}".

لكل لغز أعط:
- title: عنوان قصير
- question: نص السؤال
- options: مصفوفة من 4 خيارات
- correct_answer: الإجابة الصحيحة (يجب أن تكون أحد الخيارات بالضبط)

أرجع النتيجة كـ JSON فقط بالشكل التالي بدون أي نص إضافي:
[{"title":"...","question":"...","options":["أ","ب","ج","د"],"correct_answer":"أ"},...]`;

    const textResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "أنت مساعد تعليمي متخصص في توليد ألغاز تعليمية. أجب بـ JSON فقط." },
          { role: "user", content: textPrompt },
        ],
      }),
    });

    if (!textResponse.ok) {
      const errText = await textResponse.text();
      console.error("AI Gateway text error:", textResponse.status, errText);
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (textResponse.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى شحن الرصيد في إعدادات Lovable" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate puzzles text");
    }

    const textData = await textResponse.json();
    let rawText = textData.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", rawText);
      throw new Error("Could not parse puzzles from AI response");
    }

    const puzzles = JSON.parse(jsonMatch[0]);
    const results: any[] = [];

    for (const puzzle of puzzles) {
      let imageUrl: string | null = null;

      // Generate image for this puzzle using Lovable AI image generation
      try {
        const imagePrompt = `Create a clean, educational illustration for a ${subject} quiz about: ${puzzle.question}. 
The image should be a simple, colorful educational diagram or illustration. 
IMPORTANT: Do NOT include any text, letters, numbers, words, or Arabic characters in the image. Only visual elements.`;

        const imgResponse = await fetch(LOVABLE_AI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: imagePrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const images = imgData.choices?.[0]?.message?.images;
          
          if (images && images.length > 0) {
            const dataUrl = images[0]?.image_url?.url;
            if (dataUrl && dataUrl.startsWith("data:image/")) {
              // Extract base64 from data URL
              const base64Match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
              if (base64Match) {
                const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
                const base64 = base64Match[2];
                const mimeType = `image/${base64Match[1]}`;
                const fileName = `ai-puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

                // Decode base64
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }

                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from("educational_images")
                  .upload(`puzzles/${fileName}`, bytes, {
                    contentType: mimeType,
                    upsert: false,
                  });

                if (!uploadError && uploadData) {
                  const { data: urlData } = supabase.storage
                    .from("educational_images")
                    .getPublicUrl(`puzzles/${fileName}`);
                  imageUrl = urlData.publicUrl;
                } else {
                  console.error("Upload error:", uploadError);
                }
              }
            }
          }
        } else {
          console.error("Image generation error:", imgResponse.status, await imgResponse.text());
        }
      } catch (imgErr) {
        console.error("Image generation error:", imgErr);
      }

      // Insert puzzle into database
      const puzzleData = {
        title: puzzle.title,
        question: puzzle.question,
        options: puzzle.options,
        correct_answer: puzzle.correct_answer,
        difficulty,
        points: pointsMap[difficulty] || 10,
        subject,
        image: imageUrl,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("subject_puzzles")
        .insert(puzzleData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        results.push({ ...puzzleData, status: "error", error: insertError.message });
      } else {
        results.push({ ...inserted, status: "success" });
      }
    }

    return new Response(JSON.stringify({ success: true, puzzles: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
