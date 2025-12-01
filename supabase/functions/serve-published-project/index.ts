import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Read slug from request body
    const { slug } = await req.json()

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // جلب المشروع المنشور
    const { data: project, error: projectError } = await supabase
      .from('ai_builder_projects')
      .select('*')
      .eq('publish_slug', slug)
      .eq('is_published', true)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // جلب ملفات المشروع
    const { data: files, error: filesError } = await supabase
      .from('ai_builder_files')
      .select('*')
      .eq('project_id', project.id)
      .order('file_name')

    if (filesError) {
      console.error('Error fetching files:', filesError)
      return new Response(
        JSON.stringify({ error: 'Error fetching project files' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        project,
        files: files || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in serve-published-project:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `Error: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
