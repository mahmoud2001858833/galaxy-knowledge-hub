import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = "AIzaSyA2ZnwA-yCDBdkFmqtg2dZTq4DuQSSS7zM";
const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_IMAGE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const pointsMap: Record<string, number> = {
      'سهل': 10,
      'متوسط': 20,
      'صعب': 30,
    };

    // Generate puzzles text via Gemini
    const textPrompt = `أنت مولّد ألغاز تعليمية. أنشئ ${count} لغز تعليمي في مادة "${subject}" بمستوى صعوبة "${difficulty}" حول الموضوع التالي: "${topicDescription}".

لكل لغز أعط:
- title: عنوان قصير
- question: نص السؤال
- options: مصفوفة من 4 خيارات
- correct_answer: الإجابة الصحيحة (يجب أن تكون أحد الخيارات بالضبط)

أرجع النتيجة كـ JSON فقط بالشكل التالي بدون أي نص إضافي:
[{"title":"...","question":"...","options":["أ","ب","ج","د"],"correct_answer":"أ"},...]`;

    const textResponse = await fetch(GEMINI_TEXT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: textPrompt }] }],
        generationConfig: { temperature: 0.8 },
      }),
    });

    if (!textResponse.ok) {
      const errText = await textResponse.text();
      console.error("Gemini text error:", errText);
      throw new Error("Failed to generate puzzles text");
    }

    const textData = await textResponse.json();
    let rawText = textData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
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

      // Generate image for this puzzle
      try {
        const imagePrompt = `Create a clean, educational illustration for a ${subject} quiz about: ${puzzle.question}. 
The image should be a simple, colorful educational diagram or illustration. 
IMPORTANT: Do NOT include any text, letters, numbers, words, or Arabic characters in the image. Only visual elements.`;

        const imgResponse = await fetch(GEMINI_IMAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: imagePrompt }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const parts = imgData.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find((p: any) => p.inlineData);
          
          if (imagePart?.inlineData) {
            const base64 = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || "image/png";
            const ext = mimeType.includes("jpeg") ? "jpg" : "png";
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
