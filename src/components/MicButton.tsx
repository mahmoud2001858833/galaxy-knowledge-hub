import React from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  listening: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({ listening, onClick, className, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title || (listening ? "إيقاف التسجيل" : "تحدث للإملاء")}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
      listening
        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/50"
        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
      className
    )}
  >
    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    {listening && (
      <motion.span
        className="absolute inset-0 rounded-lg border-2 border-rose-400"
        animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    )}
  </button>
);
