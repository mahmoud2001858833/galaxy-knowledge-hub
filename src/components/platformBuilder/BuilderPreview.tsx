import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Terminal, X } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectFile {
  file_name: string;
  content: string;
  file_type: string;
}

interface BuilderPreviewProps {
  files: ProjectFile[];
  isPublished: boolean;
  publishUrl?: string;
}

export const BuilderPreview = ({ files, isPublished, publishUrl }: BuilderPreviewProps) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Supabase credentials for preview
  const SUPABASE_URL = 'https://esifpjjehdnpkhyilctv.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k';

  const generateSampleDataScript = () => {
    // إضافة بيانات تجريبية للمعاينة
    return `
// بيانات تجريبية للمعاينة - يتم تحميلها تلقائياً
window.SAMPLE_DATA = {
  products: [
    { id: '1', title: 'هاتف ذكي', price: 999, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', category: 'إلكترونيات', description: 'هاتف ذكي بمواصفات عالية', metadata: { price: 999 } },
    { id: '2', title: 'لابتوب', price: 1999, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', category: 'إلكترونيات', description: 'لابتوب للعمل والألعاب', metadata: { price: 1999 } },
    { id: '3', title: 'سماعات', price: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', category: 'إلكترونيات', description: 'سماعات لاسلكية', metadata: { price: 199 } },
    { id: '4', title: 'ساعة ذكية', price: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', category: 'إلكترونيات', description: 'ساعة ذكية رياضية', metadata: { price: 299 } },
    { id: '5', title: 'كاميرا', price: 799, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300', category: 'إلكترونيات', description: 'كاميرا احترافية', metadata: { price: 799 } },
    { id: '6', title: 'حقيبة', price: 89, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300', category: 'أزياء', description: 'حقيبة جلدية فاخرة', metadata: { price: 89 } },
  ],
  posts: [
    { id: '1', title: 'مرحباً بالعالم!', content: 'هذا أول منشور في منصتنا الجديدة. شاركونا آراءكم!', author: 'أحمد', likes_count: 42, comments: 5, image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', created_at: new Date().toISOString() },
    { id: '2', title: 'نصائح للمطورين', content: 'تعرف على أفضل ممارسات البرمجة وكيفية تحسين كودك', author: 'سارة', likes_count: 128, comments: 23, image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', created_at: new Date().toISOString() },
    { id: '3', title: 'أخبار التقنية', content: 'آخر التطورات في عالم التكنولوجيا والذكاء الاصطناعي', author: 'محمد', likes_count: 89, comments: 12, image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', created_at: new Date().toISOString() },
    { id: '4', title: 'تصميم واجهات المستخدم', content: 'كيف تصمم واجهات جذابة وسهلة الاستخدام', author: 'نورة', likes_count: 256, comments: 45, image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', created_at: new Date().toISOString() },
  ],
  users: [
    { id: '1', name: 'أحمد محمد', email: 'ahmad@example.com', avatar: 'https://i.pravatar.cc/100?img=1', role: 'admin' },
    { id: '2', name: 'سارة علي', email: 'sara@example.com', avatar: 'https://i.pravatar.cc/100?img=5', role: 'user' },
    { id: '3', name: 'محمد خالد', email: 'mohamed@example.com', avatar: 'https://i.pravatar.cc/100?img=3', role: 'user' },
  ]
};

// محاكاة BuilderAPI للمعاينة
window.BuilderAPI = {
  token: 'demo_token_' + Date.now(),
  user: window.SAMPLE_DATA.users[0],
  
  isAuthenticated() { return true; },
  getUser() { return this.user; },
  
  async getContent(options = {}) {
    await new Promise(r => setTimeout(r, 300)); // محاكاة تأخير الشبكة
    if (options.contentType === 'product') return window.SAMPLE_DATA.products;
    return window.SAMPLE_DATA.posts;
  },
  
  async addContent(data) {
    const newItem = { ...data, id: 'new_' + Date.now(), created_at: new Date().toISOString(), likes_count: 0 };
    if (data.contentType === 'product') window.SAMPLE_DATA.products.unshift(newItem);
    else window.SAMPLE_DATA.posts.unshift(newItem);
    return newItem;
  },
  
  async register(email, password, fullName) {
    const newUser = { id: 'user_' + Date.now(), name: fullName || email.split('@')[0], email, avatar: 'https://i.pravatar.cc/100', role: 'user' };
    this.user = newUser;
    this.token = 'token_' + Date.now();
    localStorage.setItem('builder_token', this.token);
    localStorage.setItem('builder_user', JSON.stringify(newUser));
    return { user: newUser, token: this.token };
  },
  
  async login(email, password) {
    const user = window.SAMPLE_DATA.users.find(u => u.email === email) || window.SAMPLE_DATA.users[0];
    this.user = user;
    this.token = 'token_' + Date.now();
    localStorage.setItem('builder_token', this.token);
    localStorage.setItem('builder_user', JSON.stringify(user));
    return { user, token: this.token };
  },
  
  async logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('builder_token');
    localStorage.removeItem('builder_user');
  },
  
  async verifySession() { return true; },
  
  async toggleLike(contentId) {
    const item = [...window.SAMPLE_DATA.posts, ...window.SAMPLE_DATA.products].find(i => i.id === contentId);
    if (item) item.likes_count = (item.likes_count || 0) + 1;
    return { liked: true, count: item?.likes_count || 1 };
  },
  
  async getComments(contentId) {
    return [
      { id: '1', comment_text: 'تعليق رائع! 👍', user_name: 'محمد', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', comment_text: 'شكراً على المشاركة 💖', user_name: 'سارة', created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: '3', comment_text: 'محتوى مفيد جداً', user_name: 'أحمد', created_at: new Date().toISOString() },
    ];
  },
  
  async addComment(contentId, text) {
    return { id: 'comment_' + Date.now(), comment_text: text, user_name: this.user?.name || 'أنت', created_at: new Date().toISOString() };
  },
  
  async getStats() {
    return { users: 156, content: 89, comments: 342, files: 45 };
  },

  async request(action, data) {
    return this[action] ? this[action](data) : null;
  }
};

// Cart للمتاجر
window.Cart = {
  items: JSON.parse(localStorage.getItem('cart_items') || '[]'),
  
  add(product, quantity = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) existing.quantity += quantity;
    else this.items.push({ ...product, quantity });
    this.save();
    this.updateUI();
    if (window.Toast) Toast.success('تمت الإضافة للسلة ✓');
  },
  
  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.updateUI();
    if (window.Toast) Toast.info('تمت الإزالة من السلة');
  },
  
  updateQuantity(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (item) item.quantity = Math.max(1, qty);
    this.save();
  },
  
  clear() {
    this.items = [];
    this.save();
    this.updateUI();
  },
  
  getTotal() {
    return this.items.reduce((sum, i) => sum + ((i.metadata?.price || i.price || 0) * i.quantity), 0);
  },
  
  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  },
  
  save() {
    localStorage.setItem('cart_items', JSON.stringify(this.items));
  },
  
  updateUI() {
    const countEl = document.querySelector('.cart-count');
    if (countEl) {
      countEl.textContent = this.getCount();
      countEl.style.display = this.getCount() > 0 ? 'flex' : 'none';
    }
  }
};

// Auth helper
window.Auth = {
  async register(email, password, fullName) {
    try {
      await BuilderAPI.register(email, password, fullName);
      Toast.success('تم إنشاء الحساب بنجاح!');
      return true;
    } catch (e) {
      Toast.error(e.message || 'فشل إنشاء الحساب');
      return false;
    }
  },
  async login(email, password) {
    try {
      await BuilderAPI.login(email, password);
      Toast.success('مرحباً بعودتك!');
      return true;
    } catch (e) {
      Toast.error('البريد أو كلمة المرور غير صحيحة');
      return false;
    }
  },
  async logout() {
    await BuilderAPI.logout();
    Toast.success('تم تسجيل الخروج');
  },
  isLoggedIn() { return BuilderAPI.isAuthenticated(); },
  getUser() { return BuilderAPI.getUser(); }
};

// AuthGuard
window.AuthGuard = {
  async protectPage() {
    return BuilderAPI.getUser();
  },
  async redirectIfLoggedIn() {}
};

// Social helper
window.Social = {
  async like(contentId, btn) {
    const result = await BuilderAPI.toggleLike(contentId);
    if (btn) {
      btn.classList.toggle('liked', result.liked);
      const countEl = btn.querySelector('.like-count');
      if (countEl) countEl.textContent = result.count;
    }
    return result;
  },
  async comment(contentId, text, container) {
    const comment = await BuilderAPI.addComment(contentId, text);
    Toast.success('تمت إضافة التعليق');
    return comment;
  },
  async loadComments(contentId, container) {
    const comments = await BuilderAPI.getComments(contentId);
    if (container) {
      container.innerHTML = comments.map(c => \`
        <div class="comment" style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <strong>\${c.user_name}</strong>
            <span style="opacity:0.6;font-size:12px;">\${this.timeAgo(c.created_at)}</span>
          </div>
          <p style="margin:0;">\${c.comment_text}</p>
        </div>
      \`).join('');
    }
    return comments;
  },
  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' د';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' س';
    return Math.floor(seconds / 86400) + ' ي';
  }
};

console.log('✅ بيانات المعاينة جاهزة');
console.log('📦 المنتجات:', window.SAMPLE_DATA.products.length);
console.log('📝 المنشورات:', window.SAMPLE_DATA.posts.length);
console.log('👥 المستخدمون:', window.SAMPLE_DATA.users.length);
`;
  };

  const generatePreviewHTML = () => {
    // جمع جميع ملفات HTML
    const htmlFiles = files.filter(f => f.file_type === 'html');
    const mainHtml = htmlFiles.find(f => 
      f.file_name === 'index.html' || 
      f.file_name.endsWith('/index.html')
    ) || htmlFiles[0];

    // جمع كل ملفات CSS
    const cssFiles = files.filter(f => 
      f.file_type === 'css' || 
      f.file_name.endsWith('.css')
    );
    const allCss = cssFiles.map(f => `/* ===== ${f.file_name} ===== */\n${f.content}`).join('\n\n');

    // جمع كل ملفات JS بالترتيب الصحيح
    const jsFiles = files.filter(f => 
      f.file_type === 'js' || 
      f.file_type === 'javascript' || 
      f.file_name.endsWith('.js')
    );
    
    // ترتيب الملفات: config أولاً، ثم supabase-client، ثم toast، ثم auth، الخ
    const sortOrder = ['config', 'supabase-client', 'toast', 'auth-guard', 'auth', 'storage', 'crud', 'ui', 'router', 'utils', 'app'];
    const sortedJsFiles = [...jsFiles].sort((a, b) => {
      const aName = a.file_name.replace(/.*\//, '').replace('.js', '');
      const bName = b.file_name.replace(/.*\//, '').replace('.js', '');
      const aIndex = sortOrder.findIndex(s => aName.includes(s));
      const bIndex = sortOrder.findIndex(s => bName.includes(s));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    const allJs = sortedJsFiles.map(f => `// ===== ${f.file_name} =====\n${f.content}`).join('\n\n');

    if (!mainHtml) {
      return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .container { text-align: center; padding: 2rem; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { color: white; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🚀</div>
    <h1>لم يتم إنشاء أي محتوى بعد</h1>
    <p>ابدأ بالتحدث مع المساعد لإنشاء مشروعك</p>
  </div>
</body>
</html>
      `;
    }

    // إضافة بيانات تجريبية للمعاينة
    const sampleDataScript = `
<script>
// بيانات تجريبية للمعاينة - يتم تحميلها تلقائياً
window.SAMPLE_DATA = {
  products: [
    { id: '1', title: 'هاتف ذكي', price: 999, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', category: 'إلكترونيات', description: 'هاتف ذكي بمواصفات عالية' },
    { id: '2', title: 'لابتوب', price: 1999, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', category: 'إلكترونيات', description: 'لابتوب للعمل والألعاب' },
    { id: '3', title: 'سماعات', price: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', category: 'إلكترونيات', description: 'سماعات لاسلكية' },
    { id: '4', title: 'ساعة ذكية', price: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', category: 'إلكترونيات', description: 'ساعة ذكية رياضية' },
  ],
  posts: [
    { id: '1', title: 'مرحباً بالعالم!', content: 'هذا أول منشور في منصتنا الجديدة', author: 'أحمد', likes: 42, comments: 5, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' },
    { id: '2', title: 'نصائح للمطورين', content: 'تعرف على أفضل ممارسات البرمجة', author: 'سارة', likes: 128, comments: 23, image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400' },
    { id: '3', title: 'أخبار التقنية', content: 'آخر التطورات في عالم التكنولوجيا', author: 'محمد', likes: 89, comments: 12, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400' },
  ],
  users: [
    { id: '1', name: 'أحمد محمد', email: 'ahmad@example.com', avatar: 'https://i.pravatar.cc/100?img=1', role: 'admin' },
    { id: '2', name: 'سارة علي', email: 'sara@example.com', avatar: 'https://i.pravatar.cc/100?img=2', role: 'user' },
    { id: '3', name: 'محمد خالد', email: 'mohamed@example.com', avatar: 'https://i.pravatar.cc/100?img=3', role: 'user' },
  ]
};

// محاكاة BuilderAPI للمعاينة
if (!window.BuilderAPI) {
  window.BuilderAPI = {
    token: 'demo_token',
    user: window.SAMPLE_DATA.users[0],
    isAuthenticated: () => true,
    getUser: () => window.SAMPLE_DATA.users[0],
    getContent: async (options) => {
      if (options?.contentType === 'product') return window.SAMPLE_DATA.products;
      return window.SAMPLE_DATA.posts;
    },
    addContent: async (data) => ({ ...data, id: Date.now().toString() }),
    register: async () => ({ user: window.SAMPLE_DATA.users[0], token: 'demo_token' }),
    login: async () => ({ user: window.SAMPLE_DATA.users[0], token: 'demo_token' }),
    logout: async () => {},
    verifySession: async () => true,
    toggleLike: async () => ({ liked: true, count: Math.floor(Math.random() * 100) }),
    getComments: async () => [
      { id: '1', comment_text: 'تعليق رائع!', user_name: 'محمد', created_at: new Date().toISOString() },
      { id: '2', comment_text: 'شكراً على المشاركة', user_name: 'سارة', created_at: new Date().toISOString() },
    ],
    addComment: async (contentId, text) => ({ id: Date.now(), comment_text: text, user_name: 'أنت', created_at: new Date().toISOString() }),
    getStats: async () => ({ users: 156, content: 89, comments: 342, files: 45 }),
  };
}

// Cart للمتاجر
if (!window.Cart) {
  window.Cart = {
    items: [],
    add(product) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) existing.quantity++;
      else this.items.push({ ...product, quantity: 1 });
      this.updateUI();
      if (window.Toast) Toast.success('تمت الإضافة للسلة');
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.updateUI();
    },
    getTotal() {
      return this.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    },
    getCount() {
      return this.items.reduce((sum, i) => sum + i.quantity, 0);
    },
    updateUI() {
      const countEl = document.querySelector('.cart-count');
      if (countEl) countEl.textContent = this.getCount();
    }
  };
}

console.log('✅ بيانات تجريبية جاهزة للمعاينة');
console.log('📦 المنتجات:', window.SAMPLE_DATA.products.length);
console.log('📝 المنشورات:', window.SAMPLE_DATA.posts.length);
</script>
`;

    return sampleDataScript;

    // Console override للتقاط الأخطاء
    const consoleOverride = `
<script>
  // Override console for debugging
  (function() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    function sendToParent(type, args) {
      try {
        window.parent.postMessage({
          type: 'console',
          logType: type,
          message: Array.from(args).map(a => {
            if (typeof a === 'object') return JSON.stringify(a, null, 2);
            return String(a);
          }).join(' ')
        }, '*');
      } catch (e) {}
    }
    
    console.log = function() { sendToParent('log', arguments); originalLog.apply(console, arguments); };
    console.error = function() { sendToParent('error', arguments); originalError.apply(console, arguments); };
    console.warn = function() { sendToParent('warn', arguments); originalWarn.apply(console, arguments); };
    
    window.onerror = function(msg, url, line, col, error) {
      sendToParent('error', ['Error: ' + msg + ' at line ' + line]);
      return false;
    };
  })();
</script>
`;

    // إذا كان HTML يحتوي على doctype كامل
    if (mainHtml.content.trim().toLowerCase().startsWith('<!doctype')) {
      let htmlContent = mainHtml.content;
      
      // إضافة Supabase SDK ومكتبات أخرى
      const headInjection = `
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.tailwindcss.com"></script>
${consoleOverride}
<style>
${allCss}
</style>
</head>`;
      htmlContent = htmlContent.replace('</head>', headInjection);
      
      // إضافة JS مع معالجة الأخطاء
      const jsInjection = `
<script>
// Sample Data for Preview
${generateSampleDataScript()}
</script>
<script>
// Supabase initialization
const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_KEY = '${SUPABASE_KEY}';

try {
  if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase initialized');
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

// Page navigation helper
window.navigateTo = function(page) {
  console.log('Navigating to:', page);
  // في Preview، نعرض رسالة لأن التنقل الفعلي غير متاح
  if (typeof Toast !== 'undefined') {
    Toast.info('في المعاينة: التنقل إلى ' + page);
  } else {
    alert('سيتم التنقل إلى: ' + page);
  }
};

// Wait for DOM then run scripts
document.addEventListener('DOMContentLoaded', function() {
  try {
${allJs}
    console.log('✅ All scripts loaded');
  } catch (error) {
    console.error('Script error:', error.message);
  }
});
</script>
</body>`;
      htmlContent = htmlContent.replace('</body>', jsInjection);
      
      return htmlContent;
    }

    // إنشاء HTML كامل من الصفر
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة المشروع</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  ${consoleOverride}
  <script>
  // Sample Data for Preview
  ${generateSampleDataScript()}
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      direction: rtl;
      min-height: 100vh;
    }
    ${allCss}
  </style>
</head>
<body>
  ${mainHtml.content}
  
  <script>
    // Supabase initialization
    const SUPABASE_URL = '${SUPABASE_URL}';
    const SUPABASE_KEY = '${SUPABASE_KEY}';
    
    try {
      if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialized');
      }
    } catch (e) {
      console.error('Supabase init error:', e);
    }
    
    // Page navigation helper
    window.navigateTo = function(page) {
      console.log('Navigating to:', page);
      if (typeof Toast !== 'undefined') {
        Toast.info('في المعاينة: التنقل إلى ' + page);
      }
    };
    
    // Run all scripts
    document.addEventListener('DOMContentLoaded', function() {
      try {
${allJs}
        console.log('✅ All scripts loaded');
      } catch (error) {
        console.error('Script error:', error.message);
      }
    });
  </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [files]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setConsoleLogs(prev => [...prev.slice(-49), {
          type: event.data.logType,
          message: event.data.message
        }]);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const viewModes = [
    { mode: 'desktop' as const, icon: Monitor, width: '100%', label: 'سطح المكتب' },
    { mode: 'tablet' as const, icon: Tablet, width: '768px', label: 'تابلت' },
    { mode: 'mobile' as const, icon: Smartphone, width: '375px', label: 'موبايل' },
  ];

  const handleRefresh = () => {
    setConsoleLogs([]);
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showConsole ? "default" : "outline"}
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
            className="gap-2"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">Console</span>
            {consoleLogs.filter(l => l.type === 'error').length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-1.5 rounded-full">
                {consoleLogs.filter(l => l.type === 'error').length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">تحديث</span>
          </Button>
          {isPublished && publishUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publishUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">فتح المشروع</span>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-1 flex items-center justify-center p-4 bg-muted/20 ${showConsole ? 'h-2/3' : 'h-full'}`}>
          <motion.div
            key={viewMode}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              style={{
                width: viewModes.find(v => v.mode === viewMode)?.width,
                maxWidth: '100%',
                height: '100%',
              }}
              className="bg-white rounded-lg shadow-2xl overflow-hidden"
            >
              <iframe
                key={previewKey}
                ref={iframeRef}
                srcDoc={generatePreviewHTML()}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"
                title="Preview"
              />
            </div>
          </motion.div>
        </div>

        {/* Console Panel */}
        {showConsole && (
          <div className="h-1/3 border-t border-border bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-slate-900">
              <span className="text-sm font-medium text-slate-300">Console</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConsoleLogs([])}
                  className="h-6 text-xs text-slate-400 hover:text-white"
                >
                  مسح
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConsole(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">لا توجد رسائل</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`py-1 px-2 border-b border-slate-800 ${
                      log.type === 'error' ? 'text-red-400 bg-red-950/30' :
                      log.type === 'warn' ? 'text-yellow-400 bg-yellow-950/30' :
                      'text-slate-300'
                    }`}
                  >
                    <span className="opacity-50">[{log.type}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
