import { type ReactNode } from "react";
import { DEFAULT_BACKGROUND_IMAGE_URL } from "@/lib/constants";
import cn from "@/utils/cn-helper";

const PageShell = ({
  children,
  className,
  background = DEFAULT_BACKGROUND_IMAGE_URL,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  background?: string | null;
  compact?: boolean;
}) => {
  return (
    <main
      className={cn(
        className,
        "relative w-screen max-w-xl min-h-dvh mx-auto overflow-x-hidden flex justify-center bg-background p-4 text-foreground",
        {
          "h-dvh overflow-y-hidden": compact,
        },
      )}
    >
      {background && (
        <img className="fixed inset-0 w-full h-full object-cover blur-3xl" src={background} alt="background image" />
      )}
      {background && (
        <img className="absolute inset-0 w-full h-full object-cover" src={background} alt="background image" />
      )}
      {background && <div className="fixed inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />}
      {children}
    </main>
  );
};

export default PageShell;
