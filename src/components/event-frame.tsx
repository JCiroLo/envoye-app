import type { ReactNode } from "react";
import useEventStore from "@/stores/use-event-store";
import cn from "@/utils/cn-helper";

export type FrameName = "classic-letter" | "floral" | "gallery";

const FlowerCorner = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 96 96"
    className={cn("pointer-events-none absolute h-20 w-20 text-primary", className)}
    fill="none"
    aria-hidden="true"
  >
    <g transform="translate(48 34)" fill="currentColor" opacity=".24">
      <ellipse cy="-14" rx="10" ry="17" />
      <ellipse transform="rotate(72)" cy="-14" rx="10" ry="17" />
      <ellipse transform="rotate(144)" cy="-14" rx="10" ry="17" />
      <ellipse transform="rotate(216)" cy="-14" rx="10" ry="17" />
      <ellipse transform="rotate(288)" cy="-14" rx="10" ry="17" />
    </g>
    <circle cx="48" cy="34" r="7" fill="currentColor" opacity=".78" />
    <path d="M48 41c-2 17-12 30-28 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M37 59c-12-5-18 1-20 10 11 2 18-2 20-10Z" fill="currentColor" opacity=".42" />
    <path d="M31 70c8-2 14 2 16 10-9 3-16-1-16-10Z" fill="currentColor" opacity=".3" />
    <circle cx="19" cy="84" r="3" fill="currentColor" opacity=".6" />
  </svg>
);

const FloralFrame = () => (
  <>
    <FlowerCorner className="left-1 top-1" />
    <FlowerCorner className="right-1 top-1 scale-x-[-1]" />
    <FlowerCorner className="bottom-1 left-1 scale-y-[-1]" />
    <FlowerCorner className="bottom-1 right-1 scale-x-[-1] scale-y-[-1]" />
  </>
);
const ClassicFrame = () => (
  <>
    <div className="pointer-events-none absolute inset-2 rounded-[1.7rem] border border-primary" />
    <div className="pointer-events-none absolute inset-4 rounded-[1.25rem] border border-dashed border-primary/45" />
  </>
);
const GalleryFrame = () => (
  <>
    <div className="pointer-events-none absolute inset-1 rounded-[1.85rem] border-[3px] border-primary" />
    <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] border border-primary/60" />
  </>
);

export const EventFrame = ({ frame = "classic-letter" }: { frame?: string }) =>
  frame === "floral" ? <FloralFrame /> : frame === "gallery" ? <GalleryFrame /> : <ClassicFrame />;

export const FramedSurface = ({
  children,
  frame,
  className,
}: {
  children: ReactNode;
  frame?: string;
  className?: string;
}) => {
  const storeFrame = useEventStore((state) => state.event?.invitation_frame);
  return (
    <div className={cn("surface-card relative overflow-hidden rounded-4xl", className)}>
      <EventFrame frame={frame ?? storeFrame} />
      <div className="relative">{children}</div>
    </div>
  );
};
