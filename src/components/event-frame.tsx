import type { HTMLAttributes, ReactNode } from "react";
import cn from "@/utils/cn-helper";

type FramedSurfaceProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

const FramedSurface = ({ children, className, ...props }: FramedSurfaceProps) => (
  <section
    className={cn(
      "relative overflow-hidden rounded-4xl border border-border/70 bg-card/88 p-6 text-card-foreground shadow-[0_20px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-9",
      className,
    )}
    {...props}
  >
    {children}
  </section>
);

export { FramedSurface };
