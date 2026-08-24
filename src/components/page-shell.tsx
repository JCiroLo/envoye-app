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
    <main
      className="relative flex mx-auto w-screen max-w-xl bg-background text-foreground"
      data-component="page-wrapper"
    >
      {background && (
        <img
          className="fixed inset-0 w-full h-full object-cover blur-3xl pointer-events-none"
          src={background}
          alt="blurred background image"
        />
      )}
      {background && (
        <img
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ background: `url(${DEFAULT_BACKGROUND_IMAGE_URL}) center/cover no-repeat` }}
          src={background}
          alt="background image"
        />
      )}
      {background && <div className="fixed inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />}
      <div className={cn(className, "sm:px-8 h-dvh scroll-auto px-4 py-8 w-full")}>{children}</div>
    </main>
  );
};

export default PageShell;
