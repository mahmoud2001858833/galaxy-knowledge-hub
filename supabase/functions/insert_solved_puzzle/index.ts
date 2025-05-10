
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user ID from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "حدث خطأ في التحقق من المستخدم" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the puzzle data from the request
    const { puzzle_id, subject } = await req.json();

    if (!puzzle_id || !subject) {
      return new Response(
        JSON.stringify({ error: "يرجى توفير معرف اللغز والمادة" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert into user_solved_puzzles table
    const { data: insertData, error: insertError } = await supabaseClient
      .from("user_solved_puzzles")
      .insert({
        user_id: user.id,
        puzzle_id: puzzle_id,
        subject: subject,
      })
      .select();

    if (insertError) {
      // Check if it's a duplicate entry
      if (insertError.code === "23505") { // Unique violation
        return new Response(
          JSON.stringify({ message: "تم حل هذا اللغز مسبقًا" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw insertError;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "تم تسجيل الحل بنجاح",
        data: insertData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
