import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Home, Code, Palette, Leaf, Users, MessageSquare, BookOpen, Image, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ProgrammingProjectsSection } from "@/components/controlCenter/ProgrammingProjectsSection";
import { ProgrammingPlatformsSection } from "@/components/controlCenter/ProgrammingPlatformsSection";
import { ArtProjectsSection } from "@/components/controlCenter/ArtProjectsSection";
import { EnvironmentalProjectsSection } from "@/components/controlCenter/EnvironmentalProjectsSection";
import { SupervisorsSection } from "@/components/controlCenter/SupervisorsSection";
import { JournalsSection } from "@/components/controlCenter/JournalsSection";
import { VisualLibrarySection } from "@/components/controlCenter/VisualLibrarySection";
import { TeachersSection } from "@/components/controlCenter/TeachersSection";
import { ParentsSection } from "@/components/controlCenter/ParentsSection";
import { AssignmentsSection } from "@/components/controlCenter/AssignmentsSection";
import { NotesSection } from "@/components/controlCenter/NotesSection";
import { TawjihiFilesSection } from "@/components/controlCenter/TawjihiFilesSection";

type Section = 
  | "main"
  | "your-home"
  | "programming"
  | "programming-projects"
  | "programming-platforms"
  | "art"
  | "environmental"
  | "supervisors"
  | "communication"
  | "communication-teachers"
  | "communication-parents"
  | "communication-assignments"
  | "communication-notes"
  | "journals"
  | "visual-library"
  | "tawjihi"
  | "school-magazine";

export default function ControlCenter() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentSection, setCurrentSection] = useState<Section>("main");
  const [breadcrumb, setBreadcrumb] = useState<{ label: string; section: Section }[]>([
    { label: "مركز التحكم", section: "main" }
  ]);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("يجب تسجيل الدخول أولاً");
        navigate("/auth");
        return;
      }

      const { data: accessData, error: accessError } = await supabase
        .from("admin_teacher_access")
        .select("access_level")
        .eq("user_id", user.id)
        .eq("access_level", "super_admin")
        .maybeSingle();

      // Fallback: allow designated super admin email
      const isEmailSuperAdmin = user.email === 'jowmahmoud6@gmail.com';

      if ((accessError || !accessData) && !isEmailSuperAdmin) {
        toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
        navigate("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("حدث خطأ في التحقق من الصلاحيات");
      navigate("/");
    }
  };

  const navigateToSection = (section: Section, label: string) => {
    // Navigate to external page for school magazine
    if (section === "school-magazine") {
      navigate("/school-magazine");
      return;
    }
    
    setCurrentSection(section);
    const newBreadcrumb = [...breadcrumb];
    const existingIndex = newBreadcrumb.findIndex(b => b.section === section);
    
    if (existingIndex !== -1) {
      setBreadcrumb(newBreadcrumb.slice(0, existingIndex + 1));
    } else {
      setBreadcrumb([...newBreadcrumb, { label, section }]);
    }
  };

  const goBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);
      setCurrentSection(newBreadcrumb[newBreadcrumb.length - 1].section);
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const mainMenuItems = [
    { icon: Home, label: "الصفحة الرئيسية", section: "your-home" as Section },
    { icon: Leaf, label: "مشاريع الطلبة في الاستدامة البيئية", section: "environmental" as Section },
    { icon: Users, label: "المشرفون والمعلمون", section: "supervisors" as Section },
    { icon: MessageSquare, label: "جسر التواصل", section: "communication" as Section },
    { icon: BookOpen, label: "المجلات العلمية", section: "journals" as Section },
    { icon: Image, label: "المكتبة البصرية", section: "visual-library" as Section },
    { icon: BookOpen, label: "ملفات التوجيهي", section: "tawjihi" as Section },
    { icon: BookOpen, label: "مجلة مدرسة عنبه", section: "school-magazine" as Section }
  ];

  const yourHomeItems = [
    { icon: Code, label: "البرمجة", section: "programming" as Section },
    { icon: Palette, label: "الفن", section: "art" as Section }
  ];

  const programmingItems = [
    { icon: Code, label: "المشاريع", section: "programming-projects" as Section },
    { icon: Code, label: "المنصات", section: "programming-platforms" as Section }
  ];

  const communicationItems = [
    { icon: Users, label: "المعلمون", section: "communication-teachers" as Section },
    { icon: Users, label: "أولياء الأمور", section: "communication-parents" as Section },
    { icon: BookOpen, label: "الواجبات", section: "communication-assignments" as Section },
    { icon: BookOpen, label: "الملاحظات", section: "communication-notes" as Section }
  ];

  const renderMenu = (items: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
            onClick={() => navigateToSection(item.section, item.label)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <StarField />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                مركز التحكم
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumb.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronLeft className="h-4 w-4" />}
                    <button
                      onClick={() => {
                        setBreadcrumb(breadcrumb.slice(0, index + 1));
                        setCurrentSection(crumb.section);
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {breadcrumb.length > 1 && (
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {currentSection === "main" && renderMenu(mainMenuItems)}
            {currentSection === "your-home" && renderMenu(yourHomeItems)}
            {currentSection === "programming" && renderMenu(programmingItems)}
            {currentSection === "communication" && renderMenu(communicationItems)}
            
            {/* Data sections */}
            {currentSection === "programming-projects" && (
              <Card className="p-6">
                <ProgrammingProjectsSection />
              </Card>
            )}
            {currentSection === "programming-platforms" && (
              <Card className="p-6">
                <ProgrammingPlatformsSection />
              </Card>
            )}
            {currentSection === "art" && (
              <Card className="p-6">
                <ArtProjectsSection />
              </Card>
            )}
            {currentSection === "environmental" && (
              <Card className="p-6">
                <EnvironmentalProjectsSection />
              </Card>
            )}
            {currentSection === "supervisors" && (
              <Card className="p-6">
                <SupervisorsSection />
              </Card>
            )}
            {currentSection === "communication-teachers" && (
              <Card className="p-6">
                <TeachersSection />
              </Card>
            )}
            {currentSection === "communication-parents" && (
              <Card className="p-6">
                <ParentsSection />
              </Card>
            )}
            {currentSection === "communication-assignments" && (
              <Card className="p-6">
                <AssignmentsSection />
              </Card>
            )}
            {currentSection === "communication-notes" && (
              <Card className="p-6">
                <NotesSection />
              </Card>
            )}
            {currentSection === "journals" && (
              <Card className="p-6">
                <JournalsSection />
              </Card>
            )}
            {currentSection === "visual-library" && (
              <Card className="p-6">
                <VisualLibrarySection />
              </Card>
            )}
            {currentSection === "tawjihi" && <TawjihiFilesSection />}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
