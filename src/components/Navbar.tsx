
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          <Link to="/" className="flex items-center">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
              <img 
                src="https://i.postimg.cc/mr48sKY6/image.png" 
                alt="في فلك المعرفة" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold mr-2 text-white">في فلك المعرفة</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
          <Link to="/" className={`nav-link ${isActive('/')}`}>الرئيسية</Link>
          <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>الفيزياء</Link>
          <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>الكيمياء</Link>
          <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>الأحياء</Link>
          <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>الرياضيات</Link>
          <Link to="/chat-rooms" className={`nav-link ${isActive('/chat-rooms')}`}>المحادثات</Link>
          <Link to="/subject-puzzles" className={`nav-link ${isActive('/subject-puzzles')}`}>الألغاز</Link>
          {user ? (
            <Button onClick={handleLogout} size="sm" variant="outline" className="mr-2">تسجيل الخروج</Button>
          ) : (
            <Link to="/auth" className="mr-2">
              <Button size="sm" variant="outline">تسجيل الدخول</Button>
            </Link>
          )}
          
          <Link 
            to="/profile"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="الملف الشخصي"
          >
            <User className="h-5 w-5 text-white" />
          </Link>
        </div>
        
        {/* Mobile logo */}
        <div className="md:hidden flex items-center">
          <Link to="/" className="flex items-center">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
              <img 
                src="https://i.postimg.cc/mr48sKY6/image.png" 
                alt="في فلك المعرفة" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-lg font-bold mr-2 text-white">في فلك المعرفة</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/" className={`nav-link ${isActive('/')}`}>الرئيسية</Link>
                <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>الفيزياء</Link>
                <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>الكيمياء</Link>
                <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>الأحياء</Link>
                <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>الرياضيات</Link>
                <Link to="/chat-rooms" className={`nav-link ${isActive('/chat-rooms')}`}>المحادثات</Link>
                <Link to="/subject-puzzles" className={`nav-link ${isActive('/subject-puzzles')}`}>الألغاز</Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>الملف الشخصي</Link>
                {user ? (
                  <Button onClick={handleLogout} variant="outline" className="w-full">تسجيل الخروج</Button>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
