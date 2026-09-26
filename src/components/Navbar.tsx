import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, ChevronDown, LogOut, Settings, ArrowRight, Atom, Sparkles, HeartHandshake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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
        const emailFallback = session.user.email === 'jowmahmoud6@gmail.com';
        setIsSuperAdmin((accessRows && accessRows.length > 0) || emailFallback);
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
          const emailFallback = session.user?.email === 'jowmahmoud6@gmail.com';
          setIsSuperAdmin((!!data && data.length > 0) || emailFallback);
        });
      } else {
        setProfile(null);
        setIsSuperAdmin(false);
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
    { label: 'الرئيسية', path: '/' },
    { label: 'المحاكاة 3D', path: '/experiments-section', badge: 'جديد', icon: Atom },
    { label: 'الفيزياء', path: '/physics' },
    { label: 'الكيمياء', path: '/chemistry' },
    { label: 'الأحياء', path: '/biology' },
    { label: 'الرياضيات', path: '/mathematics' },
    { label: 'دامج', path: '/damij', icon: HeartHandshake },
    { label: 'المساعد الذكي', path: '/ai-assistant-section', icon: Sparkles },
    { label: 'الألغاز', path: '/subject-puzzles' },
    { label: 'الامتحان', path: '/exam-scanner' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/75 border-b border-white/[0.08] shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 sm:h-18">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-cyan-400/40 p-1 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="ذروة العلم" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                ذروة العلم
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold hidden sm:inline -mt-1">
                منصة الابتكار والتعليم الذكي
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
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/20 font-bold" 
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isSuperAdmin && (
            <Link
              to="/control-center"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all text-amber-300 hover:bg-amber-500/10 border border-amber-400/30",
                isActive('/control-center') && "bg-amber-500/20"
              )}
            >
              مركز التحكم
            </Link>
          )}
        </div>

        {/* User Account / Auth buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full px-3 py-1.5 border border-white/10">
                  <Avatar className="h-7 w-7 border border-cyan-400/40">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-tr from-cyan-600 to-blue-700 text-white text-xs font-bold">
                        {profile?.username?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-slate-950/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl rounded-2xl p-2">
                <DropdownMenuLabel className="text-slate-400 text-xs px-2 py-1.5">الحساب الشخصي</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <Link to="/profile">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-slate-200 hover:text-white hover:bg-white/10 rounded-xl px-2 py-2 text-xs">
                    <User className="mr-2 h-4 w-4 text-cyan-400" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                </Link>

                {isSuperAdmin && (
                  <Link to="/control-center">
                    <DropdownMenuItem className="flex items-center cursor-pointer text-amber-300 hover:bg-amber-500/10 rounded-xl px-2 py-2 text-xs">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>مركز التحكم</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="flex items-center cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl px-2 py-2 text-xs" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-full px-5 py-2 shadow-md shadow-cyan-500/20 border border-cyan-400/30">
                تسجيل الدخول
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu drawer */}
        <div className="lg:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-slate-950/95 backdrop-blur-2xl border-white/10 text-white p-6">
              {user && (
                <div className="py-4 mb-4 border-b border-white/10 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-cyan-400/40">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-cyan-700 text-white">
                        {profile?.username?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-white font-bold text-sm truncate">{profile?.username || user.email?.split('@')[0]}</p>
                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-2 mt-4">
                {navLinks.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between",
                      isActive(item.path)
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                
                {isSuperAdmin && (
                  <Link to="/control-center" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-500/10 border border-amber-400/20">
                    مركز التحكم
                  </Link>
                )}
                
                <div className="pt-6 border-t border-white/10">
                  {user ? (
                    <Button onClick={handleLogout} variant="outline" className="w-full border-rose-500/30 text-rose-300 hover:bg-rose-500/10 rounded-xl">
                      تسجيل الخروج
                    </Button>
                  ) : (
                    <Link to="/auth" className="block w-full">
                      <Button className="w-full bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400">
                        تسجيل الدخول
                      </Button>
                    </Link>
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
