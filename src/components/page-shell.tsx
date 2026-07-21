import type { ReactNode } from 'react'

const PageShell = ({ children, compact = false }: { children: ReactNode; compact?: boolean }) => (
  <main className="min-h-[100dvh] overflow-x-hidden px-4 py-5 sm:px-8 sm:py-8">
    <div className={compact ? 'mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full items-center justify-center' : ''}>
      {children}
    </div>
  </main>
)

export default PageShell
