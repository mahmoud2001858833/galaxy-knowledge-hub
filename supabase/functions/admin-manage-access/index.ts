import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Body {
  email: string;
  access_level: 'member' | 'admin' | 'super_admin';
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
    }

    const service = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { data: invokerData, error: invokerErr } = await service.auth.getUser(token);
    if (invokerErr || !invokerData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = (await req.json()) as Body;
    const email = body.email?.toLowerCase()?.trim();
    const accessLevel = body.access_level === 'admin' ? 'admin' : 'member'; // prevent elevating to super_admin from UI
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Check invoker permissions (must be super_admin)
    const { data: invokerAccess, error: accessErr } = await service
      .from('admin_teacher_access')
      .select('id')
      .eq('user_id', invokerData.user.id)
      .eq('access_level', 'super_admin')
      .limit(1);
    if (accessErr) throw accessErr;
    if (!invokerAccess || invokerAccess.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Find or create target user by email
    async function findUserIdByEmail(targetEmail: string): Promise<string | null> {
      // Try naive pagination up to 10 pages
      for (let page = 1; page <= 10; page++) {
        const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const found = data.users.find(u => (u.email || '').toLowerCase() === targetEmail);
        if (found) return found.id;
        if (data.users.length < 200) break;
      }
      return null;
    }

    let targetUserId = await findUserIdByEmail(email);

    if (!targetUserId) {
      // Create the user quietly if not found
      const { data: created, error: createErr } = await service.auth.admin.createUser({
        email,
        email_confirm: false
      });
      if (createErr) {
        // If already exists, try to find again
        const retryId = await findUserIdByEmail(email);
        if (!retryId) throw createErr;
        targetUserId = retryId;
      } else {
        targetUserId = created.user?.id || null;
      }
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Unable to resolve user id' }), { status: 500 });
    }

    // Upsert access by email (unique on email) and set user_id
    const { error: upsertErr } = await service
      .from('admin_teacher_access')
      .upsert({ email, user_id: targetUserId, access_level: accessLevel }, { onConflict: 'email' });
    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ status: 'ok', email, access_level: accessLevel, user_id: targetUserId }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
