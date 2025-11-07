import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Comment {
  id: string;
  user_id: string;
  username: string;
  comment: string;
  created_at: string;
}

interface ArtProjectCommentsProps {
  projectId: string;
}

const ArtProjectComments = ({ projectId }: ArtProjectCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [projectId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("art_project_comments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast.error("فشل تحميل التعليقات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("art_project_comments").insert({
        project_id: projectId,
        user_id: user.id,
        username: profile?.username || "مستخدم",
        comment: newComment,
      });

      if (error) throw error;

      toast.success("تم إضافة التعليق بنجاح");
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      toast.error("فشل إضافة التعليق");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("art_project_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast.success("تم حذف التعليق");
      fetchComments();
    } catch (error: any) {
      toast.error("فشل حذف التعليق");
    }
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          placeholder="اكتب تعليقك..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={handleSubmitComment} className="gap-2">
          <Send className="w-4 h-4" />
          إرسال التعليق
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">التعليقات ({comments.length})</h3>
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
              </div>
              {currentUserId === comment.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.comment}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtProjectComments;
