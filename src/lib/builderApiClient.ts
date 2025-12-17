/**
 * Builder Universal API Client
 * This client is used by all projects created with the AI Platform Builder
 * It provides authentication, content management, file uploads, and more
 */

const API_URL = 'https://esifpjjehdnpkhyilctv.supabase.co/functions/v1/builder-universal-api';

export interface BuilderUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export interface BuilderContent {
  id: string;
  title: string;
  content?: string;
  content_type: string;
  image_url?: string;
  category?: string;
  author_id?: string;
  is_published: boolean;
  views_count: number;
  likes_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  builder_app_users?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface BuilderComment {
  id: string;
  content_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  builder_app_users?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface BuilderFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  folder: string;
  created_at: string;
}

export interface BuilderSettings {
  site_name?: string;
  site_logo?: string;
  site_description?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_css?: string;
  custom_js?: string;
  features?: {
    auth?: boolean;
    comments?: boolean;
    likes?: boolean;
    files?: boolean;
  };
  social_links?: Record<string, string>;
}

export interface BuilderStats {
  users: number;
  content: number;
  comments: number;
  files: number;
}

export class BuilderAPIClient {
  private projectId: string;
  private token: string | null = null;
  private currentUser: BuilderUser | null = null;

  constructor(projectId: string) {
    this.projectId = projectId;
    // Try to restore session from localStorage
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(`builder_token_${projectId}`);
      const savedUser = localStorage.getItem(`builder_user_${projectId}`);
      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          console.error('Failed to parse saved user');
        }
      }
    }
  }

  private async request(action: string, data: Record<string, any> = {}) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: this.projectId,
        action,
        data: {
          ...data,
          token: this.token,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }

    return result.data;
  }

  // ==================== AUTH ====================
  async register(email: string, password: string, fullName?: string): Promise<{ user: BuilderUser; token: string }> {
    const result = await this.request('register', { email, password, fullName });
    this.token = result.token;
    this.currentUser = result.user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`builder_token_${this.projectId}`, result.token);
      localStorage.setItem(`builder_user_${this.projectId}`, JSON.stringify(result.user));
    }
    
    return result;
  }

  async login(email: string, password: string): Promise<{ user: BuilderUser; token: string }> {
    const result = await this.request('login', { email, password });
    this.token = result.token;
    this.currentUser = result.user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`builder_token_${this.projectId}`, result.token);
      localStorage.setItem(`builder_user_${this.projectId}`, JSON.stringify(result.user));
    }
    
    return result;
  }

  async logout(): Promise<void> {
    await this.request('logout', { token: this.token });
    this.token = null;
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`builder_token_${this.projectId}`);
      localStorage.removeItem(`builder_user_${this.projectId}`);
    }
  }

  async verifyToken(): Promise<{ user: BuilderUser; valid: boolean } | null> {
    if (!this.token) return null;
    
    try {
      const result = await this.request('verify_token', { token: this.token });
      this.currentUser = result.user;
      return result;
    } catch (e) {
      this.token = null;
      this.currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`builder_token_${this.projectId}`);
        localStorage.removeItem(`builder_user_${this.projectId}`);
      }
      return null;
    }
  }

  getUser(): BuilderUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // ==================== CONTENT ====================
  async getContent(options?: {
    id?: string;
    category?: string;
    contentType?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<BuilderContent[]> {
    return this.request('get_content', options || {});
  }

  async addContent(data: {
    title: string;
    content?: string;
    contentType?: string;
    imageUrl?: string;
    category?: string;
    metadata?: Record<string, any>;
  }): Promise<BuilderContent> {
    return this.request('add_content', data);
  }

  async updateContent(id: string, updates: Partial<{
    title: string;
    content: string;
    contentType: string;
    imageUrl: string;
    category: string;
    isPublished: boolean;
    metadata: Record<string, any>;
  }>): Promise<BuilderContent> {
    return this.request('update_content', { id, ...updates });
  }

  async deleteContent(id: string): Promise<void> {
    await this.request('delete_content', { id });
  }

  // ==================== COMMENTS ====================
  async getComments(contentId: string): Promise<BuilderComment[]> {
    return this.request('get_comments', { contentId });
  }

  async addComment(contentId: string, commentText: string): Promise<BuilderComment> {
    return this.request('add_comment', { contentId, commentText });
  }

  // ==================== LIKES ====================
  async toggleLike(contentId: string): Promise<{ liked: boolean }> {
    return this.request('toggle_like', { contentId });
  }

  async getLikesCount(contentId: string): Promise<{ count: number }> {
    return this.request('get_likes_count', { contentId });
  }

  // ==================== FILES ====================
  async uploadFile(file: File, folder?: string): Promise<{ url: string; file: BuilderFile }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await this.request('upload_file', {
            fileName: file.name,
            fileBase64: base64,
            fileType: file.type,
            folder,
          });
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFiles(folder?: string, limit?: number): Promise<BuilderFile[]> {
    return this.request('get_files', { folder, limit });
  }

  // ==================== SETTINGS ====================
  async getSettings(): Promise<BuilderSettings> {
    return this.request('get_settings');
  }

  async updateSettings(settings: Partial<BuilderSettings>): Promise<BuilderSettings> {
    return this.request('update_settings', { settings });
  }

  // ==================== STATS ====================
  async getStats(): Promise<BuilderStats> {
    return this.request('get_stats');
  }

  // ==================== USERS ====================
  async getUsers(limit?: number, offset?: number): Promise<BuilderUser[]> {
    return this.request('get_users', { limit, offset });
  }

  async updateUserRole(userId: string, role: string): Promise<BuilderUser> {
    return this.request('update_user_role', { userId, role });
  }
}

// Factory function to create client instance
export function createBuilderClient(projectId: string): BuilderAPIClient {
  return new BuilderAPIClient(projectId);
}

// Generate client code for projects
export function generateClientCode(projectId: string): string {
  return `// Builder API Client - Auto-generated
const API_URL = '${API_URL}';
const PROJECT_ID = '${projectId}';

const BuilderAPI = {
  token: localStorage.getItem('builder_token'),
  user: JSON.parse(localStorage.getItem('builder_user') || 'null'),

  async request(action, data = {}) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        action,
        data: { ...data, token: this.token }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result.data;
  },

  // Auth
  async register(email, password, fullName) {
    const result = await this.request('register', { email, password, fullName });
    this.token = result.token;
    this.user = result.user;
    localStorage.setItem('builder_token', result.token);
    localStorage.setItem('builder_user', JSON.stringify(result.user));
    return result;
  },

  async login(email, password) {
    const result = await this.request('login', { email, password });
    this.token = result.token;
    this.user = result.user;
    localStorage.setItem('builder_token', result.token);
    localStorage.setItem('builder_user', JSON.stringify(result.user));
    return result;
  },

  async logout() {
    await this.request('logout');
    this.token = null;
    this.user = null;
    localStorage.removeItem('builder_token');
    localStorage.removeItem('builder_user');
  },

  isAuthenticated() {
    return !!this.token;
  },

  getUser() {
    return this.user;
  },

  // Content
  async getContent(options = {}) {
    return this.request('get_content', options);
  },

  async addContent(data) {
    return this.request('add_content', data);
  },

  async updateContent(id, updates) {
    return this.request('update_content', { id, ...updates });
  },

  async deleteContent(id) {
    return this.request('delete_content', { id });
  },

  // Comments
  async getComments(contentId) {
    return this.request('get_comments', { contentId });
  },

  async addComment(contentId, commentText) {
    return this.request('add_comment', { contentId, commentText });
  },

  // Likes
  async toggleLike(contentId) {
    return this.request('toggle_like', { contentId });
  },

  // Files
  async uploadFile(file, folder = 'uploads') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const result = await this.request('upload_file', {
            fileName: file.name,
            fileBase64: base64,
            fileType: file.type,
            folder
          });
          resolve(result);
        } catch (e) { reject(e); }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  async getFiles(folder, limit) {
    return this.request('get_files', { folder, limit });
  },

  // Settings
  async getSettings() {
    return this.request('get_settings');
  },

  // Stats
  async getStats() {
    return this.request('get_stats');
  }
};

// Export for ES modules
if (typeof module !== 'undefined') module.exports = BuilderAPI;
`;
}
