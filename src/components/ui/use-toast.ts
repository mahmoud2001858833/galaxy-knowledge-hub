
import { toast as sonnerToast } from "sonner";
import type { ToastProps } from "sonner";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: string;
};

// Create properly typed re-export with the right interface for our app
const toast = {
  // Add custom methods that match our existing usage pattern
  error: (options: ToastOptions) => 
    sonnerToast.error(options.title, { description: options.description }),
  success: (options: ToastOptions) => 
    sonnerToast.success(options.title, { description: options.description }),
  warning: (options: ToastOptions) => 
    sonnerToast.warning(options.title, { description: options.description }),
  info: (options: ToastOptions) => 
    sonnerToast.info(options.title, { description: options.description }),
  // Support our original toast object format
  default: (options: ToastOptions) => 
    sonnerToast(options.title, { description: options.description })
};

// Add the default callable function
const customToast = (options: ToastOptions) => {
  return sonnerToast(options.title, { description: options.description });
};

// Merge all properties
const mergedToast = Object.assign(customToast, toast);

export { mergedToast as toast };

export const useToast = () => {
  return { toast: mergedToast };
};
