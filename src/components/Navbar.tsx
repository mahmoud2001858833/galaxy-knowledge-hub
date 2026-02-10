import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const {
          data
        } = await supabase.from('users_profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);

        // Check if user is super admin (with email fallback)
        const {
          data: accessRows
        } = await supabase.from('admin_teacher_access').select('access_level').eq('user_id', session.user.id).eq('access_level', 'super_admin').limit(1);
        const emailFallback = session.user.email === 'jowmahmoud6@gmail.com';
        setIsSuperAdmin(accessRows && accessRows.length > 0 || emailFallback);
      }
    };
    fetchUser();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Refresh profile
        supabase.from('users_profiles').select('*').eq('id', session.user.id).single().then(({
          data
        }) => {
          setProfile(data);
        });

        // Refresh super admin status dynamically (no page reload needed)
        supabase.from('admin_teacher_access').select('access_level').eq('user_id', session.user.id).eq('access_level', 'super_admin').limit(1).then(({
          data
        }) => {
          const emailFallback = session.user?.email === 'jowmahmoud6@gmail.com';
          setIsSuperAdmin(!!data && data.length > 0 || emailFallback);
        });
      } else {
        setProfile(null);
        setIsSuperAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "تم بنجاح",
      description: "تم تسجيل خروجك بنجاح"
    });
    navigate('/');
  };
  return <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          <Link to="/" className="flex items-center">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <img src="/logo.png" alt="ذروة العلم" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-bold mx-2 text-white">ذروة العلم</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
          <NavigationMenu dir="rtl">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/') && "bg-white/10")}>
                    الرئيسية
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              {isSuperAdmin && <NavigationMenuItem>
                  <Link to="/control-center">
                    <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/control-center') && "bg-white/10")}>
                      مركز التحكم
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>}
              
              <NavigationMenuItem>
                <Link to="/physics">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/physics') && "bg-white/10")}>
                    الفيزياء
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/chemistry">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/chemistry') && "bg-white/10")}>
                    الكيمياء
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/biology">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/biology') && "bg-white/10")}>
                    الأحياء
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/mathematics">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/mathematics') && "bg-white/10")}>
                    الرياضيات
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/chat-rooms">
                  
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/subject-puzzles">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/subject-puzzles') && "bg-white/10")}>
                    الألغاز
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/profile">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/profile') && "bg-white/10")}>
                    الملف الشخصي
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 ml-0">
                  {profile && <Avatar className="h-8 w-8">
                      {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : <AvatarFallback className="bg-blue-700">
                          {profile.username?.[0] || user.email?.[0]}
                        </AvatarFallback>}
                    </Avatar>}
                  <span className="mx-2 font-medium">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-blue-950/90 backdrop-blur-md border-blue-800/50">
                <DropdownMenuLabel className="text-white/70">الحساب الشخصي</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <Link to="/profile">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                </Link>
                
                {isSuperAdmin && <Link to="/control-center">
                    <DropdownMenuItem className="flex items-center cursor-pointer text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>مركز التحكم</span>
                    </DropdownMenuItem>
                  </Link>}
                
                <DropdownMenuItem className="flex items-center cursor-pointer text-white" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Link to="/auth">
              <Button size="sm" variant="outline">تسجيل الدخول</Button>
            </Link>}
        </div>
        
        {/* Mobile logo */}
        <div className="md:hidden flex items-center">
          <Link to="/" className="flex items-center">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <img src="/logo.png" alt="ذروة العلم" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-lg font-bold mr-2 text-white">ذروة العلم</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-blue-950/90 backdrop-blur-md border-blue-800/50">
              {user && profile && <div className="py-4 mb-4 border-b border-white/10 flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : <AvatarFallback className="bg-blue-700">
                        {profile.username?.[0] || user.email?.[0]}
                      </AvatarFallback>}
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{profile?.username || user.email?.split('@')[0]}</p>
                    <p className="text-white/50 text-xs">{user.email}</p>
                  </div>
                </div>}
              
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/" className={`nav-link ${isActive('/')}`}>الرئيسية</Link>
                <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>الفيزياء</Link>
                <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>الكيمياء</Link>
                <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>الأحياء</Link>
                <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>الرياضيات</Link>
                <Link to="/chat-rooms" className={`nav-link ${isActive('/chat-rooms')}`}>المحادثات</Link>
                <Link to="/subject-puzzles" className={`nav-link ${isActive('/subject-puzzles')}`}>الألغاز</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>الملف الشخصي</Link>
                
                {isSuperAdmin && <Link to="/control-center" className={`nav-link ${isActive('/control-center')}`}>مركز التحكم</Link>}
                
                {user ? <Button onClick={handleLogout} variant="outline" className="w-full">تسجيل الخروج</Button> : <Link to="/auth">
                    <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                  </Link>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>;
};
export default Navbar;
