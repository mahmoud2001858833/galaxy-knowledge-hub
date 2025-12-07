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
          .select('supabase_url, anon_key, schema_name, is_active, last_verified_at')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single()

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection: connection || null,
            connected: !!connection
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