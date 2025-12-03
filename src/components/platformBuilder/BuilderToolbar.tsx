import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Rocket,
  FolderOpen,
  Database,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BuilderPublishDialog } from "./BuilderPublishDialog";
import { SupabaseConnector } from "./SupabaseConnector";
import { motion } from "framer-motion";

interface BuilderToolbarProps {
  projectId?: string;
  projectTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublish: (slug: string) => void;
  isSaving: boolean;
  isPublished: boolean;
  publishUrl?: string;
  supabaseConnected?: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
  onSupabaseConnect?: (url: string, key: string, tables?: string[]) => void;
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
  supabaseConnected = false,
  supabaseUrl = "",
  supabaseKey = "",
  onSupabaseConnect,
}: BuilderToolbarProps) => {
  const navigate = useNavigate();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showSupabaseDialog, setShowSupabaseDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ai-assistant')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">العودة</span>
          </Button>

          {isEditingTitle ? (
            <Input
              value={projectTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-48 md:w-64 h-8"
              autoFocus
            />
          ) : (
            <h1
              className="text-base md:text-lg font-bold cursor-pointer hover:text-primary transition-colors truncate max-w-[150px] md:max-w-none"
              onClick={() => setIsEditingTitle(true)}
            >
              {projectTitle || "مشروع جديد"}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase Connect Button - High Priority */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={supabaseConnected ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSupabaseDialog(true)}
              className={`gap-2 ${
                supabaseConnected 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0' 
                  : 'border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400'
              }`}
            >
              {supabaseConnected ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden md:inline">Supabase متصل</span>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs hidden lg:inline">
                    مفعّل
                  </Badge>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span className="hidden md:inline">ربط Supabase</span>
                </>
              )}
            </Button>
          </motion.div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ai-platform-builder')}
            className="gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden lg:inline">مشاريعي</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden md:inline">{isSaving ? "جاري الحفظ..." : "حفظ"}</span>
          </Button>

          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={() => setShowPublishDialog(true)}
            className={`gap-2 ${!isPublished ? 'bg-gradient-to-r from-primary to-purple-600' : ''}`}
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden md:inline">
              {isPublished ? "منشور" : "نشر"}
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
              <span className="hidden lg:inline">مشاركة</span>
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

      <SupabaseConnector
        open={showSupabaseDialog}
        onOpenChange={setShowSupabaseDialog}
        onConnect={(url, key, tables) => {
          onSupabaseConnect?.(url, key, tables);
        }}
        currentUrl={supabaseUrl}
        currentKey={supabaseKey}
        isConnected={supabaseConnected}
      />
    </>
  );
};