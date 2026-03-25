import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../ui/utils";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  intensity?: "light" | "medium" | "heavy";
  border?: "light" | "dark";
  rounded?: boolean;
  shadow?: boolean;
  animate?: boolean;
}

export function GlassPanel({
  children,
  className,
  intensity = "medium",
  border = "dark",
  rounded = true,
  shadow = true,
  animate = false,
  ...props
}: GlassPanelProps) {
  const intensityClasses = {
    light: "bg-white/8",
    medium: "bg-white/15",
    heavy: "bg-white/30",
  };

  const borderClasses = {
    light: "border border-white/20",
    dark: "border border-black/10",
  };

  return (
    <motion.div
      {...props}
      className={cn(
        "backdrop-blur-3xl",
        intensityClasses[intensity],
        borderClasses[border],
        rounded && "rounded-xl",
        shadow && "shadow-sm",
        className
      )}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } : undefined}
    >
      {children}
    </motion.div>
  );
}
