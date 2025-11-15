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
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer"
      onClick={() => navigate(`/news/${news.id}`)}
    >
      <div className="p-6">
        {/* Category and Pin Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {news.category}
          </span>
          {news.is_pinned && (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium flex items-center gap-1">
              <Pin className="h-3 w-3" />
              مثبت
            </span>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">
                {news.author_name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{news.author_name}</p>
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
          <h3 className="text-xl font-bold text-foreground line-clamp-2">{news.title}</h3>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">{news.description}</p>

          {/* Media */}
          {news.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`gap-2 hover:bg-red-500/10 ${
              isLiked ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{localLikesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{commentsCount}</span>
          </Button>
          
          <div className="flex items-center gap-2 text-muted-foreground mr-auto">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">{news.views_count}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
