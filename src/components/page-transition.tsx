import type { ReactNode } from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 14, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.99 }}
    transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
  >
    {children}
  </motion.div>
);
export default PageTransition;
