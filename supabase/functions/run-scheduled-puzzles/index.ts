import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current day name
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    // Fetch active jobs scheduled for today
    const { data: jobs, error: jobsError } = await supabase
      .from("scheduled_puzzle_jobs")
      .select("*")
      .eq("is_active", true)
      .contains("schedule_days", [today]);

    if (jobsError) throw jobsError;

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: "No jobs scheduled for today" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const job of jobs) {
      try {
        // Call generate-ai-puzzles function
        const genResponse = await fetch(`${supabaseUrl}/functions/v1/generate-ai-puzzles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            subject: job.subject,
            difficulty: job.difficulty,
            count: job.puzzles_per_day,
            topicDescription: job.topic_description,
          }),
        });

        const genResult = await genResponse.json();

        // Update last_run_at
        await supabase
          .from("scheduled_puzzle_jobs")
          .update({ last_run_at: new Date().toISOString() })
          .eq("id", job.id);

        results.push({ jobId: job.id, subject: job.subject, result: genResult });
      } catch (jobError) {
        console.error(`Error running job ${job.id}:`, jobError);
        results.push({ jobId: job.id, error: jobError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
