import { type ReactNode, useEffect, useState } from "react";
import { DEFAULT_BACKGROUND_IMAGE_URL } from "@/lib/constants";
import cn from "@/utils/cn-helper";

const PageShell = ({
  children,
  className,
  background = DEFAULT_BACKGROUND_IMAGE_URL,
  backgroundPlaceholder,
}: {
  children: ReactNode;
  className?: string;
  background?: string | null;
  backgroundPlaceholder?: string | null;
}) => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => setBackgroundLoaded(false), [background]);

  return (
    <main
      className="relative flex mx-auto w-screen max-w-xl bg-background text-foreground"
      data-component="page-wrapper"
    >
      {(backgroundPlaceholder || background) && (
        <img
          className="fixed inset-0 h-full w-full scale-110 object-cover blur-2xl pointer-events-none"
          src={backgroundPlaceholder ?? background ?? DEFAULT_BACKGROUND_IMAGE_URL}
          alt="blurred background image"
        />
      )}
      {background && (
        <img
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-500",
            backgroundLoaded ? "opacity-100" : "opacity-0",
          )}
          style={{ background: `url(${DEFAULT_BACKGROUND_IMAGE_URL}) center/cover no-repeat` }}
          src={background}
          alt="background image"
          onLoad={() => setBackgroundLoaded(true)}
        />
      )}
      {background && <div className="fixed inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />}
      <div className={cn(className, "sm:px-8 h-dvh scroll-auto px-4 py-8 w-full")}>{children}</div>
    </main>
  );
};

export default PageShell;
