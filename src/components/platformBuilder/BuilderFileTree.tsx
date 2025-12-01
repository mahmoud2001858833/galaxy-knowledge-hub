import { FolderOpen, FileCode, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectFile {
  id?: string;
  file_name: string;
  content: string;
  file_type: string;
}

interface BuilderFileTreeProps {
  files: ProjectFile[];
  selectedFile?: string;
  onSelectFile: (fileName: string) => void;
}

export const BuilderFileTree = ({ files, selectedFile, onSelectFile }: BuilderFileTreeProps) => {
  // تنظيم الملفات حسب المجلدات
  const organizedFiles: Record<string, ProjectFile[]> = {};
  
  files.forEach(file => {
    const pathParts = file.file_name.split('/');
    if (pathParts.length === 1) {
      // ملف في المجلد الرئيسي
      if (!organizedFiles['root']) organizedFiles['root'] = [];
      organizedFiles['root'].push(file);
    } else {
      // ملف في مجلد فرعي
      const folder = pathParts[0];
      if (!organizedFiles[folder]) organizedFiles[folder] = [];
      organizedFiles[folder].push(file);
    }
  });

  const getFileIcon = (fileType: string) => {
    const icons: Record<string, React.ReactNode> = {
      html: <FileText className="w-4 h-4 text-orange-500" />,
      css: <FileCode className="w-4 h-4 text-blue-500" />,
      js: <FileCode className="w-4 h-4 text-yellow-500" />,
      json: <FileText className="w-4 h-4 text-green-500" />,
    };
    return icons[fileType] || <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          <span>ملفات المشروع</span>
        </div>

        {Object.entries(organizedFiles).map(([folder, folderFiles]) => (
          <div key={folder} className="space-y-1">
            {folder !== 'root' && (
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-2">
                <FolderOpen className="w-3 h-3" />
                <span>{folder}/</span>
              </div>
            )}
            
            <div className="space-y-0.5">
              {folderFiles.map((file) => (
                <button
                  key={file.file_name}
                  onClick={() => onSelectFile(file.file_name)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                    transition-colors duration-150
                    ${selectedFile === file.file_name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  {getFileIcon(file.file_type)}
                  <span className="truncate">{file.file_name.split('/').pop()}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            لا توجد ملفات بعد
          </div>
        )}
      </div>
    </ScrollArea>
  );
};