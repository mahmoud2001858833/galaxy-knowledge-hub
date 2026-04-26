import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTableRequest {
  action: 'create_table' | 'enable_rls' | 'create_policy' | 'create_bucket' | 'execute_sql';
  supabaseUrl: string;
  serviceKey: string;
  tableName?: string;
  columns?: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    default?: string;
    isPrimary?: boolean;
    isUnique?: boolean;
    references?: { table: string; column: string };
  }>;
  policyName?: string;
  policyCommand?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  policyExpression?: string;
  policyCheck?: string;
  bucketName?: string;
  isPublic?: boolean;
  sql?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const request: CreateTableRequest = await req.json()
    const { action, supabaseUrl, serviceKey } = request

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase URL and Service Key are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use PostgREST API with service key for admin operations
    const executeSQL = async (sql: string) => {
      console.log('Executing SQL:', sql.substring(0, 200))
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: sql }),
      })

      // Try using the SQL endpoint instead
      const sqlResponse = await fetch(`${supabaseUrl}/pg/sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!sqlResponse.ok) {
        const errorText = await sqlResponse.text()
        console.error('SQL Error:', errorText)
        throw new Error(`SQL execution failed: ${errorText}`)
      }

      return sqlResponse.json()
    }

    let result: any = {}

    switch (action) {
      case 'create_table': {
        const { tableName, columns } = request
        if (!tableName || !columns) {
          throw new Error('Table name and columns are required')
        }

        // Build CREATE TABLE SQL
        const columnDefs = columns.map(col => {
          let def = `"${col.name}" ${col.type}`
          if (col.isPrimary) def += ' PRIMARY KEY'
          if (!col.nullable && !col.isPrimary) def += ' NOT NULL'
          if (col.isUnique) def += ' UNIQUE'
          if (col.default) def += ` DEFAULT ${col.default}`
          if (col.references) def += ` REFERENCES ${col.references.table}(${col.references.column})`
          return def
        }).join(',\n  ')

        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public."${tableName}" (
            ${columnDefs}
          );
        `

        // Execute via Supabase Management API or SQL
        try {
          await executeSQL(createTableSQL)
          result = { success: true, message: `Table ${tableName} created successfully` }
        } catch (sqlError) {
          // Fallback: Return the SQL for manual execution
          result = { 
            success: false, 
            sql: createTableSQL,
            message: 'Unable to execute directly. Use this SQL in Supabase Dashboard.',
            error: sqlError instanceof Error ? sqlError.message : 'Unknown error'
          }
        }
        break
      }

      case 'enable_rls': {
        const { tableName } = request
        if (!tableName) throw new Error('Table name is required')

        const sql = `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`
        try {
          await executeSQL(sql)
          result = { success: true, message: `RLS enabled on ${tableName}` }
        } catch (e: any) {
          result = { success: false, sql, error: e instanceof Error ? e.message : 'Unknown error' }
        }
        break
      }

      case 'create_policy': {
        const { tableName, policyName, policyCommand, policyExpression, policyCheck } = request
        if (!tableName || !policyName || !policyCommand) {
          throw new Error('Table name, policy name, and command are required')
        }

        let sql = `CREATE POLICY "${policyName}" ON public."${tableName}" FOR ${policyCommand}`
        if (policyExpression) sql += ` USING (${policyExpression})`
        if (policyCheck) sql += ` WITH CHECK (${policyCheck})`
        sql += ';'

        try {
          await executeSQL(sql)
          result = { success: true, message: `Policy ${policyName} created on ${tableName}` }
        } catch (e: any) {
          result = { success: false, sql, error: e instanceof Error ? e.message : 'Unknown error' }
        }
        break
      }

      case 'create_bucket': {
        const { bucketName, isPublic } = request
        if (!bucketName) throw new Error('Bucket name is required')

        // Create storage bucket via API
        const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: bucketName,
            name: bucketName,
            public: isPublic ?? false,
          }),
        })

        if (bucketResponse.ok) {
          result = { success: true, message: `Bucket ${bucketName} created` }
        } else {
          const error = await bucketResponse.text()
          result = { success: false, error }
        }
        break
      }

      case 'execute_sql': {
        const { sql } = request
        if (!sql) throw new Error('SQL is required')

        try {
          await executeSQL(sql)
          result = { success: true, message: 'SQL executed successfully' }
        } catch (e: any) {
          result = { success: false, sql, error: e instanceof Error ? e.message : 'Unknown error' }
        }
        break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error in supabase-manager:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
