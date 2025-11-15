import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { NewsCard } from "@/components/magazine/NewsCard";
import { CreateNewsDialog } from "@/components/magazine/CreateNewsDialog";
import { NewsSearch } from "@/components/magazine/NewsSearch";
import { useToast } from "@/hooks/use-toast";

interface SchoolNews {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  author_name: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  views_count: number;
}

const SchoolMagazine = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<SchoolNews[]>([]);
  const [filteredNews, setFilteredNews] = useState<SchoolNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchNews();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("admin_teacher_access")
      .select("access_level")
      .eq("user_id", user.id)
      .single();

    if (data?.access_level === "super_admin") {
      setIsSuperAdmin(true);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("school_news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الأخبار",
        variant: "destructive",
      });
    } else {
      setNews(data || []);
      setFilteredNews(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (searchTerm: string, dateFilter: string) => {
    let filtered = [...news];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            return diffDays <= 1;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredNews(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  مجلة مدرسة عنبه الثانوية الشاملة للبنين
                </h1>
                <p className="text-sm text-muted-foreground">
                  آخر الأخبار والفعاليات المدرسية
                </p>
              </div>
            </div>
            {isSuperAdmin && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                رفع خبر جديد
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <NewsSearch onSearch={handleSearch} />

        {/* News Feed */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">جاري تحميل الأخبار...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد أخبار حالياً</p>
            </div>
          ) : (
            filteredNews.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onUpdate={fetchNews}
              />
            ))
          )}
        </div>
      </div>

      {/* Create News Dialog */}
      <CreateNewsDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchNews}
      />
    </div>
  );
};

export default SchoolMagazine;
