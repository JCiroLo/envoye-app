import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import cn from "@/utils/cn-helper";

const PageTransition = ({ children, className }: { children: ReactNode; className?: string }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className, "w-full")}
      data-component="page-transition"
      style={{ willChange: "opacity" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
export default PageTransition;
