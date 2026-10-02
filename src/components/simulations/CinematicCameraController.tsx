import React from 'react';
import { Eye, Microscope, Zap, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CameraPreset = 'overview' | 'microscopic' | 'flow' | 'orbit' | 'orbit360';

interface CinematicCameraControllerProps {
  currentPreset?: CameraPreset;
  activePreset?: CameraPreset;
  preset?: CameraPreset;
  onSelectPreset?: (preset: CameraPreset) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

export const CinematicCameraController: React.FC<CinematicCameraControllerProps> = ({
  currentPreset,
  activePreset,
  preset,
  onSelectPreset,
  isFullscreen = false,
  onToggleFullscreen,
  className = ""
}) => {
  const presets: { id: CameraPreset; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: <Eye className="w-3.5 h-3.5" />, desc: 'رؤية المنظومة كاملة' },
    { id: 'microscopic', label: 'منظور مجهري', icon: <Microscope className="w-3.5 h-3.5" />, desc: 'تركيز دقيق مقرب' },
    { id: 'flow', label: 'منظور التدفق', icon: <Zap className="w-3.5 h-3.5" />, desc: 'مرافقة الجسيمات' },
    { id: 'orbit', label: 'دوران سينمائي', icon: <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />, desc: 'عرض بانورامي 360°' },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
          الكاميرا:
        </span>
        {presets.map((p) => {
          const isActive = currentPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              title={p.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto sm:ml-0"
          title={isFullscreen ? "تصغير الشاشة" : "ملء الشاشة"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default CinematicCameraController;
