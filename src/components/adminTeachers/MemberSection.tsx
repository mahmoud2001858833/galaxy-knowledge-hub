import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FolderOpen, MessageSquare, Loader2, X } from "lucide-react";
import PreviousProjects from "./PreviousProjects";
import SupervisorMessages from "./SupervisorMessages";

interface MemberSectionProps {
  userId: string;
}

const MemberSection = ({ userId }: MemberSectionProps) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'projects' | 'messages'>('submit');
  const [teacherName, setTeacherName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherName.trim() || !description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `teacher-projects/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Find a supervisor (prefer super_admin)
      const { data: superAdmins } = await supabase
        .from('admin_teacher_access')
        .select('user_id')
        .eq('access_level', 'super_admin')
        .order('created_at', { ascending: true })
        .limit(1);

      const supervisorId = superAdmins?.[0]?.user_id || null;

      // Insert project assigned to supervisor
      const { error: insertError } = await supabase
        .from('teacher_projects')
        .insert([
          {
            member_id: userId,
            teacher_name: teacherName,
            description: description,
            images: imageUrls,
            admin_id: supervisorId
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال المشروع بنجاح"
      });

      // Reset form
      setTeacherName("");
      setDescription("");
      setImages([]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال المشروع",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold">منصة الأعضاء</h1>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
            size="sm"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            المشاريع السابقة
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
            size="sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            رسائل المشرف
          </Button>
        </div>
      </div>

      {activeTab === 'submit' && (
        <Card>
          <CardHeader>
            <CardTitle>إرسال مشروع جديد</CardTitle>
            <CardDescription>املأ النموذج أدناه لإرسال مشروعك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="teacherName">اسم المعلم</Label>
                <Input
                  id="teacherName"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="أدخل اسم المعلم"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف والشرح</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف المشروع والشرح"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="images">الصور (اختياري)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    إرسال
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'projects' && <PreviousProjects userId={userId} />}
      {activeTab === 'messages' && <SupervisorMessages userId={userId} />}
    </div>
  );
};

export default MemberSection;
