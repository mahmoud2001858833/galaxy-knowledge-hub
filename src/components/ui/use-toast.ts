
// Re-export from sonner to use the toast library directly
export { toast } from "sonner";
export const useToast = () => {
  return { toast };
};
