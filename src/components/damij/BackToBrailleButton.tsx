import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const BackToBrailleButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const navigate = useNavigate();
  return (
    <div className={`flex justify-center my-3 ${className}`}>
      <button
        onClick={() => navigate("/damij/braille")}
        title="الرجوع إلى الصفحة الرئيسية لبريل الدامج"
        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[hsl(var(--damij-primary))] hover:opacity-90 px-4 py-2 rounded-full shadow-md transition-all"
      >
        <Home className="w-4 h-4" /> الرجوع إلى بريل
      </button>
    </div>
  );
};

export default BackToBrailleButton;
