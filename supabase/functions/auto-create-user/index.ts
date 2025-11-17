import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن الإيميل موجود في admin_teacher_access
    const { data: accessData, error: accessError } = await supabaseAdmin
      .from('admin_teacher_access')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (accessError || !accessData) {
      return new Response(
        JSON.stringify({ error: "Email not authorized" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // محاولة إنشاء المستخدم
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // تأكيد الإيميل تلقائياً
    });

    if (createError) {
      // إذا كان المستخدم موجود بالفعل، نرجع خطأ محدد
      if (createError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: "user_exists", message: "User already exists. Please try signing in." }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw createError;
    }

    // تحديث admin_teacher_access بمعرف المستخدم الجديد
    await supabaseAdmin
      .from('admin_teacher_access')
      .update({ user_id: userData.user.id })
      .eq('email', email.toLowerCase());

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: "Account created successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-create-user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
