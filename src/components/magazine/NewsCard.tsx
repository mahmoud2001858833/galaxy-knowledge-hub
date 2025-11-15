import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Calendar, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
  };
  onUpdate: () => void;
}

export const NewsCard = ({ news, onUpdate }: NewsCardProps) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(news.likes_count);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkIfLiked();
    checkAdminStatus();
    incrementViews();
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{news.author_name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(news.created_at), "d MMMM yyyy", { locale: ar })}
            </p>
          </div>
        </div>
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

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2 text-foreground">{news.title}</h2>
        <p className="text-muted-foreground whitespace-pre-wrap mb-4">
          {news.description}
        </p>

        {/* Media */}
        {news.image_url && (
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full rounded-lg mb-4 object-cover max-h-96"
          />
        )}

        {news.video_url && (
          <video
            src={news.video_url}
            controls
            className="w-full rounded-lg mb-4"
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{localLikesCount}</span>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Eye className="h-4 w-4" />
            <span>{news.views_count}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
