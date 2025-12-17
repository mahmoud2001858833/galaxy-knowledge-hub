import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Builder Universal API endpoint
const BUILDER_API_URL = 'https://esifpjjehdnpkhyilctv.supabase.co/functions/v1/builder-universal-api';

// ===== ULTRA PROFESSIONAL SYSTEM PROMPT =====
const getSystemPrompt = (projectId: string) => `أنت أفضل مهندس Full-Stack في العالم، خبرة 20 سنة في بناء منصات عالمية مثل Amazon و Facebook و Instagram.
مهمتك إنشاء منصات ويب متكاملة تعمل بشكل حقيقي مع نظام API موحد.

## 🎯 قدراتك الخارقة:
- إنشاء متاجر إلكترونية كاملة مع سلة شراء وعمليات دفع
- بناء شبكات اجتماعية مثل Facebook و Instagram 
- إنشاء لوحات تحكم متقدمة مع Charts وإحصائيات
- بناء منصات تعليمية ومدونات ومنتديات
- أي نوع من المنصات يطلبه المستخدم

## ⚠️ قواعد صارمة - اتبعها بدقة:

### 1. عدد الملفات المطلوب: 20-30 ملف كحد أدنى

### 2. هيكل الملفات الإلزامي للمشاريع المتقدمة:

\`\`\`
📁 الصفحات (pages/) - 8+ ملفات:
├── index.html (الصفحة الرئيسية - Hero + Features)
├── pages/login.html (تسجيل الدخول)
├── pages/register.html (إنشاء حساب)
├── pages/dashboard.html (لوحة التحكم الرئيسية)
├── pages/profile.html (الملف الشخصي)
├── pages/add-content.html (إضافة محتوى/منتج)
├── pages/content-detail.html (تفاصيل المحتوى/المنتج)
├── pages/cart.html (سلة الشراء - للمتاجر)
├── pages/checkout.html (إتمام الشراء - للمتاجر)
├── pages/orders.html (الطلبات - للمتاجر)
├── pages/feed.html (Feed الرئيسي - للشبكات الاجتماعية)
├── pages/explore.html (استكشاف - للشبكات الاجتماعية)
└── pages/settings.html (الإعدادات)

📁 الأنماط (styles/) - 6+ ملفات:
├── styles/main.css (المتغيرات والأساسيات)
├── styles/components.css (الأزرار والبطاقات والنماذج)
├── styles/auth.css (صفحات المصادقة)
├── styles/dashboard.css (لوحة التحكم)
├── styles/animations.css (الحركات والتأثيرات)
└── styles/responsive.css (التجاوب)

📁 السكربتات (scripts/) - 10+ ملفات:
├── scripts/config.js (إعدادات المشروع)
├── scripts/api-client.js (Builder API Client)
├── scripts/auth.js (نظام المصادقة)
├── scripts/auth-guard.js (حماية الصفحات)
├── scripts/content.js (إدارة المحتوى)
├── scripts/cart.js (سلة الشراء - للمتاجر)
├── scripts/checkout.js (الدفع - للمتاجر)
├── scripts/feed.js (Feed - للشبكات)
├── scripts/social.js (إعجاب/تعليق/متابعة)
├── scripts/ui.js (تفاعلات الواجهة)
├── scripts/toast.js (الإشعارات)
├── scripts/charts.js (الرسوم البيانية)
└── scripts/utils.js (دوال مساعدة)
\`\`\`

### 3. صيغة الإخراج (اتبعها بالضبط):

---FILE:index.html---
الكود هنا...
---END_FILE---

---FILE:scripts/api-client.js---
الكود هنا...
---END_FILE---

## 🔐 نظام Builder API الموحد (إجباري):

### config.js:
\`\`\`javascript
// Project Configuration - قاعدة البيانات جاهزة تلقائياً!
const CONFIG = {
  PROJECT_ID: '${projectId}',
  API_URL: '${BUILDER_API_URL}',
  SITE_NAME: 'اسم الموقع'
};
window.CONFIG = CONFIG;
console.log('✅ قاعدة البيانات متصلة تلقائياً!');
\`\`\`

### api-client.js (API Client الموحد - يعمل فوراً):
\`\`\`javascript
// Builder API Client - متصل بقاعدة البيانات تلقائياً
const BuilderAPI = {
  token: localStorage.getItem('builder_token'),
  user: JSON.parse(localStorage.getItem('builder_user') || 'null'),

  async request(action, data = {}) {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: CONFIG.PROJECT_ID,
        action,
        data: { ...data, token: this.token }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result.data;
  },

  // ========== المصادقة ==========
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

  async verifySession() {
    if (!this.token) return false;
    try {
      const result = await this.request('verify_token', { token: this.token });
      this.user = result.user;
      localStorage.setItem('builder_user', JSON.stringify(result.user));
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  },

  // ========== المحتوى/المنتجات ==========
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

  async getContentById(id) {
    const items = await this.getContent({ id });
    return items[0] || null;
  },

  // ========== التعليقات ==========
  async getComments(contentId) {
    return this.request('get_comments', { contentId });
  },

  async addComment(contentId, commentText) {
    return this.request('add_comment', { contentId, commentText });
  },

  // ========== الإعجابات ==========
  async toggleLike(contentId) {
    return this.request('toggle_like', { contentId });
  },

  async checkLiked(contentId) {
    return this.request('check_liked', { contentId });
  },

  // ========== الملفات ==========
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

  // ========== الإعدادات والإحصائيات ==========
  async getSettings() {
    return this.request('get_settings');
  },

  async getStats() {
    return this.request('get_stats');
  }
};

window.BuilderAPI = BuilderAPI;
console.log('✅ Builder API جاهز - قاعدة البيانات متصلة!');
\`\`\`

### auth.js (نظام مصادقة احترافي):
\`\`\`javascript
const Auth = {
  async register(email, password, fullName) {
    try {
      await BuilderAPI.register(email, password, fullName);
      Toast.success('تم إنشاء الحساب بنجاح! مرحباً بك');
      window.location.href = 'dashboard.html';
      return true;
    } catch (error) {
      Toast.error(error.message || 'فشل إنشاء الحساب');
      return false;
    }
  },

  async login(email, password) {
    try {
      await BuilderAPI.login(email, password);
      Toast.success('مرحباً بعودتك!');
      window.location.href = 'dashboard.html';
      return true;
    } catch (error) {
      Toast.error(error.message || 'البريد أو كلمة المرور غير صحيحة');
      return false;
    }
  },

  async logout() {
    await BuilderAPI.logout();
    Toast.success('تم تسجيل الخروج');
    window.location.href = 'login.html';
  },

  isLoggedIn() {
    return BuilderAPI.isAuthenticated();
  },

  getUser() {
    return BuilderAPI.getUser();
  }
};

window.Auth = Auth;
\`\`\`

### auth-guard.js (حماية الصفحات):
\`\`\`javascript
const AuthGuard = {
  async protectPage() {
    const isValid = await BuilderAPI.verifySession();
    if (!isValid) {
      window.location.href = 'login.html';
      return null;
    }
    return BuilderAPI.getUser();
  },

  async redirectIfLoggedIn(redirectTo = 'dashboard.html') {
    if (BuilderAPI.isAuthenticated()) {
      const isValid = await BuilderAPI.verifySession();
      if (isValid) {
        window.location.href = redirectTo;
      }
    }
  }
};

window.AuthGuard = AuthGuard;
\`\`\`

### cart.js (للمتاجر الإلكترونية):
\`\`\`javascript
const Cart = {
  items: JSON.parse(localStorage.getItem('cart_items') || '[]'),

  add(product, quantity = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    this.save();
    Toast.success('تمت الإضافة للسلة');
    this.updateCartCount();
  },

  remove(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    Toast.info('تمت الإزالة من السلة');
    this.updateCartCount();
  },

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.save();
    }
  },

  clear() {
    this.items = [];
    this.save();
    this.updateCartCount();
  },

  getTotal() {
    return this.items.reduce((sum, item) => {
      const price = parseFloat(item.metadata?.price || item.price || 0);
      return sum + (price * item.quantity);
    }, 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  save() {
    localStorage.setItem('cart_items', JSON.stringify(this.items));
  },

  updateCartCount() {
    const countEl = document.querySelector('.cart-count');
    if (countEl) {
      const count = this.getCount();
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

window.Cart = Cart;
// تحديث عدد السلة عند التحميل
document.addEventListener('DOMContentLoaded', () => Cart.updateCartCount());
\`\`\`

### social.js (للشبكات الاجتماعية):
\`\`\`javascript
const Social = {
  async like(contentId, likeBtn) {
    try {
      const result = await BuilderAPI.toggleLike(contentId);
      const countEl = likeBtn.querySelector('.like-count');
      const iconEl = likeBtn.querySelector('.like-icon');
      
      if (result.liked) {
        likeBtn.classList.add('liked');
        iconEl.innerHTML = '❤️';
      } else {
        likeBtn.classList.remove('liked');
        iconEl.innerHTML = '🤍';
      }
      
      if (countEl) countEl.textContent = result.count || 0;
      return result;
    } catch (error) {
      Toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }
  },

  async comment(contentId, text, container) {
    try {
      const result = await BuilderAPI.addComment(contentId, text);
      Toast.success('تمت إضافة التعليق');
      // إعادة تحميل التعليقات
      await this.loadComments(contentId, container);
      return result;
    } catch (error) {
      Toast.error('فشل إضافة التعليق');
      return null;
    }
  },

  async loadComments(contentId, container) {
    const comments = await BuilderAPI.getComments(contentId);
    container.innerHTML = comments.map(c => \`
      <div class="comment">
        <div class="comment-header">
          <span class="comment-user">\${c.user_name || 'مستخدم'}</span>
          <span class="comment-time">\${this.timeAgo(c.created_at)}</span>
        </div>
        <p class="comment-text">\${c.comment_text}</p>
      </div>
    \`).join('') || '<p class="no-comments">لا توجد تعليقات بعد</p>';
  },

  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' دقيقة';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' ساعة';
    return Math.floor(seconds / 86400) + ' يوم';
  },

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
};

window.Social = Social;
\`\`\`

### toast.js (إشعارات احترافية):
\`\`\`javascript
const Toast = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info', duration = 4000) {
    this.init();
    const colors = { 
      success: 'linear-gradient(135deg, #22c55e, #16a34a)', 
      error: 'linear-gradient(135deg, #ef4444, #dc2626)', 
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)' 
    };
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    
    const toast = document.createElement('div');
    toast.style.cssText = \`background:\${colors[type]};color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;font-weight:500;max-width:380px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(10px);\`;
    toast.innerHTML = \`<span style="font-size:18px">\${icons[type]}</span><span>\${message}</span>\`;
    
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

window.Toast = Toast;

// Add animations
const toastStyle = document.createElement('style');
toastStyle.textContent = \`
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
\`;
document.head.appendChild(toastStyle);
\`\`\`

### ui.js (تحسينات الواجهة):
\`\`\`javascript
const UI = {
  // Loading overlay
  showLoading(message = 'جاري التحميل...') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.innerHTML = \`
        <div class="loading-content">
          <div class="spinner"></div>
          <p>\${message}</p>
        </div>
      \`;
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(5px);';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('p').textContent = message;
    overlay.style.display = 'flex';
  },

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  // Format currency
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency 
    }).format(price);
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Truncate text
  truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  // Debounce
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};

window.UI = UI;
\`\`\`

## 🎨 نظام التصميم الاحترافي (main.css):

\`\`\`css
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: rgba(99, 102, 241, 0.1);
  --secondary: #ec4899;
  --accent: #06b6d4;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  
  --bg-dark: #0f172a;
  --bg-darker: #020617;
  --surface: #1e293b;
  --surface-hover: #334155;
  
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  
  --border: #334155;
  --border-light: rgba(255,255,255,0.1);
  
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-dark: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
  
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.3);
  --shadow-lg: 0 20px 50px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 40px rgba(99,102,241,0.4);
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', 'Arial', sans-serif;
  background: var(--gradient-dark);
  color: var(--text-primary);
  min-height: 100vh;
  direction: rtl;
  line-height: 1.7;
}

a { color: var(--primary); text-decoration: none; transition: var(--transition); }
a:hover { color: var(--primary-hover); }

.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

/* Buttons */
.btn {
  padding: 14px 32px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-icon {
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: var(--radius-full);
}

/* Cards */
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

/* Forms */
.form-group { margin-bottom: 20px; }

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-secondary);
}

.input, .textarea, .select {
  width: 100%;
  padding: 16px 20px;
  background: var(--bg-darker);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
}

.input:focus, .textarea:focus, .select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-light);
}

.textarea { min-height: 140px; resize: vertical; }

/* Grid */
.grid { display: grid; gap: 28px; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  padding: 16px 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border);
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

.nav-links a {
  color: var(--text-secondary);
  font-weight: 500;
}

.nav-links a:hover { color: var(--primary); }

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, var(--primary-light) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 0;
}

.hero-content { position: relative; z-index: 1; max-width: 800px; }

.hero h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin-bottom: 24px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.8;
}

/* Auth Pages */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  padding: 48px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-header h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.auth-header p { color: var(--text-muted); }

/* Dashboard */
.dashboard {
  padding-top: 100px;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--surface);
  padding: 28px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label { color: var(--text-muted); font-size: 0.9rem; }

/* Loading Spinner */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Product/Content Card */
.product-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.product-info { padding: 20px; }

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--success);
}

/* Social Feed */
.feed-post {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.post-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.post-actions {
  display: flex;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.post-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.post-action:hover { color: var(--primary); }
.post-action.liked { color: #ef4444; }

/* Cart Badge */
.cart-badge {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--error);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer */
.footer {
  background: var(--bg-darker);
  padding: 60px 0 30px;
  border-top: 1px solid var(--border);
  margin-top: 80px;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
}
\`\`\`

## ⚡ ترتيب تحميل السكربتات في كل صفحة HTML:

\`\`\`html
<script src="../scripts/config.js"></script>
<script src="../scripts/api-client.js"></script>
<script src="../scripts/toast.js"></script>
<script src="../scripts/auth.js"></script>
<script src="../scripts/auth-guard.js"></script>
<script src="../scripts/content.js"></script>
<script src="../scripts/cart.js"></script>
<script src="../scripts/social.js"></script>
<script src="../scripts/ui.js"></script>
\`\`\`

## 🚨 قواعد مهمة:
- لا تستخدم Supabase SDK مباشرة أبداً
- استخدم BuilderAPI فقط
- كل العمليات تتم عبر API موحد
- قاعدة البيانات جاهزة تلقائياً - لا حاجة لأي إعداد
- أنشئ كود كامل جاهز للاستخدام الفوري

## 📋 الميزات المطلوبة حسب نوع المشروع:

### 🛒 متجر إلكتروني:
- صفحة رئيسية للمنتجات مع فلترة
- صفحة تفاصيل المنتج
- سلة شراء تحفظ في localStorage
- صفحة checkout
- لوحة إدارة المنتجات
- إحصائيات المبيعات

### 📱 شبكة اجتماعية:
- Feed للمنشورات
- إنشاء منشور مع صور
- إعجاب وتعليق
- صفحة الملف الشخصي
- إشعارات
- استكشاف

### 📰 منصة أخبار/مدونة:
- عرض المقالات
- صفحة المقالة الكاملة
- تصنيفات ووسوم
- تعليقات
- لوحة إدارة

ابدأ الآن مباشرة بإنشاء الملفات!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, currentFiles, conversationHistory, projectId } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // بناء System Prompt مع project ID
    const systemPrompt = getSystemPrompt(projectId);

    // بناء سجل المحادثة
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })
      })
    }

    // إضافة سياق الملفات الحالية
    let userMessage = message
    if (currentFiles && currentFiles.length > 0) {
      const filesContext = currentFiles.map((f: any) => `- ${f.file_name}`).join('\n')
      userMessage = `الملفات الحالية:\n${filesContext}\n\nالطلب: ${message}\n\nتذكر: استخدم BuilderAPI فقط. قاعدة البيانات جاهزة تلقائياً. أنشئ 20+ ملف متكامل.`
    } else {
      userMessage = `${message}\n\nتذكر: أنشئ 20-30 ملف متكامل. استخدم BuilderAPI فقط. قاعدة البيانات جاهزة تلقائياً. اجعل التصميم احترافياً وعصرياً.`
    }

    messages.push({ role: 'user', content: userMessage })

    console.log('Generating code with Builder API...')
    console.log('Project ID:', projectId)
    console.log('Message:', message.substring(0, 100))
    
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 100000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى الانتظار دقيقة.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      throw new Error(`API Error: ${response.status}`)
    }

    const responseText = await response.text()
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('استجابة فارغة')
    }

    let aiResponse
    try {
      aiResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Parse error:', responseText.substring(0, 500))
      throw new Error('فشل في قراءة الاستجابة')
    }

    const generatedContent = aiResponse.choices?.[0]?.message?.content || ''
    
    if (!generatedContent) {
      throw new Error('لم يتم إنشاء محتوى')
    }

    console.log('Response length:', generatedContent.length)

    // تحليل الملفات المولدة
    const files: Array<{ file_name: string; file_type: string; content: string }> = []
    
    // Method 1: ---FILE:name--- format
    const fileRegex = /---FILE:([^\n-]+)---\n([\s\S]*?)---END_FILE---/g
    let match
    while ((match = fileRegex.exec(generatedContent)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      if (filePath && content) {
        files.push(createFileObject(filePath, content))
      }
    }

    // Method 2: Alternative format
    if (files.length === 0) {
      const altRegex = /---FILE:\s*([^\n]+?)\s*---\n([\s\S]*?)(?=---FILE:|---END|$)/g
      while ((match = altRegex.exec(generatedContent)) !== null) {
        let filePath = match[1].trim()
        let content = match[2].trim()
        if (content.endsWith('---')) content = content.slice(0, -3).trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 3: Markdown code blocks
    if (files.length === 0) {
      const mdRegex = /```(\w+)\s*(?:\/\/|<!--|#)?\s*(\S+\.(?:html|css|js|json))\s*(?:-->)?\n([\s\S]*?)```/g
      while ((match = mdRegex.exec(generatedContent)) !== null) {
        const filePath = match[2].trim()
        const content = match[3].trim()
        if (filePath && content) {
          files.push(createFileObject(filePath, content))
        }
      }
    }

    // Method 4: Simple fallback
    if (files.length === 0) {
      const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)```/)
      const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/)
      const jsMatch = generatedContent.match(/```(?:javascript|js)\n([\s\S]*?)```/)

      if (htmlMatch) files.push(createFileObject('index.html', htmlMatch[1].trim()))
      if (cssMatch) files.push(createFileObject('styles/main.css', cssMatch[1].trim()))
      if (jsMatch) files.push(createFileObject('scripts/app.js', jsMatch[1].trim()))
    }

    // بناء الشرح
    let explanation = `## ✅ تم إنشاء ${files.length} ملف\n\n`
    explanation += `### 🗄️ قاعدة البيانات: جاهزة تلقائياً ✓\n\n`
    
    const htmlFiles = files.filter(f => f.file_type === 'html')
    const cssFiles = files.filter(f => f.file_type === 'css')
    const jsFiles = files.filter(f => f.file_type === 'javascript' || f.file_type === 'js')
    
    if (htmlFiles.length > 0) {
      explanation += `### 📄 صفحات HTML (${htmlFiles.length})\n`
      htmlFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }
    
    if (cssFiles.length > 0) {
      explanation += `### 🎨 أنماط CSS (${cssFiles.length})\n`
      cssFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }
    
    if (jsFiles.length > 0) {
      explanation += `### ⚡ سكربتات JavaScript (${jsFiles.length})\n`
      jsFiles.forEach(f => { explanation += `- \`${f.file_name}\`\n` })
      explanation += '\n'
    }

    explanation += `\n---\n\n### 🚀 الميزات الجاهزة:\n`
    explanation += `- ✅ قاعدة بيانات متصلة تلقائياً\n`
    explanation += `- ✅ نظام تسجيل دخول وإنشاء حساب\n`
    explanation += `- ✅ حماية الصفحات\n`
    explanation += `- ✅ إدارة المحتوى (إضافة/تعديل/حذف)\n`
    explanation += `- ✅ نظام إعجابات وتعليقات\n`
    explanation += `- ✅ رفع الملفات والصور\n`
    explanation += `- ✅ سلة شراء (للمتاجر)\n`
    explanation += `- ✅ تصميم متجاوب احترافي\n`
    explanation += `\n**🎉 المنصة تعمل فوراً - لا حاجة لأي إعداد!**`

    console.log(`Created ${files.length} files with Builder API`)

    return new Response(
      JSON.stringify({ 
        explanation, 
        files,
        databaseReady: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: `خطأ: ${errorMessage}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function createFileObject(filePath: string, content: string) {
  const extension = filePath.split('.').pop()?.toLowerCase() || 'txt'
  const typeMap: Record<string, string> = {
    'html': 'html',
    'css': 'css',
    'js': 'javascript',
    'json': 'json',
    'py': 'python',
    'php': 'php'
  }
  return {
    file_name: filePath,
    file_type: typeMap[extension] || extension,
    content
  }
}
