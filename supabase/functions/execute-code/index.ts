import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, language } = await req.json()

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
