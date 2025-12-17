import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { projectId, action, data } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('ai_builder_projects')
      .select('id, title, is_published')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any = null;

    switch (action) {
      // ==================== AUTH ====================
      case 'register': {
        const { email, password, fullName } = data;
        
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('builder_app_users')
          .select('id')
          .eq('builder_project_id', projectId)
          .eq('email', email)
          .single();

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'User already exists' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash password using Web Crypto API
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(password + projectId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create user
        const { data: newUser, error: createError } = await supabase
          .from('builder_app_users')
          .insert({
            builder_project_id: projectId,
            email,
            password_hash: passwordHash,
            full_name: fullName || email.split('@')[0],
          })
          .select('id, email, full_name, role, created_at')
          .single();

        if (createError) {
          console.error('Create user error:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create session token
        const token = crypto.randomUUID() + '-' + crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await supabase.from('builder_app_sessions').insert({
          builder_project_id: projectId,
          user_id: newUser.id,
          token,
          expires_at: expiresAt.toISOString(),
        });

        result = {
          user: newUser,
          token,
          expiresAt: expiresAt.toISOString(),
        };
        break;
      }

      case 'login': {
        const { email, password } = data;

        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash password
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(password + projectId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Find user
        const { data: user, error: userError } = await supabase
          .from('builder_app_users')
          .select('id, email, full_name, role, avatar_url')
          .eq('builder_project_id', projectId)
          .eq('email', email)
          .eq('password_hash', passwordHash)
          .single();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update last login
        await supabase
          .from('builder_app_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        // Create session token
        const token = crypto.randomUUID() + '-' + crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await supabase.from('builder_app_sessions').insert({
          builder_project_id: projectId,
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        });

        result = {
          user,
          token,
          expiresAt: expiresAt.toISOString(),
        };
        break;
      }

      case 'logout': {
        const { token } = data;
        if (token) {
          await supabase.from('builder_app_sessions').delete().eq('token', token);
        }
        result = { success: true };
        break;
      }

      case 'verify_token': {
        const { token } = data;
        
        const { data: session } = await supabase
          .from('builder_app_sessions')
          .select('user_id, expires_at, builder_app_users(id, email, full_name, role, avatar_url)')
          .eq('token', token)
          .eq('builder_project_id', projectId)
          .single();

        if (!session || new Date(session.expires_at) < new Date()) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = { user: session.builder_app_users, valid: true };
        break;
      }

      // ==================== CONTENT ====================
      case 'get_content': {
        const { id, category, contentType, limit = 50, offset = 0, search } = data || {};
        
        let query = supabase
          .from('builder_app_content')
          .select('*, builder_app_users!author_id(id, full_name, avatar_url)')
          .eq('builder_project_id', projectId)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (id) {
          query = query.eq('id', id);
        }
        if (category) {
          query = query.eq('category', category);
        }
        if (contentType) {
          query = query.eq('content_type', contentType);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        
        query = query.range(offset, offset + limit - 1);

        const { data: content, error } = await query;
        
        if (error) {
          console.error('Get content error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get content' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = content;
        break;
      }

      case 'add_content': {
        const { token, title, content, contentType, imageUrl, category, metadata } = data;

        // Verify token and get user
        let authorId = null;
        if (token) {
          const { data: session } = await supabase
            .from('builder_app_sessions')
            .select('user_id')
            .eq('token', token)
            .eq('builder_project_id', projectId)
            .single();
          
          if (session) {
            authorId = session.user_id;
          }
        }

        const { data: newContent, error } = await supabase
          .from('builder_app_content')
          .insert({
            builder_project_id: projectId,
            title,
            content,
            content_type: contentType || 'post',
            image_url: imageUrl,
            category,
            author_id: authorId,
            metadata: metadata || {},
          })
          .select()
          .single();

        if (error) {
          console.error('Add content error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to add content' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = newContent;
        break;
      }

      case 'update_content': {
        const { id, token, ...updates } = data;

        // Map camelCase to snake_case
        const mappedUpdates: any = {};
        if (updates.title !== undefined) mappedUpdates.title = updates.title;
        if (updates.content !== undefined) mappedUpdates.content = updates.content;
        if (updates.contentType !== undefined) mappedUpdates.content_type = updates.contentType;
        if (updates.imageUrl !== undefined) mappedUpdates.image_url = updates.imageUrl;
        if (updates.category !== undefined) mappedUpdates.category = updates.category;
        if (updates.isPublished !== undefined) mappedUpdates.is_published = updates.isPublished;
        if (updates.metadata !== undefined) mappedUpdates.metadata = updates.metadata;

        const { data: updated, error } = await supabase
          .from('builder_app_content')
          .update(mappedUpdates)
          .eq('id', id)
          .eq('builder_project_id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Update content error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update content' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = updated;
        break;
      }

      case 'delete_content': {
        const { id } = data;

        const { error } = await supabase
          .from('builder_app_content')
          .delete()
          .eq('id', id)
          .eq('builder_project_id', projectId);

        if (error) {
          console.error('Delete content error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete content' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = { success: true };
        break;
      }

      // ==================== COMMENTS ====================
      case 'get_comments': {
        const { contentId } = data;

        const { data: comments, error } = await supabase
          .from('builder_app_comments')
          .select('*, builder_app_users(id, full_name, avatar_url)')
          .eq('builder_project_id', projectId)
          .eq('content_id', contentId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Get comments error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get comments' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = comments;
        break;
      }

      case 'add_comment': {
        const { token, contentId, commentText } = data;

        // Verify token
        let userId = null;
        if (token) {
          const { data: session } = await supabase
            .from('builder_app_sessions')
            .select('user_id')
            .eq('token', token)
            .eq('builder_project_id', projectId)
            .single();
          
          if (session) {
            userId = session.user_id;
          }
        }

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: comment, error } = await supabase
          .from('builder_app_comments')
          .insert({
            builder_project_id: projectId,
            content_id: contentId,
            user_id: userId,
            comment_text: commentText,
          })
          .select('*, builder_app_users(id, full_name, avatar_url)')
          .single();

        if (error) {
          console.error('Add comment error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to add comment' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = comment;
        break;
      }

      // ==================== LIKES ====================
      case 'toggle_like': {
        const { token, contentId } = data;

        // Verify token
        let userId = null;
        if (token) {
          const { data: session } = await supabase
            .from('builder_app_sessions')
            .select('user_id')
            .eq('token', token)
            .eq('builder_project_id', projectId)
            .single();
          
          if (session) {
            userId = session.user_id;
          }
        }

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if already liked
        const { data: existingLike } = await supabase
          .from('builder_app_likes')
          .select('id')
          .eq('builder_project_id', projectId)
          .eq('content_id', contentId)
          .eq('user_id', userId)
          .single();

        if (existingLike) {
          // Unlike
          await supabase.from('builder_app_likes').delete().eq('id', existingLike.id);
          await supabase
            .from('builder_app_content')
            .update({ likes_count: supabase.rpc('decrement', { x: 1 }) })
            .eq('id', contentId);
          
          result = { liked: false };
        } else {
          // Like
          await supabase.from('builder_app_likes').insert({
            builder_project_id: projectId,
            content_id: contentId,
            user_id: userId,
          });
          
          // Increment likes count
          const { data: content } = await supabase
            .from('builder_app_content')
            .select('likes_count')
            .eq('id', contentId)
            .single();
          
          await supabase
            .from('builder_app_content')
            .update({ likes_count: (content?.likes_count || 0) + 1 })
            .eq('id', contentId);
          
          result = { liked: true };
        }
        break;
      }

      case 'get_likes_count': {
        const { contentId } = data;

        const { count } = await supabase
          .from('builder_app_likes')
          .select('*', { count: 'exact', head: true })
          .eq('builder_project_id', projectId)
          .eq('content_id', contentId);

        result = { count: count || 0 };
        break;
      }

      // ==================== FILES ====================
      case 'upload_file': {
        const { token, fileName, fileBase64, fileType, folder } = data;

        // Generate unique file path
        const timestamp = Date.now();
        const filePath = `builder-projects/${projectId}/${folder || 'uploads'}/${timestamp}-${fileName}`;

        // Decode base64 and upload
        const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
        
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, fileData, {
            contentType: fileType || 'application/octet-stream',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return new Response(
            JSON.stringify({ error: 'Failed to upload file' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        // Get user ID if authenticated
        let uploadedBy = null;
        if (token) {
          const { data: session } = await supabase
            .from('builder_app_sessions')
            .select('user_id')
            .eq('token', token)
            .single();
          if (session) uploadedBy = session.user_id;
        }

        // Save file record
        const { data: fileRecord, error: recordError } = await supabase
          .from('builder_app_files')
          .insert({
            builder_project_id: projectId,
            file_name: fileName,
            file_url: urlData.publicUrl,
            file_type: fileType,
            file_size: fileData.length,
            uploaded_by: uploadedBy,
            folder: folder || 'uploads',
          })
          .select()
          .single();

        if (recordError) {
          console.error('File record error:', recordError);
        }

        result = {
          url: urlData.publicUrl,
          file: fileRecord,
        };
        break;
      }

      case 'get_files': {
        const { folder, limit = 50 } = data || {};

        let query = supabase
          .from('builder_app_files')
          .select('*')
          .eq('builder_project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (folder) {
          query = query.eq('folder', folder);
        }

        const { data: files, error } = await query;

        if (error) {
          console.error('Get files error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get files' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = files;
        break;
      }

      // ==================== SETTINGS ====================
      case 'get_settings': {
        const { data: settings, error } = await supabase
          .from('builder_app_settings')
          .select('*')
          .eq('builder_project_id', projectId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Get settings error:', error);
        }

        result = settings || {
          site_name: project.title,
          primary_color: '#6366f1',
          features: { auth: true, comments: true, likes: true, files: true },
        };
        break;
      }

      case 'update_settings': {
        const { settings } = data;

        const { data: updated, error } = await supabase
          .from('builder_app_settings')
          .upsert({
            builder_project_id: projectId,
            ...settings,
          })
          .select()
          .single();

        if (error) {
          console.error('Update settings error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update settings' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = updated;
        break;
      }

      // ==================== STATS ====================
      case 'get_stats': {
        const [usersResult, contentResult, commentsResult, filesResult] = await Promise.all([
          supabase.from('builder_app_users').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
          supabase.from('builder_app_content').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
          supabase.from('builder_app_comments').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
          supabase.from('builder_app_files').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
        ]);

        result = {
          users: usersResult.count || 0,
          content: contentResult.count || 0,
          comments: commentsResult.count || 0,
          files: filesResult.count || 0,
        };
        break;
      }

      // ==================== USERS MANAGEMENT ====================
      case 'get_users': {
        const { limit = 50, offset = 0 } = data || {};

        const { data: users, error } = await supabase
          .from('builder_app_users')
          .select('id, email, full_name, role, avatar_url, last_login, created_at')
          .eq('builder_project_id', projectId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Get users error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get users' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = users;
        break;
      }

      case 'update_user_role': {
        const { userId, role } = data;

        const { data: updated, error } = await supabase
          .from('builder_app_users')
          .update({ role })
          .eq('id', userId)
          .eq('builder_project_id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Update user role error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update user role' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = updated;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Builder API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
