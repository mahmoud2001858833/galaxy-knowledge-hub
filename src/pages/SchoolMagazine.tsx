import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Newspaper, Award, Sparkles, Calendar, BookOpen } from "lucide-react";
import { NewsCard } from "@/components/magazine/NewsCard";
import { CreateNewsDialog } from "@/components/magazine/CreateNewsDialog";
import { NewsSearch } from "@/components/magazine/NewsSearch";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  category: string;
  is_pinned: boolean;
}

const FALLBACK_SCHOOL_NEWS: SchoolNews[] = [
  {
    id: "fallback-1",
    title: "إطلاق منظومة المختبرات التفاعلية ثلاثية الأبعاد (49 مختبراً علمياً) لطلبة مدرسة عنبه الثانوية",
    description: "ضمن مبادرات التحول الرقمي لمدرسة عنبه الثانوية الشاملة للبنين وبدعم مديرية تربية لواء المزار الشمالي، تم تدشين 49 تجربة علمية افتراضية تفاعلية تغطي مباحث الفيزياء، الكيمياء، الأحياء، وعلوم الأرض والفضاء لتمكين الطلبة من إجراء التجارب بأمان ودقة علمية عالية.",
    image_url: null,
    video_url: null,
    author_name: "إدارة مدرسة عنبه الثانوية الشاملة للبنين",
    author_id: "school-admin",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    likes_count: 148,
    views_count: 620,
    category: "إنجازات",
    is_pinned: true,
  },
  {
    id: "fallback-2",
    title: "تفعيل المرشد الذكي الشامل (AI Tutor) ومولد الحصص التفاعلية للمعلمين والطلاب",
    description: "أعلنت لجنة التطوير الأكاديمي في المدرسة عن توفير المساعد الذكي الفوري القادر على شرح الدروس خطوة بخطوة، وتوليد خرائط المفاهيم والامتحانات التفاعلية المعيارية وفق المنهاج الأردني الحديث.",
    image_url: null,
    video_url: null,
    author_name: "نادي الإبداع العلمي والتقني",
    author_id: "science-club",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    likes_count: 96,
    views_count: 410,
    category: "فعاليات",
    is_pinned: false,
  },
  {
    id: "fallback-3",
    title: "فتح باب النشر العلمي الطلابي في المجلة العلمية المحكمة ومسابقة فرسان العلوم",
    description: "ندعو جميع طلبة الصفوف من السابع حتى التوجيهي للمشاركة بأبحاثهم وتجاربهم العلمية المبتكرة في المجلة العلمية للمدرسة، حيث سيتم تكريم الأبحاث الفائزة في الطابور الصباحي ونشرها على مستوى المديرية.",
    image_url: null,
    video_url: null,
    author_name: "قسم الإشراف التربوي والمختبرات",
    author_id: "lab-supervisor",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    likes_count: 84,
    views_count: 350,
    category: "إعلانات",
    is_pinned: false,
  },
];

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
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      setNews(FALLBACK_SCHOOL_NEWS);
      setFilteredNews(FALLBACK_SCHOOL_NEWS);
    } else {
      setNews(data);
      setFilteredNews(data);
    }
    setLoading(false);
  };

  const handleSearch = (searchTerm: string, dateFilter: string, categoryFilter: string) => {
    let filtered = [...news];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060818] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300" dir="rtl">
      <Navbar />

      {/* Institutional Hero Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 sticky top-16 z-20 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4 py-5 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm shrink-0"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    مجلة مدرسة عنبه الثانوية الشاملة للبنين
                  </h1>
                  <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-bold">
                    المنبر الإعلامي الرسمي
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  آخر الأخبار، الفعاليات المدرسية، الإنجازات الوطنية، والمبادرات العلمية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                onClick={() => navigate("/scientific-journal")}
                variant="outline"
                className="border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs flex gap-1.5 rounded-xl font-bold shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>المجلة العلمية والأبحاث</span>
              </Button>

              {isSuperAdmin && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20"
                >
                  <Plus className="h-4 w-4" />
                  رفع خبر جديد
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{news.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">أخبار وتقارير منشورة</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">لواء المزار الشمالي</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">مديرية التربية والتعليم</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">تحديث فوري</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">تغطية الأنشطة المدرسية</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <NewsSearch onSearch={handleSearch} />

        {/* News Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">جاري تحميل أخبار المدرسة...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold">لا توجد أخبار مطابقة لمعايير البحث الحالية</p>
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
      </main>

      {/* Create News Dialog */}
      <CreateNewsDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchNews}
      />

      <Footer />
    </div>
  );
};

export default SchoolMagazine;
