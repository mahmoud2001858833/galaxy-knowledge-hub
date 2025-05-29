
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const EnhancedScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    autoScroll?: boolean;
  }
>(({ className, children, autoScroll = false, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoScroll && viewportRef.current) {
      const scrollToBottom = () => {
        viewportRef.current!.scrollTo({
          top: viewportRef.current!.scrollHeight,
          behavior: 'smooth'
        });
      };
      
      // تأخير قصير للسماح بإنهاء العرض
      const timeout = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeout);
    }
  }, [autoScroll, children]);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport 
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <EnhancedScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
});
EnhancedScrollArea.displayName = "EnhancedScrollArea"

const EnhancedScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20",
      orientation === "vertical" &&
        "h-full w-3 border-l border-l-transparent p-[2px]",
      orientation === "horizontal" &&
        "h-3 flex-col border-t border-t-transparent p-[2px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-60 hover:opacity-100 transition-opacity duration-300" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
EnhancedScrollBar.displayName = "EnhancedScrollBar"

export { EnhancedScrollArea, EnhancedScrollBar }
