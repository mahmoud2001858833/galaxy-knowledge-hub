
import { toast as sonnerToast } from "sonner";

// Create properly typed re-export with the right interface for our app
export const toast = {
  ...sonnerToast,
  // Add custom methods that match our existing usage pattern
  error: (options: { title: string; description?: string }) => 
    sonnerToast.error(options.title, { description: options.description }),
  success: (options: { title: string; description?: string }) => 
    sonnerToast.success(options.title, { description: options.description }),
  warning: (options: { title: string; description?: string }) => 
    sonnerToast.warning(options.title, { description: options.description }),
  info: (options: { title: string; description?: string }) => 
    sonnerToast.info(options.title, { description: options.description }),
  // Support our original toast object format
  default: (options: { title: string; description?: string; variant?: string }) => 
    sonnerToast(options.title, { description: options.description })
};

export const useToast = () => {
  return { toast };
};
