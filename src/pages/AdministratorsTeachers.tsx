import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MemberSection from "@/components/adminTeachers/MemberSection";
import AdminSection from "@/components/adminTeachers/AdminSection";
import AdminControl from "@/components/visualLibrary/AdminControl";

type AccessLevel = 'member' | 'admin' | 'super_admin' | null;

const AdministratorsTeachers = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isMemberMode, setIsMemberMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Ensure admin mapping for special emails
      try {
        await supabase.functions.invoke('ensure-admin-access');
      } catch (e) {
        console.warn('ensure-admin-access failed', e);
      }

      const { data: access, error } = await supabase
        .from("admin_teacher_access")
        .select("access_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !access) {
        setAccessLevel(null);
        setIsAdminMode(false);
        setIsMemberMode(false);
      } else {
        setAccessLevel(access.access_level);
        setIsAdminMode(access.access_level === 'admin' || access.access_level === 'super_admin');
        setIsMemberMode(access.access_level === 'member');
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setAccessLevel(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accessLevel) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="المشرفون والمعلمون - غير مصرح"
          description="منصة المشرفين والمعلمين"
        />
        <Navbar />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="absolute top-4 left-4">
            <AdminControl 
              onAdminAccess={() => checkAccess()}
              onMemberAccess={() => checkAccess()}
              isAdminMode={isAdminMode}
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">غير مصرح</h1>
            <p className="text-muted-foreground text-lg mb-6">
              ليس لديك صلاحية للوصول إلى هذه المنصة. يرجى التواصل مع المشرف لطلب الوصول.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="منصة المشرفين والمعلمون"
        description="منصة خاصة للمشرفين والمعلمين لإدارة المشاريع والمتابعة"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {accessLevel === 'member' ? (
            <MemberSection userId={user?.id} />
          ) : (
            <AdminSection 
              userId={user?.id} 
              isSuperAdmin={accessLevel === 'super_admin'} 
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdministratorsTeachers;
