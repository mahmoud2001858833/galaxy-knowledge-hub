import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Upload, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UploadArtProjectForm from "./UploadArtProjectForm";
import ArtProjectComments from "./ArtProjectComments";

interface ArtProject {
  id: string;
  artist_name: string;
  project_title: string;
  description: string;
  image_url: string;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const StudentArtProjects = () => {
  const [projects, setProjects] = useState<ArtProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ArtProject | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
    fetchUserLikes();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("art_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("فشل تحميل المشاريع");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("art_project_likes")
      .select("project_id")
      .eq("user_id", user.id);

    if (data) {
      setUserLikes(new Set(data.map((like) => like.project_id)));
    }
  };

  const handleLike = async (projectId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      if (userLikes.has(projectId)) {
        // Unlike
        await supabase
          .from("art_project_likes")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id);

        await supabase.rpc("adjust_art_project_likes", {
          project_id: projectId,
          increment: -1,
        });

        setUserLikes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });

        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, likes_count: p.likes_count - 1 } : p
          )
        );
      } else {
        // Like
        await supabase.from("art_project_likes").insert({
          project_id: projectId,
          user_id: user.id,
        });

        await supabase.rpc("adjust_art_project_likes", {
          project_id: projectId,
          increment: 1,
        });

        setUserLikes((prev) => new Set(prev).add(projectId));

        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, likes_count: p.likes_count + 1 } : p
          )
        );
      }
    } catch (error: any) {
      toast.error("فشل تحديث الإعجاب");
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن مشروع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              رفع مشروع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>رفع مشروع فني جديد</DialogTitle>
            </DialogHeader>
            <UploadArtProjectForm onSuccess={fetchProjects} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.project_title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{project.project_title}</CardTitle>
                <p className="text-sm text-muted-foreground">{project.artist_name}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(project.id)}
                    className={userLikes.has(project.id) ? "text-red-500" : ""}
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${
                        userLikes.has(project.id) ? "fill-current" : ""
                      }`}
                    />
                    {project.likes_count}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        تعليق
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{project.project_title}</DialogTitle>
                      </DialogHeader>
                      <ArtProjectComments projectId={project.id} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد مشاريع متاحة
        </div>
      )}
    </motion.div>
  );
};

export default StudentArtProjects;
