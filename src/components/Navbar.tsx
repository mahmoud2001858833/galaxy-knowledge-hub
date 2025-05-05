
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          <Link to="/" className="flex items-center">
            <img 
              src="https://i.postimg.cc/mr48sKY6/image.png" 
              alt="في فلك المعرفة" 
              className="h-9 w-auto"
            />
            <span className="text-xl font-bold ml-2 text-white">في فلك المعرفة</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          <Link to="/" className={`nav-link ${isActive('/')}`}>الرئيسية</Link>
          <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>الفيزياء</Link>
          <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>الكيمياء</Link>
          <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>الأحياء</Link>
          <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>الرياضيات</Link>
          <Link to="/auth" className="mr-2">
            <Button size="sm" variant="outline">تسجيل الدخول</Button>
          </Link>
        </div>
        
        {/* Mobile logo */}
        <div className="md:hidden flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="https://i.postimg.cc/mr48sKY6/image.png" 
              alt="في فلك المعرفة" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold ml-2 text-white">في فلك المعرفة</span>
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
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/" className={`nav-link ${isActive('/')}`}>الرئيسية</Link>
                <Link to="/physics" className={`nav-link ${isActive('/physics')}`}>الفيزياء</Link>
                <Link to="/chemistry" className={`nav-link ${isActive('/chemistry')}`}>الكيمياء</Link>
                <Link to="/biology" className={`nav-link ${isActive('/biology')}`}>الأحياء</Link>
                <Link to="/mathematics" className={`nav-link ${isActive('/mathematics')}`}>الرياضيات</Link>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
