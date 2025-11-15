import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Heart, 
  Eye, 
  Share2, 
  Facebook, 
  MessageCircle,
  Pin,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { NewsComments } from "@/components/magazine/NewsComments";

interface NewsDetail {
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

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
      checkIfLiked();
      checkAdminStatus();
      incrementViews();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("school_news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل تفاصيل الخبر",
        variant: "destructive",
      });
      navigate("/school-magazine");
    } else {
      setNews(data);
      setLocalLikesCount(data.likes_count);
    }
    setLoading(false);
  };

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

  const checkIfLiked = async () => {
    if (!id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("school_news_likes")
      .select("id")
      .eq("news_id", id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  };

  const incrementViews = async () => {
    if (!id || !news) return;
    
    await supabase
      .from("school_news")
      .update({ views_count: news.views_count + 1 })
      .eq("id", id);
  };

  const handleLike = async () => {
    if (!id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      await supabase
        .from("school_news_likes")
        .delete()
        .eq("news_id", id)
        .eq("user_id", user.id);

      await supabase.rpc("adjust_school_news_likes", {
        news_id_param: id,
        increment_param: -1,
      });

      setIsLiked(false);
      setLocalLikesCount(localLikesCount - 1);
    } else {
      await supabase.from("school_news_likes").insert({
        news_id: id,
        user_id: user.id,
      });

      await supabase.rpc("adjust_school_news_likes", {
        news_id_param: id,
        increment_param: 1,
      });

      setIsLiked(true);
      setLocalLikesCount(localLikesCount + 1);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = news?.title || "";
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: "نجح",
          description: "تم نسخ الرابط بنجاح",
        });
        setShowShareMenu(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

    const { error } = await supabase
      .from("school_news")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الخبر",
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجاح",
        description: "تم حذف الخبر بنجاح",
      });
      navigate("/school-magazine");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm backdrop-blur-lg bg-opacity-90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          <div className="p-8">
            {/* Category and Pin Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {news.category}
              </span>
              {news.is_pinned && (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  مثبت
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {news.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {news.author_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{news.author_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(news.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Media */}
            {news.image_url && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            {news.video_url && (
              <div className="rounded-lg overflow-hidden aspect-video mb-6">
                <video
                  src={news.video_url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {news.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 hover:bg-red-500/10 ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{localLikesCount}</span>
              </Button>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-5 w-5" />
                <span className="text-sm font-medium">{news.views_count}</span>
              </div>

              <div className="relative mr-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">مشاركة</span>
                </Button>

                {showShareMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-card border rounded-lg shadow-lg p-2 z-20">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      فيسبوك
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare("whatsapp")}
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      واتساب
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare("copy")}
                    >
                      <Share2 className="h-4 w-4" />
                      نسخ الرابط
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 pt-8 border-t">
              <NewsComments newsId={news.id} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewsDetail;
