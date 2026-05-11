import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require authentication — this endpoint executes arbitrary code
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData, error: userErr } = await authClient.auth.getUser(token)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { code, language } = await req.json()

    // Limit code length to mitigate abuse
    if (typeof code === 'string' && code.length > 20000) {
      return new Response(JSON.stringify({ error: 'Code too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let result = ''
    let error = ''

    if (language === 'python') {
      // Execute Python code
      try {
        const pythonProcess = (Deno as any).run({
          cmd: ['python3', '-c', code],
          stdout: 'piped',
          stderr: 'piped',
        })

        const [status, stdout, stderr] = await Promise.all([
          pythonProcess.status(),
          pythonProcess.output(),
          pythonProcess.stderrOutput(),
        ])

        pythonProcess.close()

        if (status.success) {
          result = new TextDecoder().decode(stdout)
        } else {
          error = new TextDecoder().decode(stderr)
        }
      } catch (e: any) {
        error = `Python execution error: ${e.message}`
      }
    } else if (language === 'cpp') {
      // Execute C++ code
      try {
        // Save code to temporary file
        const tempFile = `/tmp/temp_${Date.now()}.cpp`
        const outputFile = `/tmp/temp_${Date.now()}_out`
        
        await Deno.writeTextFile(tempFile, code)

        // Compile C++ code
        const compileProcess = (Deno as any).run({
          cmd: ['g++', tempFile, '-o', outputFile],
          stdout: 'piped',
          stderr: 'piped',
        })

        const [compileStatus, , compileStderr] = await Promise.all([
          compileProcess.status(),
          compileProcess.output(),
          compileProcess.stderrOutput(),
        ])

        compileProcess.close()

        if (!compileStatus.success) {
          error = `Compilation error: ${new TextDecoder().decode(compileStderr)}`
        } else {
          // Execute compiled program
          const executeProcess = (Deno as any).run({
            cmd: [outputFile],
            stdout: 'piped',
            stderr: 'piped',
          })

          const [executeStatus, stdout, stderr] = await Promise.all([
            executeProcess.status(),
            executeProcess.output(),
            executeProcess.stderrOutput(),
          ])

          executeProcess.close()

          if (executeStatus.success) {
            result = new TextDecoder().decode(stdout)
          } else {
            error = new TextDecoder().decode(stderr)
          }
        }

        // Cleanup temporary files
        try {
          await Deno.remove(tempFile)
          await Deno.remove(outputFile)
        } catch (_) {
          // Ignore cleanup errors
        }
      } catch (e: any) {
        error = `C++ execution error: ${e.message}`
      }
    } else if (language === 'php') {
      // Execute PHP code
      try {
        const phpProcess = (Deno as any).run({
          cmd: ['php', '-r', code],
          stdout: 'piped',
          stderr: 'piped',
        })

        const [status, stdout, stderr] = await Promise.all([
          phpProcess.status(),
          phpProcess.output(),
          phpProcess.stderrOutput(),
        ])

        phpProcess.close()

        if (status.success) {
          result = new TextDecoder().decode(stdout)
        } else {
          error = new TextDecoder().decode(stderr)
        }
      } catch (e: any) {
        error = `PHP execution error: ${e.message}`
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported language. Use "python", "cpp", or "php".' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        result, 
        error,
        success: !error 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in execute-code function:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ في تنفيذ الكود: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
