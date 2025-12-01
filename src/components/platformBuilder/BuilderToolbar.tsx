import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Rocket,
  FolderOpen,
  Settings,
  Download,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BuilderPublishDialog } from "./BuilderPublishDialog";

interface BuilderToolbarProps {
  projectId?: string;
  projectTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublish: (slug: string) => void;
  isSaving: boolean;
  isPublished: boolean;
  publishUrl?: string;
}

export const BuilderToolbar = ({
  projectId,
  projectTitle,
  onTitleChange,
  onSave,
  onPublish,
  isSaving,
  isPublished,
  publishUrl,
}: BuilderToolbarProps) => {
  const navigate = useNavigate();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ai-assistant')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </Button>

          {isEditingTitle ? (
            <Input
              value={projectTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-64"
              autoFocus
            />
          ) : (
            <h1
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {projectTitle || "مشروع جديد"}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ai-platform-builder')}
            className="gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden md:inline">مشاريعي</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">{isSaving ? "جاري الحفظ..." : "حفظ"}</span>
          </Button>

          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={() => setShowPublishDialog(true)}
            className="gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden md:inline">
              {isPublished ? "منشور" : "نشر المشروع"}
            </span>
          </Button>

          {isPublished && publishUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(publishUrl);
              }}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">مشاركة</span>
            </Button>
          )}
        </div>
      </div>

      <BuilderPublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        projectTitle={projectTitle}
        onPublish={onPublish}
        isPublished={isPublished}
        publishUrl={publishUrl}
      />
    </>
  );
};
