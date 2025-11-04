import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MemberSection from "@/components/adminTeachers/MemberSection";
import AdminSection from "@/components/adminTeachers/AdminSection";

type AccessLevel = 'member' | 'admin' | 'super_admin' | null;

const AdministratorsTeachers = () => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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

      const { data: access, error } = await supabase
        .from("admin_teacher_access")
        .select("access_level")
        .eq("user_id", user.id)
        .single();

      if (error || !access) {
        setAccessLevel(null);
      } else {
        setAccessLevel(access.access_level);
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
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">غير مصرح</h1>
          <p className="text-muted-foreground text-lg">
            ليس لديك صلاحية للوصول إلى هذه المنصة. يرجى التواصل مع المشرف لطلب الوصول.
          </p>
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
            <MemberSection userId={user.id} />
          ) : (
            <AdminSection 
              userId={user.id} 
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
