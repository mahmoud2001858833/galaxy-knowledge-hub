
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نأمل أن نراك مجددًا قريبًا",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <nav className="relative z-50 py-4 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-space-neon-blue mr-2">🌌</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-deep-purple">
            فلك المعرفة
          </span>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-2 items-center">
        <Link to="/mathematics" className="nav-link">
          منصة الرياضيات
        </Link>
        <Link to="/chemistry" className="nav-link">
          منصة الكيمياء
        </Link>
        <Link to="/biology" className="nav-link">
          منصة الأحياء
        </Link>
        <Link to="/physics" className="nav-link">
          منصة الفيزياء
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 w-10 h-10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-space-deep-purple text-white text-xs">
                    {(user.email || 'User').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-space-cosmic-black border-white/20">
              <div className="px-3 py-2 text-right">
                <p className="text-white text-sm">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-white/90 hover:bg-white/10 text-right cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white/90 hover:bg-white/10 text-right cursor-pointer"
                onClick={handleSignOut}
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="ghost" 
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={() => navigate('/auth')}
          >
            <UserIcon className="h-5 w-5 ml-1" />
            تسجيل الدخول
          </Button>
        )}
      </div>
      
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden text-white p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
          />
        </svg>
      </button>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-space-cosmic-black/95 backdrop-blur-lg border-y border-white/10 p-4">
          <div className="flex flex-col space-y-3">
            <Link to="/mathematics" className="nav-link">
              منصة الرياضيات
            </Link>
            <Link to="/chemistry" className="nav-link">
              منصة الكيمياء
            </Link>
            <Link to="/biology" className="nav-link">
              منصة الأحياء
            </Link>
            <Link to="/physics" className="nav-link">
              منصة الفيزياء
            </Link>
            {user ? (
              <>
                <div className="px-3 py-2 text-right">
                  <p className="text-white text-sm">{user.email}</p>
                </div>
                <Button 
                  className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  الملف الشخصي
                </Button>
                <Button 
                  className="bg-white/10 hover:bg-white/20 text-white w-full justify-start"
                  onClick={handleSignOut}
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Button 
                className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white w-full justify-start"
                onClick={() => navigate('/auth')}
              >
                <UserIcon className="h-5 w-5 ml-2" />
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
