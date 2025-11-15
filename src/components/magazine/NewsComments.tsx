import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Comment {
  id: string;
  user_id: string;
  username: string;
  comment_text: string;
  created_at: string;
}

interface NewsCommentsProps {
  newsId: string;
}

export const NewsComments = ({ newsId }: NewsCommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
    checkAdminStatus();
  }, [newsId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setCurrentUsername(profile.username);
      }
    }
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

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("school_news_comments")
      .select("*")
      .eq("news_id", newsId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setLoading(true);
    const { error } = await supabase
      .from("school_news_comments")
      .insert({
        news_id: newsId,
        user_id: currentUserId,
        username: currentUsername,
        comment_text: newComment.trim(),
      });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة التعليق",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      toast({
        title: "نجح",
        description: "تم إضافة التعليق بنجاح",
      });
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("school_news_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف التعليق",
        variant: "destructive",
      });
    } else {
      fetchComments();
      toast({
        title: "نجح",
        description: "تم حذف التعليق بنجاح",
      });
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          التعليقات ({comments.length})
        </span>
      </div>

      {/* Add Comment */}
      {currentUserId && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-muted/50 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-sm">{comment.username}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </p>
              </div>
              {(currentUserId === comment.user_id || isSuperAdmin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.comment_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
