import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, projectId, supabaseUrl, anonKey, serviceRoleKey, schema = 'public' } = await req.json()

    // Create admin client for our database
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    switch (action) {
      case 'connect': {
        // Validate input
        if (!supabaseUrl || !anonKey || !projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'بيانات ناقصة: supabaseUrl و anonKey و projectId مطلوبة' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Validate URL format
        if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('supabase.in')) {
          return new Response(
            JSON.stringify({ success: false, error: 'رابط Supabase غير صحيح' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        console.log(`Testing connection to: ${supabaseUrl}`)

        // Test connection to user's Supabase
        try {
          const testClient = createClient(supabaseUrl, anonKey)
          
          // Try a simple query to verify connection
          const { error: testError } = await testClient
            .from('_test_connection_')
            .select('*')
            .limit(1)
          
          // We expect an error since table doesn't exist, but it should be a "table not found" error
          // Not a connection error
          if (testError && !testError.message.includes('does not exist') && 
              !testError.message.includes('permission denied') &&
              !testError.message.includes('relation')) {
            // Try auth check instead
            const { error: authError } = await testClient.auth.getSession()
            if (authError && authError.message.includes('fetch')) {
              throw new Error('فشل الاتصال بـ Supabase')
            }
          }

          console.log('Connection test passed')
        } catch (connError) {
          console.error('Connection test failed:', connError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'فشل الاتصال بـ Supabase. تأكد من صحة الرابط والمفتاح.' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Check if connection already exists
        const { data: existing } = await adminClient
          .from('supabase_connections')
          .select('id')
          .eq('project_id', projectId)
          .single()

        if (existing) {
          // Update existing connection
          const { error: updateError } = await adminClient
            .from('supabase_connections')
            .update({
              supabase_url: supabaseUrl,
              anon_key: anonKey,
              service_role_key: serviceRoleKey || null,
              schema_name: schema,
              is_active: true,
              last_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('project_id', projectId)

          if (updateError) throw updateError
        } else {
          // Create new connection
          const { error: insertError } = await adminClient
            .from('supabase_connections')
            .insert({
              project_id: projectId,
              supabase_url: supabaseUrl,
              anon_key: anonKey,
              service_role_key: serviceRoleKey || null,
              schema_name: schema,
              is_active: true,
              last_verified_at: new Date().toISOString()
            })

          if (insertError) throw insertError
        }

        // Also update the project itself
        await adminClient
          .from('ai_builder_projects')
          .update({
            supabase_url: supabaseUrl,
            supabase_anon_key: anonKey,
            supabase_connected: true
          })
          .eq('id', projectId)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'تم الربط بـ Supabase بنجاح!',
            connected: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'verify': {
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: connection, error } = await adminClient
          .from('supabase_connections')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        if (error || !connection) {
          return new Response(
            JSON.stringify({ connected: false, message: 'لا يوجد اتصال نشط' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Test the connection is still valid
        try {
          const testClient = createClient(connection.supabase_url, connection.anon_key)
          await testClient.auth.getSession()
          
          // Update last verified
          await adminClient
            .from('supabase_connections')
            .update({ last_verified_at: new Date().toISOString() })
            .eq('id', connection.id)

          return new Response(
            JSON.stringify({ 
              connected: true, 
              url: connection.supabase_url,
              schema: connection.schema_name,
              lastVerified: connection.last_verified_at,
              tables: connection.tables_cache || []
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch {
          return new Response(
            JSON.stringify({ connected: false, message: 'فشل التحقق من الاتصال' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'disconnect': {
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        await adminClient
          .from('supabase_connections')
          .update({ is_active: false })
          .eq('project_id', projectId)

        await adminClient
          .from('ai_builder_projects')
          .update({ supabase_connected: false })
          .eq('id', projectId)

        return new Response(
          JSON.stringify({ success: true, message: 'تم إلغاء الربط' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_tables': {
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: connection } = await adminClient
          .from('supabase_connections')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        if (!connection?.service_role_key) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'مفتاح Service Role مطلوب لجلب الجداول' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        try {
          const userClient = createClient(connection.supabase_url, connection.service_role_key)
          
          // Query information_schema for tables
          const { data: tables, error: tablesError } = await userClient
            .rpc('get_tables_info')
            .select('*')
          
          // If RPC doesn't exist, return empty
          if (tablesError) {
            console.log('Could not fetch tables:', tablesError.message)
            return new Response(
              JSON.stringify({ 
                success: true, 
                tables: [],
                message: 'لا يمكن جلب الجداول - قد تحتاج لإنشاء function في Supabase'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Cache the tables
          await adminClient
            .from('supabase_connections')
            .update({ tables_cache: tables })
            .eq('id', connection.id)

          return new Response(
            JSON.stringify({ success: true, tables }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (err) {
          console.error('Error fetching tables:', err)
          return new Response(
            JSON.stringify({ success: true, tables: [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'get_connection': {
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: connection } = await adminClient
          .from('supabase_connections')
          .select('supabase_url, anon_key, service_role_key, schema_name, is_active, last_verified_at')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection: connection || null,
            connected: !!connection,
            hasServiceKey: !!connection?.service_role_key
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create_tables': {
        // إنشاء الجداول تلقائياً في قاعدة بيانات المستخدم
        const { sql, tableName } = await req.json().catch(() => ({}))
        
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        if (!sql) {
          return new Response(
            JSON.stringify({ success: false, error: 'SQL مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // جلب بيانات الاتصال
        const { data: conn } = await adminClient
          .from('supabase_connections')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        if (!conn) {
          return new Response(
            JSON.stringify({ success: false, error: 'لا يوجد اتصال Supabase نشط' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        if (!conn.service_role_key) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'مفتاح Service Role مطلوب لإنشاء الجداول',
              requiresServiceKey: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        console.log(`Creating tables in user's Supabase: ${conn.supabase_url}`)
        console.log('SQL:', sql.substring(0, 200))

        try {
          // استخدام REST API لتنفيذ SQL
          const supabaseRef = conn.supabase_url.match(/https:\/\/([^.]+)/)?.[1]
          if (!supabaseRef) throw new Error('Invalid Supabase URL')

          // تنفيذ SQL عبر REST API
          const sqlResponse = await fetch(`${conn.supabase_url}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${conn.service_role_key}`,
              'apikey': conn.service_role_key,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: sql })
          })

          // إذا لم تكن exec_sql موجودة، نحاول طريقة أخرى
          if (!sqlResponse.ok) {
            // محاولة استخدام pg-sql endpoint
            const pgSqlResponse = await fetch(`https://${supabaseRef}.supabase.co/pg/sql`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${conn.service_role_key}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query: sql })
            })

            if (!pgSqlResponse.ok) {
              // محاولة أخيرة - REST API مباشرة
              console.log('Trying alternative SQL execution method...')
              
              // تقسيم SQL إلى statements منفصلة
              const statements = sql.split(';').filter((s: string) => s.trim())
              const errors: string[] = []
              
              for (const stmt of statements) {
                const trimmedStmt = stmt.trim()
                if (!trimmedStmt) continue
                
                // محاولة تنفيذ كل statement
                try {
                  // استخدام supabase-js لإنشاء الجداول
                  const createClient = (await import('https://esm.sh/@supabase/supabase-js@2')).createClient
                  const userSupabase = createClient(conn.supabase_url, conn.service_role_key, {
                    db: { schema: conn.schema_name || 'public' }
                  })
                  
                  // محاولة استخدام RPC أو أي طريقة متاحة
                  const { error: rpcError } = await userSupabase.rpc('exec_sql', { query: trimmedStmt + ';' })
                  if (rpcError) {
                    console.log('RPC not available, SQL needs manual execution')
                    errors.push(rpcError.message)
                  }
                } catch (e) {
                  console.error('Statement error:', e)
                }
              }

              // إذا فشلت كل المحاولات، نرجع SQL للتنفيذ اليدوي
              if (errors.length > 0) {
                return new Response(
                  JSON.stringify({ 
                    success: false, 
                    error: 'تعذر تنفيذ SQL تلقائياً. يرجى تنفيذه يدوياً.',
                    sql,
                    manualRequired: true,
                    editorUrl: `https://supabase.com/dashboard/project/${supabaseRef}/sql/new`
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
              }
            }
          }

          console.log('Tables created successfully')

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `تم إنشاء ${tableName || 'الجداول'} بنجاح!`,
              tablesCreated: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (sqlError) {
          console.error('SQL execution error:', sqlError)
          
          // إرجاع SQL للتنفيذ اليدوي
          const supabaseRef = conn.supabase_url.match(/https:\/\/([^.]+)/)?.[1] || ''
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'تعذر تنفيذ SQL تلقائياً',
              sql,
              manualRequired: true,
              editorUrl: `https://supabase.com/dashboard/project/${supabaseRef}/sql/new`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'auto_create_auth_tables': {
        // إنشاء جداول المصادقة الأساسية تلقائياً
        if (!projectId) {
          return new Response(
            JSON.stringify({ success: false, error: 'projectId مطلوب' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: conn } = await adminClient
          .from('supabase_connections')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        if (!conn || !conn.service_role_key) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'مفتاح Service Role مطلوب',
              requiresServiceKey: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // SQL لإنشاء جداول المصادقة الأساسية
        const authTablesSql = `
-- Profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

        const supabaseRef = conn.supabase_url.match(/https:\/\/([^.]+)/)?.[1] || ''

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'تم تجهيز SQL لجداول المصادقة',
            sql: authTablesSql,
            editorUrl: `https://supabase.com/dashboard/project/${supabaseRef}/sql/new`,
            instructions: 'انسخ SQL وألصقه في محرر Supabase لإنشاء الجداول'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Action غير معروف' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير متوقع' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})