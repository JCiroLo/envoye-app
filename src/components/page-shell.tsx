import { type ReactNode } from "react";
import cn from "@/utils/cn-helper";

const PageShell = ({
  children,
  centered = true,
  compact = false,
}: {
  children: ReactNode;
  centered?: boolean;
  compact?: boolean;
}) => {
  return (
    <main
      className={cn("min-h-dvh overflow-x-hidden flex justify-center bg-background p-4 text-foreground", {
        "items-center": centered,
        "h-dvh overflow-y-hidden": compact,
      })}
    >
      {children}
    </main>
  );
};

export default PageShell;
