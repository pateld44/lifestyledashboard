import { useState } from 'react'
import { Card } from './Card'
import type { Habit } from '../types'

export function HabitsCard({
  habits,
  onChange,
}: {
  habits: Habit[]
  onChange: (habits: Habit[]) => void
}) {
  const [newHabit, setNewHabit] = useState('')

  function toggle(id: string) {
    onChange(
      habits.map((h) =>
        h.id === id
          ? {
              ...h,
              doneToday: !h.doneToday,
              streak: h.doneToday ? Math.max(0, h.streak - 1) : h.streak + 1,
            }
          : h,
      ),
    )
  }

  function addHabit() {
    const name = newHabit.trim()
    if (!name) return
    onChange([
      ...habits,
      { id: crypto.randomUUID(), name, streak: 0, doneToday: false },
    ])
    setNewHabit('')
  }

  function removeHabit(id: string) {
    onChange(habits.filter((h) => h.id !== id))
  }

  return (
    <Card title="Habits" accent="bg-violet-500">
      <ul className="flex flex-col gap-2">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
          >
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={h.doneToday}
                onChange={() => toggle(h.id)}
                className="h-4 w-4 accent-violet-500"
              />
              {h.name}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                🔥 {h.streak}
              </span>
              <button
                onClick={() => removeHabit(h.id)}
                aria-label={`Remove ${h.name}`}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
        {habits.length === 0 && (
          <p className="text-sm text-slate-400">No habits yet — add one below.</p>
        )}
      </ul>
      <div className="flex gap-2">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="New habit"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          onClick={addHabit}
          className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          Add
        </button>
      </div>
    </Card>
  )
}
