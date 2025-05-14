
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// إضافة أنيميشن دوران بطيء للأيقونات
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .animate-spin-slow {
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* تحسين مظهر النصوص البارزة */
    .text-glow-cyan {
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.7), 0 0 20px rgba(56, 189, 248, 0.5);
    }
    
    .text-glow-green {
      text-shadow: 0 0 10px rgba(74, 222, 128, 0.7), 0 0 20px rgba(74, 222, 128, 0.5);
    }
    
    /* تحسين مظهر البطاقات */
    .shadow-glow-sm {
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
    }
    
    /* تنعيم حركة التمرير */
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(style);
}
