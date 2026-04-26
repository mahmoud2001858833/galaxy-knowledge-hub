import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
    }

    const service = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get current user from Authorization header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { data: userData, error: userErr } = await service.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = userData.user;
    const email = user.email?.toLowerCase() || "";

    // Allowed super admin emails (include common variants)
    const allowed = new Set([
      "jowmahdmoud6@gmail.com",
      "jowmahmoud6@gmail.com",
      "jali53207@gmail.com",
      "jo789wmahmoud6@gmail.com",
    ]);

    if (!allowed.has(email)) {
      return new Response(JSON.stringify({ status: "skipped", reason: "not-in-allowlist" }), { status: 200 });
    }

    // Check if a row already exists for this email
    const { data: existing, error: selErr } = await service
      .from("admin_teacher_access")
      .select("id, user_id, access_level")
      .eq("email", email)
      .limit(1);

    if (selErr) throw selErr;

    if (existing && existing.length > 0) {
      const row = existing[0];
      // Update to ensure user_id and super_admin
      const { error: updErr } = await service
        .from("admin_teacher_access")
        .update({ user_id: user.id, access_level: "super_admin" })
        .eq("id", row.id);
      if (updErr) throw updErr;
    } else {
      // Insert new record
      const { error: insErr } = await service
        .from("admin_teacher_access")
        .insert({ user_id: user.id, email, access_level: "super_admin", created_by: user.id });
      if (insErr) throw insErr;
    }

    return new Response(JSON.stringify({ status: "ok", access_level: "super_admin" }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
