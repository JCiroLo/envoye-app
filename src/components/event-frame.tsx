import type { ReactNode } from 'react'
import cn from '@/utils/cn-helper'

export type FrameName = 'classic-letter' | 'floral' | 'gallery'

const FloralSvg = () => <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full text-[var(--event-primary)] opacity-70" fill="none"><path d="M3 20C14 2 24 10 18 21C9 31 1 30 3 20ZM97 20C86 2 76 10 82 21C91 31 99 30 97 20ZM3 80C14 98 24 90 18 79C9 69 1 70 3 80ZM97 80C86 98 76 90 82 79C91 69 99 70 97 80Z" fill="currentColor"/><path d="M12 7c8 11 17 12 26 7M88 7c-8 11-17 12-26 7M12 93c8-11 17-12 26-7M88 93c-8-11-17-12-26-7" stroke="currentColor" strokeWidth="1.2"/></svg>
const ClassicSvg = () => <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full text-[var(--event-primary)]" fill="none"><rect x="2.5" y="2.5" width="95" height="95" rx="4" stroke="currentColor" strokeWidth="1.2"/><rect x="5.5" y="5.5" width="89" height="89" rx="3" stroke="currentColor" strokeWidth=".35" strokeDasharray="2 1.5"/><path d="M9 13h12M79 13h12M9 87h12M79 87h12" stroke="currentColor" strokeWidth="1.2"/></svg>
const GallerySvg = () => <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full text-[var(--event-primary)]" fill="none"><rect x="1.5" y="1.5" width="97" height="97" rx="3" stroke="currentColor" strokeWidth="3"/><rect x="5" y="5" width="90" height="90" rx="2" stroke="currentColor" strokeWidth=".7"/></svg>

export const EventFrame = ({ frame = 'classic-letter' }: { frame?: string }) => frame === 'floral' ? <FloralSvg /> : frame === 'gallery' ? <GallerySvg /> : <ClassicSvg />

export const FramedSurface = ({ children, frame, className }: { children: ReactNode; frame?: string; className?: string }) => <div className={cn('relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-35px_rgba(35,25,70,.35)]', className)}><EventFrame frame={frame} /><div className="relative">{children}</div></div>
