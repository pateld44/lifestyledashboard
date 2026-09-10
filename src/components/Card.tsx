import type { ReactNode } from 'react'

export function Card({
  title,
  accent,
  children,
}: {
  title: string
  accent: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
