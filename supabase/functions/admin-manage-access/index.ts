import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Body {
  email: string;
  access_level: 'member' | 'admin' | 'super_admin';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const service = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      console.error('No authorization token provided');
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: invokerData, error: invokerErr } = await service.auth.getUser(token);
    if (invokerErr || !invokerData.user) {
      console.error('Invalid token or user:', invokerErr);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request from user:', invokerData.user.email);

    const body = (await req.json()) as Body;
    const email = body.email?.toLowerCase()?.trim();
    const accessLevel = body.access_level === 'admin' ? 'admin' : 'member';
    
    if (!email) {
      console.error('Email is missing in request');
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Adding access for:', email, 'as', accessLevel);

    // Check invoker permissions (must be super_admin)
    const { data: invokerAccess, error: accessErr } = await service
      .from('admin_teacher_access')
      .select('access_level')
      .eq('user_id', invokerData.user.id)
      .maybeSingle();
      
    if (accessErr) {
      console.error('Error checking invoker access:', accessErr);
      throw accessErr;
    }
    
    if (!invokerAccess || invokerAccess.access_level !== 'super_admin') {
      console.error('User is not super_admin:', invokerData.user.email, 'has:', invokerAccess?.access_level);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Only super admins can manage access' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invoker is super_admin, proceeding...');

    // Check if email already exists
    const { data: existingAccess } = await service
      .from('admin_teacher_access')
      .select('id, user_id')
      .eq('email', email)
      .maybeSingle();

    let targetUserId = existingAccess?.user_id || null;

    // If no existing record or no user_id, try to find/create user
    if (!targetUserId) {
      console.log('Looking for user with email:', email);
      
      // Search for existing user
      const { data: authUsers, error: listError } = await service.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw listError;
      }

      const foundUser = authUsers.users.find(u => (u.email || '').toLowerCase() === email);
      
      if (foundUser) {
        console.log('Found existing user:', foundUser.id);
        targetUserId = foundUser.id;
      } else {
        console.log('User not found, creating new user...');
        
        // Create new user
        const { data: newUser, error: createErr } = await service.auth.admin.createUser({
          email,
          email_confirm: true,
        });

        if (createErr) {
          console.error('Error creating user:', createErr);
          throw createErr;
        }

        if (!newUser.user) {
          throw new Error('Failed to create user - no user returned');
        }

        console.log('Created new user:', newUser.user.id);
        targetUserId = newUser.user.id;
      }
    }

    if (!targetUserId) {
      console.error('Unable to resolve target user ID');
      return new Response(
        JSON.stringify({ error: 'Unable to resolve user' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upserting access record for user:', targetUserId);

    // Insert or update access record
    const { data: upsertData, error: upsertErr } = await service
      .from('admin_teacher_access')
      .upsert(
        { 
          email, 
          user_id: targetUserId, 
          access_level: accessLevel 
        },
        { 
          onConflict: 'email',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error('Error upserting access:', upsertErr);
      throw upsertErr;
    }

    console.log('Successfully added access:', upsertData);

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        email, 
        access_level: accessLevel, 
        user_id: targetUserId,
        message: 'Access granted successfully'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('Error in admin-manage-access:', e);
    return new Response(
      JSON.stringify({ 
        error: e.message || String(e),
        details: e.details || 'No additional details'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
