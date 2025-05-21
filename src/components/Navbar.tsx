
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User, ChevronDown, LogOut, Settings, UserCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/i18n/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { t, toggleLanguage, dir } = useLanguage();

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
        supabase.from('users_profiles').select('*').eq('id', session.user.id).single().then(({
          data
        }) => {
          setProfile(data);
        });
      } else {
        setProfile(null);
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
      title: t.common.success,
      description: "تم تسجيل خروجك بنجاح"
    });
    navigate('/');
  };

  return <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          <Link to="/" className="flex items-center">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
              <img src="https://i.postimg.cc/mr48sKY6/image.png" alt="في فلك المعرفة" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-bold mx-2 text-white">{t.home.title}</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
          <NavigationMenu dir={dir}>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/') && "bg-white/10")}>
                    {t.nav.home}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/physics">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/physics') && "bg-white/10")}>
                    {t.nav.physics}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/chemistry">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/chemistry') && "bg-white/10")}>
                    {t.nav.chemistry}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/biology">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/biology') && "bg-white/10")}>
                    {t.nav.biology}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/mathematics">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/mathematics') && "bg-white/10")}>
                    {t.nav.mathematics}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/chat-rooms">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/chat-rooms') && "bg-white/10")}>
                    {t.nav.chat}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/subject-puzzles">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/subject-puzzles') && "bg-white/10")}>
                    {t.nav.puzzles}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/profile">
                  <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/10 data-[state=open]:bg-white/10 text-white", isActive('/profile') && "bg-white/10")}>
                    {t.nav.profile}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button variant="ghost" 
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white/10 text-white"
                  onClick={toggleLanguage}>
                  <Globe className="mr-2 h-4 w-4" />
                  {t.nav.language}
                </Button>
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
                <DropdownMenuLabel className="text-white/70">{t.nav.account}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <Link to="/profile">
                  <DropdownMenuItem className="flex items-center cursor-pointer text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.nav.profile}</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem className="flex items-center cursor-pointer text-white" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.nav.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Link to="/auth">
              <Button size="sm" variant="outline">{t.nav.login}</Button>
            </Link>}
        </div>
        
        {/* Mobile logo */}
        <div className="md:hidden flex items-center">
          <Link to="/" className="flex items-center">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
              <img src="https://i.postimg.cc/mr48sKY6/image.png" alt="في فلك المعرفة" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-lg font-bold mr-2 text-white">{t.home.title}</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <Globe className="h-6 w-6" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === 'rtl' ? "right" : "left"} className="w-[250px] sm:w-[300px] bg-blue-950/90 backdrop-blur-md border-blue-800/50">
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
                <Link to="/" className={`nav-link ${isActive('/')}`}>{t.nav.home}</Link>
                <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>{t.nav.physics}</Link>
                <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>{t.nav.chemistry}</Link>
                <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>{t.nav.biology}</Link>
                <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>{t.nav.mathematics}</Link>
                <Link to="/chat-rooms" className={`nav-link ${isActive('/chat-rooms')}`}>{t.nav.chat}</Link>
                <Link to="/subject-puzzles" className={`nav-link ${isActive('/subject-puzzles')}`}>{t.nav.puzzles}</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>{t.nav.profile}</Link>
                
                {user ? <Button onClick={handleLogout} variant="outline" className="w-full">{t.nav.logout}</Button> : <Link to="/auth">
                    <Button variant="outline" className="w-full">{t.nav.login}</Button>
                  </Link>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>;
};
export default Navbar;
