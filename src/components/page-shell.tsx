import { type ReactNode } from "react";
import { DEFAULT_BACKGROUND_IMAGE_URL } from "@/lib/constants";
import cn from "@/utils/cn-helper";

const PageShell = ({
  children,
  className,
  background = DEFAULT_BACKGROUND_IMAGE_URL,
}: {
  children: ReactNode;
  className?: string;
  background?: string | null;
}) => {
  return (
    <main className="relative flex mx-auto w-screen max-w-xl bg-background text-foreground">
      {background && (
        <img
          className="fixed inset-0 w-full h-full object-cover blur-3xl"
          src={background}
          alt="blurred background image"
        />
      )}
      {background && (
        <img
          className="absolute inset-0 w-full h-full object-cover"
          style={{ background: `url(${DEFAULT_BACKGROUND_IMAGE_URL}) center/cover no-repeat` }}
          src={background}
          alt="background image"
        />
      )}
      {background && <div className="fixed inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />}
      <div className={cn(className, "h-dvh scroll-auto p-4")}>{children}</div>
    </main>
  );
};

export default PageShell;
