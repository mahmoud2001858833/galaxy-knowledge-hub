import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MicButton } from "@/components/MicButton";
import { useArabicSpeech } from "@/hooks/useArabicSpeech";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  icon?: LucideIcon;
  iconColor?: string;
  unit?: string;
  placeholder?: string;
  step?: string;
}

// Convert spoken Arabic numerals to digits
const arabicWordsToNumber = (text: string): number | null => {
  // Map Arabic-Indic digits to ASCII
  const t = text
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[،,]/g, "")
    .trim();

  // Direct number
  const direct = parseFloat(t);
  if (!isNaN(direct)) return direct;

  // Common spoken words
  const ones: Record<string, number> = {
    "صفر": 0, "واحد": 1, "اثنان": 2, "اثنين": 2, "ثلاثة": 3, "اربعة": 4, "أربعة": 4,
    "خمسة": 5, "ستة": 6, "سبعة": 7, "ثمانية": 8, "تسعة": 9, "عشرة": 10,
  };
  const tens: Record<string, number> = {
    "عشرين": 20, "عشرون": 20, "ثلاثين": 30, "ثلاثون": 30, "اربعين": 40, "أربعين": 40,
    "خمسين": 50, "ستين": 60, "سبعين": 70, "ثمانين": 80, "تسعين": 90,
  };
  const hundreds: Record<string, number> = {
    "مئة": 100, "مائة": 100, "مئتين": 200, "ثلاثمئة": 300, "اربعمئة": 400, "خمسمئة": 500,
    "ستمئة": 600, "سبعمئة": 700, "ثمانمئة": 800, "تسعمئة": 900,
  };
  const thousands: Record<string, number> = { "الف": 1000, "ألف": 1000, "الفين": 2000, "ألفين": 2000 };

  const tokens = t.split(/\s+/);
  let total = 0;
  let current = 0;
  for (const tok of tokens) {
    if (ones[tok] !== undefined) current += ones[tok];
    else if (tens[tok] !== undefined) current += tens[tok];
    else if (hundreds[tok] !== undefined) current += hundreds[tok];
    else if (thousands[tok] !== undefined) {
      total += (current || 1) * thousands[tok];
      current = 0;
    } else {
      const n = parseFloat(tok);
      if (!isNaN(n)) current += n;
    }
  }
  total += current;
  return total > 0 || tokens.includes("صفر") ? total : null;
};

export const VoiceNumberInput: React.FC<Props> = ({
  label, value, onChange, icon: Icon, iconColor = "text-emerald-400", unit, placeholder = "0", step = "any",
}) => {
  const [interim, setInterim] = useState("");

  const { listening, supported, toggle } = useArabicSpeech((text, isFinal) => {
    if (isFinal) {
      const n = arabicWordsToNumber(text);
      if (n !== null) onChange(n);
      setInterim("");
    } else {
      setInterim(text);
    }
  });

  return (
    <div className="space-y-2">
      <Label className="text-gray-300 flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        {label}
        {unit && <span className="text-xs text-gray-500">({unit})</span>}
      </Label>
      <div className="relative">
        <Input
          type="number"
          step={step}
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-slate-800/50 border-slate-600 text-white focus:border-emerald-500 transition-colors pl-12"
          placeholder={interim || placeholder}
        />
        {supported && <MicButton listening={listening} onClick={toggle} />}
      </div>
      {interim && <p className="text-xs text-emerald-300/70 italic">🎤 {interim}</p>}
    </div>
  );
};

export default VoiceNumberInput;
