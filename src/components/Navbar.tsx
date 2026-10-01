import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, ChevronDown, LogOut, Settings, ArrowRight, Atom, Sparkles, HeartHandshake, Accessibility, BookOpen, Layers, Bot, Cpu, MessageSquare, ShieldCheck, FileText, Key, Terminal, Camera, BrainCircuit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/contexts/ThemeContext';
import { openAccessibilityModal } from '@/components/accessibility/AccessibilityPanel';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface UserProfile {
  id?: string;
  username?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

const Navbar = () => {
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';

  const location = useLocation();
  const navigate = useNavigate();
  const { activeFeaturesCount } = useAccessibility();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('galaxy_admin_authenticated') === 'true' ||
           localStorage.getItem('galaxy_admin_authenticated') === 'true';
  });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase.from('users_profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);

        // Check if user is super admin
        const { data: accessRows } = await supabase
          .from('admin_teacher_access')
          .select('access_level')
          .eq('user_id', session.user.id)
          .eq('access_level', 'super_admin')
          .limit(1);
        const emailFallback = session.user.email?.toLowerCase() === 'jowmahmoud6@gmail.com';
        const isStoredAdmin = sessionStorage.getItem('galaxy_admin_authenticated') === 'true' ||
                              localStorage.getItem('galaxy_admin_authenticated') === 'true';
        setIsSuperAdmin((accessRows && accessRows.length > 0) || emailFallback || isStoredAdmin);
      }
    };
    fetchUser();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('users_profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setProfile(data);
        });

        supabase.from('admin_teacher_access').select('access_level').eq('user_id', session.user.id).eq('access_level', 'super_admin').limit(1).then(({ data }) => {
          const emailFallback = session.user?.email?.toLowerCase() === 'jowmahmoud6@gmail.com';
          const isStoredAdmin = sessionStorage.getItem('galaxy_admin_authenticated') === 'true' ||
                                localStorage.getItem('galaxy_admin_authenticated') === 'true';
          setIsSuperAdmin((!!data && data.length > 0) || emailFallback || isStoredAdmin);
        });
      } else {
        setProfile(null);
        const isStoredAdmin = sessionStorage.getItem('galaxy_admin_authenticated') === 'true' ||
                              localStorage.getItem('galaxy_admin_authenticated') === 'true';
        setIsSuperAdmin(isStoredAdmin);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "تم بنجاح",
      description: "تم تسجيل خروجك بنجاح"
    });
    if (isGJUMode) {
      navigate('/gju-competition');
    } else {
      navigate('/');
    }
  };

  if (isGJUMode) {
    if (location.pathname === '/gju-competition') {
      return null;
    }
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/80 border-b border-white/[0.08]">
        <div className="container mx-auto px-4 flex justify-between items-center h-14">
          <Link to="/gju-competition" className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-l from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              🌌 مستقبل التكنولوجيا
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/gju-competition">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-sm gap-1">
                <ArrowRight className="w-4 h-4" />
                العودة للمسابقة
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-violet-600/50 text-white text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">{profile?.username || user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10 text-white">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 text-sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { label: 'المختبرات 3D', path: '/experiments-section', badge: '49 محاكاة', icon: Atom },
    { label: 'المعلم الصوتي والبصري', path: '/voice-vision-tutor', badge: 'AI جديد', icon: Camera },
    { label: 'الخرائط والدروس الذكية', path: '/lesson-mindmap-studio', badge: 'جديد', icon: BrainCircuit },
    { label: 'الروبوتات و AI', path: '/robotics-section', icon: Cpu },
    { label: 'مجتمع الطلبة', path: '/community', badge: 'حي', icon: MessageSquare },
    { label: 'منصة دامج', path: '/damij', icon: HeartHandshake },
    { label: 'المكتبة العلمية', path: '/damij/sources', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 sm:h-18">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="ذروة العلم" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors tracking-tight">
                ذروة العلم
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline -mt-1">
                المنظومة الوطنية للتعليم التفاعلي 2.0
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                  active 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isSuperAdmin && (
            <Link
              to="/super-admin-control-hub"
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-amber-900 bg-amber-500/15 hover:bg-amber-500/25 dark:text-amber-300 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 border border-amber-500/40 shadow-sm flex items-center gap-1.5",
                (isActive('/super-admin-control-hub') || isActive('/control-center') || isActive('/admin')) && "bg-amber-500/30 text-amber-950 dark:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>لوحة الأدمن</span>
            </Link>
          )}
        </div>

        {/* User Account / Theme Toggle / Accessibility / Auth buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Accessibility Trigger Button */}
          <button
            onClick={openAccessibilityModal}
            className={cn(
              "relative p-2 rounded-xl transition-all duration-200 border shadow-sm",
              activeFeaturesCount > 0
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
            )}
            title={activeFeaturesCount > 0 ? `إعدادات إمكانية الوصول (${activeFeaturesCount} نشطة)` : "إمكانية الوصول والشمولية (Accessibility)"}
            aria-label="إعدادات إمكانية الوصول"
          >
            <Accessibility className="w-4 h-4" />
            {activeFeaturesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
            )}
          </button>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-800">
                  <Avatar className="h-7 w-7 border border-slate-300 dark:border-slate-700">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                        {profile?.username?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-xs font-semibold max-w-[100px] truncate text-slate-900 dark:text-white">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl rounded-2xl p-2">
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-xs px-2 py-1.5 font-bold">الحساب المؤسسي</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                
                <Link to="/profile">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-2 py-2 text-xs">
                    <User className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                </Link>

                <Link to="/security-report">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 rounded-xl px-2 py-2 text-xs font-semibold">
                    <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>تقرير الأمان وقوة التحمل A+</span>
                  </DropdownMenuItem>
                </Link>

                <Link to="/api-keys">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-blue-700 dark:text-cyan-300 hover:bg-blue-500/10 rounded-xl px-2 py-2 text-xs font-semibold">
                    <Terminal className="mr-2 h-4 w-4 text-blue-500" />
                    <span>واجهة المطورين ومفاتيح API</span>
                  </DropdownMenuItem>
                </Link>

                {isSuperAdmin && (
                  <Link to="/super-admin-control-hub">
                    <DropdownMenuItem className="flex items-center cursor-pointer text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 rounded-xl px-2 py-2 text-xs font-bold">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>لوحة الأدمن</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem className="flex items-center cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl px-2 py-2 text-xs" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/education-section">
                <Button 
                  size="sm" 
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs rounded-xl px-4 py-2 shadow-sm gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>المنظومة التعليمية</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu drawer */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile Accessibility Button */}
          <button
            onClick={openAccessibilityModal}
            className={cn(
              "relative p-1.5 rounded-lg border transition-all",
              activeFeaturesCount > 0
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
            )}
            title="إمكانية الوصول"
          >
            <Accessibility className="w-4 h-4" />
            {activeFeaturesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>
          
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] bg-white dark:bg-slate-950 border-s border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 overflow-y-auto">
              {user && (
                <div className="py-4 mb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-slate-900 text-white font-bold">
                        {profile?.username?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{profile?.username || user.email?.split('@')[0]}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-6 mt-4">
                {/* Section 1: Main Platform Products */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-2">
                    المنظومة الأكاديمية والمختبرات
                  </span>
                  {navLinks.map((item) => (
                    <Link 
                      key={item.path}
                      to={item.path} 
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                        isActive(item.path)
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 opacity-70" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-slate-200 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Section 2: Secondary Tools & Docs */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-2">
                    الأدوات والمراجع
                  </span>
                  <Link to="/exam-creator" className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>إنشاء امتحان من ملفك (PDF ورابط إلكتروني)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 font-bold">
                      جديد
                    </span>
                  </Link>
                  <Link to="/study-organization" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 opacity-60" />
                    <span>منظم ومخطط المذاكرة</span>
                  </Link>
                  <Link to="/platform-documentation" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 opacity-60" />
                    <span>دليل المنصة والتوثيق التقني</span>
                  </Link>
                  <Link to="/security-report" className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>تقرير الأمان وقوة التحمل</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 font-mono font-bold">
                      A+ 120k
                    </span>
                  </Link>
                  <Link to="/api-keys" className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-500" />
                      <span>واجهة المطورين ومفاتيح API</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 font-mono font-bold">
                      REST v1
                    </span>
                  </Link>
                  <button 
                    onClick={openAccessibilityModal} 
                    className="w-full text-right px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                  >
                    <Accessibility className="w-3.5 h-3.5 opacity-60" />
                    <span>إعدادات إمكانية الوصول</span>
                  </button>
                </div>
                
                {isSuperAdmin && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link to="/super-admin-control-hub" className="px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>لوحة الأدمن</span>
                      </div>
                      <Settings className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {user ? (
                    <Button onClick={handleLogout} variant="outline" className="w-full border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs">
                      تسجيل الخروج
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/auth" className="block w-full">
                        <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl">
                          تسجيل الدخول
                        </Button>
                      </Link>
                      <Link to="/education-section" className="block w-full">
                        <Button 
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>المنظومة التعليمية</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
