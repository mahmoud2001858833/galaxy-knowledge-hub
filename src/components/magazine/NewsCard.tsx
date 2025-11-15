import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Trash2, MessageCircle, Pin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    author_name: string;
    created_at: string;
    likes_count: number;
    views_count: number;
    category: string;
    is_pinned: boolean;
  };
  onUpdate: () => void;
}

export const NewsCard = ({ news, onUpdate }: NewsCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(news.likes_count);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    checkIfLiked();
    checkAdminStatus();
    incrementViews();
    fetchCommentsCount();
  }, []);

  const fetchCommentsCount = async () => {
    const { count } = await supabase
      .from("school_news_comments")
      .select("*", { count: "exact", head: true })
      .eq("news_id", news.id);
    
    setCommentsCount(count || 0);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("school_news_likes")
      .select("id")
      .eq("news_id", news.id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  };

  const incrementViews = async () => {
    await supabase
      .from("school_news")
      .update({ views_count: news.views_count + 1 })
      .eq("id", news.id);
  };

  const handleLike = async () => {
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
      // Unlike
      await supabase
        .from("school_news_likes")
        .delete()
        .eq("news_id", news.id)
        .eq("user_id", user.id);

      await supabase.rpc("adjust_school_news_likes", {
        news_id_param: news.id,
        increment_param: -1,
      });

      setIsLiked(false);
      setLocalLikesCount(localLikesCount - 1);
    } else {
      // Like
      await supabase.from("school_news_likes").insert({
        news_id: news.id,
        user_id: user.id,
      });

      await supabase.rpc("adjust_school_news_likes", {
        news_id_param: news.id,
        increment_param: 1,
      });

      setIsLiked(true);
      setLocalLikesCount(localLikesCount + 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

    const { error } = await supabase
      .from("school_news")
      .delete()
      .eq("id", news.id);

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
      onUpdate();
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer group"
      onClick={() => navigate(`/news/${news.id}`)}
    >
      <div className="p-6 space-y-4">
        {/* Category and Pin Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full text-xs font-semibold shadow-sm">
            {news.category}
          </span>
          {news.is_pinned && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Pin className="h-3.5 w-3.5" />
              مثبت
            </span>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-primary font-bold text-lg">
                {news.author_name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{news.author_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(news.created_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </p>
            </div>
          </div>
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{news.title}</h3>
          <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">{news.description}</p>

          {/* Image - Full display */}
          {news.image_url && (
            <div className="rounded-lg overflow-hidden -mx-6 -mb-3">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-auto object-contain max-h-[600px]"
              />
            </div>
          )}

          {/* Video - Full display */}
          {news.video_url && (
            <div className="rounded-lg overflow-hidden -mx-6 -mb-3 aspect-video">
              <video
                src={news.video_url}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`gap-2 transition-all duration-200 ${
              isLiked 
                ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" 
                : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`} />
            <span className="font-semibold">{localLikesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">{commentsCount}</span>
          </Button>
          
          <div className="flex items-center gap-2 text-muted-foreground mr-auto">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-semibold">{news.views_count}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
