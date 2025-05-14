
import { toast as sonnerToast } from "sonner";

// Create properly typed re-export
export const toast = sonnerToast;

export const useToast = () => {
  return { toast: sonnerToast };
};
