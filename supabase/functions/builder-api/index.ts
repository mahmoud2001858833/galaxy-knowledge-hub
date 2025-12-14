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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { action, projectId, data } = await req.json()

    console.log(`Builder API: ${action} for project ${projectId}`)

    switch (action) {
      // ===== USER MANAGEMENT =====
      case 'create_user': {
        const { email, password, fullName } = data
        
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName }
        })

        if (authError) throw authError

        // Create profile
        const { error: profileError } = await supabase
          .from('builder_profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'user'
          })

        if (profileError) console.error('Profile error:', profileError)

        return new Response(
          JSON.stringify({ success: true, user: authData.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_user': {
        const { userId } = data
        
        const { data: profile, error } = await supabase
          .from('builder_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, profile }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ===== CONTENT MANAGEMENT =====
      case 'create_content': {
        const { title, content, imageUrl, category, authorId } = data
        
        const { data: result, error } = await supabase
          .from('builder_content')
          .insert({
            title,
            content,
            image_url: imageUrl,
            category,
            author_id: authorId,
            is_published: true
          })
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_content': {
        const { limit = 50, category, authorId } = data || {}
        
        let query = supabase
          .from('builder_content')
          .select('*, author:builder_profiles(full_name, avatar_url)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (category) query = query.eq('category', category)
        if (authorId) query = query.eq('author_id', authorId)
        if (limit) query = query.limit(limit)

        const { data: result, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_content': {
        const { id, updates } = data
        
        const { data: result, error } = await supabase
          .from('builder_content')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_content': {
        const { id } = data
        
        const { error } = await supabase
          .from('builder_content')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ===== FILE UPLOAD =====
      case 'upload_file': {
        const { fileName, fileData, folder = 'uploads' } = data
        
        // fileData should be base64 encoded
        const buffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))
        const filePath = `${folder}/${Date.now()}_${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath)

        return new Response(
          JSON.stringify({ success: true, url: urlData.publicUrl, path: filePath }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ===== STATS =====
      case 'get_stats': {
        const { data: contentCount } = await supabase
          .from('builder_content')
          .select('id', { count: 'exact', head: true })

        const { data: usersCount } = await supabase
          .from('builder_profiles')
          .select('id', { count: 'exact', head: true })

        return new Response(
          JSON.stringify({ 
            success: true, 
            stats: {
              totalContent: contentCount || 0,
              totalUsers: usersCount || 0
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ===== CREATE TABLES =====
      case 'create_tables': {
        const { sql } = data
        
        // Note: Direct SQL execution requires service role and is risky
        // Instead, provide the SQL for manual execution
        return new Response(
          JSON.stringify({ 
            success: false, 
            manualRequired: true,
            sql,
            editorUrl: `${SUPABASE_URL.replace('.supabase.co', '')}/sql/new`,
            message: 'يرجى تنفيذ SQL يدوياً في Supabase SQL Editor'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Builder API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
