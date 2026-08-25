import { type ReactNode, useEffect, useState } from "react";
import { DEFAULT_BACKGROUND_IMAGE_URL } from "@/lib/constants";
import cn from "@/utils/cn-helper";

const loadedBackgrounds = new Set<string>();

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
  const backgroundSource = background ?? DEFAULT_BACKGROUND_IMAGE_URL;
  const [backgroundLoaded, setBackgroundLoaded] = useState(() => loadedBackgrounds.has(backgroundSource));

  useEffect(() => {
    setBackgroundLoaded(loadedBackgrounds.has(backgroundSource));
  }, [backgroundSource]);

  return (
    <main
      className="relative flex mx-auto w-screen max-w-xl bg-background text-foreground"
      data-component="page-wrapper"
    >
      {(backgroundPlaceholder || backgroundSource) && (
        <img
          className="fixed inset-0 h-full w-full scale-110 object-cover blur-2xl pointer-events-none"
          src={backgroundPlaceholder ?? backgroundSource}
          alt="blurred background image"
        />
      )}
      {backgroundSource && (
        <img
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-500",
            backgroundLoaded ? "opacity-100" : "opacity-0",
          )}
          style={{ background: `url(${DEFAULT_BACKGROUND_IMAGE_URL}) center/cover no-repeat` }}
          src={backgroundSource}
          alt="background image"
          onLoad={() => {
            loadedBackgrounds.add(backgroundSource);
            setBackgroundLoaded(true);
          }}
        />
      )}
      {background && <div className="fixed inset-0 bg-linear-to-t from-black/95 to-transparent pointer-events-none" />}
      <div className={cn(className, "sm:px-8 h-dvh scroll-auto px-4 py-16 w-full")}>{children}</div>
    </main>
  );
};

export default PageShell;
