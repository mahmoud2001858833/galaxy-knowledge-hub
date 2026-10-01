import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Sparkles, 
  Layers, Maximize2, Minimize2, Check, X, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface MindMapNode {
  id: string;
  label: string;
  category: string;
  color: string;
  description?: string;
  formula?: string;
  children?: MindMapNode[];
}

interface InteractiveMindMapProps {
  rootTitle: string;
  subjectTitle: string;
  accentColor?: string;
  nodes: MindMapNode[];
  className?: string;
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  rootTitle,
  subjectTitle,
  accentColor = '#a855f7',
  nodes,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<{ [id: string]: boolean }>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle child expansion
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Export Mind Map as image via canvas
  const handleExportPNG = () => {
    toast.success('جاري تجهيز وتصدير الخريطة الذهنية كصورة...');
    // We can use html2canvas
    import('html2canvas').then(({ default: html2canvas }) => {
      if (containerRef.current) {
        html2canvas(containerRef.current, { scale: 2, backgroundColor: '#090d16' }).then(canvas => {
          const link = document.createElement('a');
          link.download = `mindmap-${rootTitle}-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success('تم تحميل صورة الخريطة الذهنية بنجاح!');
        });
      }
    }).catch(() => {
      toast.error('حدث خطأ أثناء تصدير الصورة');
    });
  };

  return (
    <div className={`relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl p-6 overflow-hidden ${className}`} dir="rtl">
      {/* Top Floating Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                خريطة ذهنية تفاعلية حية
              </span>
              <span className="text-xs text-slate-400">{subjectTitle}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
              هيكلية المفاهيم والروابط: {rootTitle}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
            className="w-8 h-8 p-0 rounded-xl border-slate-700 text-slate-300 hover:text-white"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.7))}
            className="w-8 h-8 p-0 rounded-xl border-slate-700 text-slate-300 hover:text-white"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(1)}
            className="w-8 h-8 p-0 rounded-xl border-slate-700 text-slate-300 hover:text-white"
            title="إعادة ضبط المقياس"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleExportPNG}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>حفظ كصورة</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Graph View */}
      <div 
        ref={containerRef}
        className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 min-h-[420px] overflow-x-auto relative flex flex-col items-center justify-start select-none"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}
      >
        {/* Root Central Node */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 px-6 py-4 rounded-3xl text-center shadow-2xl border-2 cursor-pointer mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.8), rgba(15, 23, 42, 0.95))',
            borderColor: accentColor,
            boxShadow: `0 0 30px ${accentColor}33`
          }}
          onClick={() => setSelectedNode({
            id: 'root',
            label: rootTitle,
            category: 'المفهوم المحوري',
            color: accentColor,
            description: `هذا هو المفهوم المركزي الذي تنبثق منه جميع القوانين والتطبيقات الرياضية والعلمية في هذا الموضوع.`
          })}
        >
          <span className="text-[10px] text-purple-300 uppercase font-mono tracking-widest block mb-0.5">
            المركز والمفهوم الأساسي
          </span>
          <h4 className="text-xl md:text-2xl font-bold text-white">
            {rootTitle}
          </h4>
        </motion.div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {nodes.map((branch, bIdx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bIdx * 0.08 }}
              className="p-4 rounded-2xl border transition-all space-y-3"
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderColor: `${branch.color}55`
              }}
            >
              {/* Branch Header */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedNode(branch)}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: branch.color }} 
                  />
                  <h5 className="font-bold text-base text-white hover:text-purple-300 transition-colors">
                    {branch.label}
                  </h5>
                </div>

                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                  style={{ backgroundColor: `${branch.color}22`, color: branch.color }}
                >
                  {branch.category}
                </span>
              </div>

              {branch.description && (
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {branch.description}
                </p>
              )}

              {branch.formula && (
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 text-left overflow-x-auto" dir="ltr">
                  {branch.formula}
                </div>
              )}

              {/* Sub-children / Sub-branches if present */}
              {branch.children && branch.children.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">التفرعات التفصيلية:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedNode(child)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/60 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-purple-400 transition-all text-right flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: child.color || branch.color }} />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Node Detail Popup Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-4 p-5 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: selectedNode.color }} 
                />
                <h4 className="text-lg font-bold text-white">{selectedNode.label}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {selectedNode.category}
                </span>
              </div>
              {selectedNode.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedNode.description}
                </p>
              )}
              {selectedNode.formula && (
                <div className="p-2 rounded-xl bg-slate-950 font-mono text-cyan-300 text-sm text-left max-w-md" dir="ltr">
                  {selectedNode.formula}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white self-start md:self-center"
            >
              <X className="w-4 h-4 ml-1" />
              <span>إغلاق التفاصيل</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
