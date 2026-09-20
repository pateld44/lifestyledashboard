import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface QuickEntrySummary {
  habitsMarked: string[]
  habitsCreated: string[]
  vitalsUpdated: boolean
  expensesAdded: string[]
}

export function QuickEntry({ onApplied }: { onApplied: () => void }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [summaryLines, setSummaryLines] = useState<string[] | null>(null)

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed) return

    setStatus('sending')
    setErrorMessage('')
    setSummaryLines(null)

    const { data, error } = await supabase.functions.invoke<{ summary: QuickEntrySummary }>('quick-entry', {
      body: { text: trimmed },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    const summary = data?.summary
    const lines: string[] = []
    if (summary?.habitsMarked.length) lines.push(`Habits: ${summary.habitsMarked.join(', ')}`)
    if (summary?.habitsCreated.length) lines.push(`New habits added: ${summary.habitsCreated.join(', ')}`)
    if (summary?.vitalsUpdated) lines.push('Vitals updated')
    if (summary?.expensesAdded.length) lines.push(`Expenses: ${summary.expensesAdded.join(', ')}`)

    setSummaryLines(lines.length ? lines : ['Nothing recognized in that text.'])
    setStatus('idle')
    setText('')
    onApplied()
  }

  return (
    <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
        Quick entry
      </label>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. slept 7 hours, drank 4 waters, ran 5k, spent $12 on coffee"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          onClick={submit}
          disabled={status === 'sending' || !text.trim()}
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {status === 'sending' ? 'Parsing…' : 'Log it'}
        </button>
      </div>
      {status === 'error' && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
      {summaryLines && (
        <ul className="mt-2 flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
          {summaryLines.map((line) => (
            <li key={line}>✓ {line}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        Needs your own Anthropic API key in Settings. No key yet? Use the widgets below manually.
      </p>
    </div>
  )
}
