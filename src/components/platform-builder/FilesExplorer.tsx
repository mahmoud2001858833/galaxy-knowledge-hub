import { useState, useMemo, useEffect, useRef } from "react";
import { FileCode, FileText, FileJson, File as FileIcon, Folder, FolderOpen, Download, Copy, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  children?: TreeNode[];
  file?: ProjectFile;
}

const buildTree = (files: ProjectFile[]): TreeNode => {
  const root: TreeNode = { name: "/", path: "", isFile: false, children: [] };
  for (const f of files) {
    const parts = f.path.split("/").filter(Boolean);
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      let next = cur.children?.find((c) => c.name === part);
      if (!next) {
        next = { name: part, path, isFile, children: isFile ? undefined : [], file: isFile ? f : undefined };
        cur.children = cur.children || [];
        cur.children.push(next);
      }
      cur = next;
    }
  }
  const sort = (n: TreeNode) => {
    if (!n.children) return;
    n.children.sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    n.children.forEach(sort);
  };
  sort(root);
  return root;
};

const iconFor = (lang: string) => {
  switch (lang) {
    case "javascript": return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
    case "html": return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
    case "css": return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    case "json": return <FileJson className="w-3.5 h-3.5 text-emerald-400" />;
    case "markdown": return <FileText className="w-3.5 h-3.5 text-purple-300" />;
    default: return <FileIcon className="w-3.5 h-3.5 text-white/60" />;
  }
};

const Node = ({ node, depth, selected, onSelect, openMap, setOpenMap }: {
  node: TreeNode; depth: number; selected: string;
  onSelect: (f: ProjectFile) => void;
  openMap: Record<string, boolean>;
  setOpenMap: (m: Record<string, boolean>) => void;
}) => {
  if (node.path === "") {
    return <>{node.children?.map((c) => (
      <Node key={c.path} node={c} depth={0} selected={selected} onSelect={onSelect} openMap={openMap} setOpenMap={setOpenMap} />
    ))}</>;
  }
  const isOpen = openMap[node.path] ?? true;
  if (node.isFile && node.file) {
    const isSel = selected === node.path;
    return (
      <button
        onClick={() => onSelect(node.file!)}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-left hover:bg-white/10 transition ${isSel ? "bg-cyan-500/20 text-cyan-200" : "text-white/70"}`}
        style={{ paddingInlineStart: depth * 12 + 8 }}
        dir="ltr"
      >
        {iconFor(node.file.language)}
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpenMap({ ...openMap, [node.path]: !isOpen })}
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/80 hover:bg-white/10 transition text-left"
        style={{ paddingInlineStart: depth * 12 + 4 }}
        dir="ltr"
      >
        {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-amber-300" /> : <Folder className="w-3.5 h-3.5 text-amber-300" />}
        <span className="font-semibold">{node.name}/</span>
      </button>
      {isOpen && node.children?.map((c) => (
        <Node key={c.path} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} openMap={openMap} setOpenMap={setOpenMap} />
      ))}
    </div>
  );
};

export default function FilesExplorer({ files }: { files: ProjectFile[] }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<ProjectFile | null>(files[0] || null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return files;
    const q = query.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q) || f.content.toLowerCase().includes(q));
  }, [files, query]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  // Highlight on file change
  useEffect(() => {
    if (codeRef.current && selected) {
      const langMap: Record<string, string> = {
        javascript: "javascript", html: "html", css: "css", json: "json", markdown: "markdown",
      };
      const lang = langMap[selected.language] || "plaintext";
      try {
        const result = hljs.highlight(selected.content, { language: lang, ignoreIllegals: true });
        codeRef.current.innerHTML = result.value;
      } catch {
        codeRef.current.textContent = selected.content;
      }
    }
  }, [selected]);

  const lineCount = useMemo(() => (selected ? selected.content.split("\n").length : 0), [selected]);
  const sizeKb = useMemo(() => (selected ? (selected.content.length / 1024).toFixed(1) : "0"), [selected]);

  const copyContent = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true);
    toast({ title: "تم نسخ الكود" });
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadFile = () => {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = selected.path.split("/").pop() || "file.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!files.length) {
    return <div className="text-center py-12 text-white/40 text-sm">لا توجد ملفات بعد</div>;
  }

  const breadcrumbs = selected ? selected.path.split("/") : [];

  return (
    <div className="grid grid-cols-12 gap-3 h-[640px]">
      {/* Tree */}
      <div className="col-span-4 lg:col-span-3 rounded-xl border border-white/10 bg-black/40 overflow-hidden flex flex-col">
        <div className="p-2 border-b border-white/10">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-white/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الملفات..."
              className="h-7 text-xs bg-white/5 border-white/10 text-white pr-7"
            />
          </div>
          <div className="text-[10px] text-white/40 mt-1.5 px-1">
            {files.length} ملف
          </div>
        </div>
        <div className="flex-1 overflow-auto p-1">
          <Node node={tree} depth={0} selected={selected?.path || ""} onSelect={setSelected} openMap={openMap} setOpenMap={setOpenMap} />
        </div>
      </div>

      {/* Code preview */}
      <div className="col-span-8 lg:col-span-9 rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-1.5 min-w-0 text-xs" dir="ltr">
            {selected && iconFor(selected.language)}
            {breadcrumbs.map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/30">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-white/90 font-medium" : "text-white/50"}>
                  {part}
                </span>
              </span>
            ))}
            {selected && (
              <span className="text-[10px] text-white/40 shrink-0 ms-2">
                {lineCount} سطر · {sizeKb} KB
              </span>
            )}
          </div>
          {selected && (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="ghost" className="h-7 text-white/70 hover:text-white" onClick={copyContent}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-white/70 hover:text-white" onClick={downloadFile}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {selected ? (
            <div className="flex" dir="ltr">
              {/* Line numbers */}
              <div className="select-none text-right py-4 px-3 text-white/25 font-mono text-xs leading-5 bg-black/30 border-r border-white/5 sticky left-0">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="text-xs leading-5 p-4 flex-1 font-mono overflow-x-auto">
                <code ref={codeRef} className={`language-${selected.language}`}>{selected.content}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-sm">اختر ملفاً لعرض محتواه</div>
          )}
        </div>
      </div>
    </div>
  );
}
