import { useMemo, useState } from 'react'
import { Card } from './Card'
import { useTodos } from '../hooks/useTodos'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function todayKey() {
  const d = new Date()
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function TodoCalendar() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [newItem, setNewItem] = useState('')

  const todosByDate = useMemo(() => {
    const map = new Map<string, typeof todos>()
    for (const t of todos) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return map
  }, [todos])

  const { year, month } = cursor
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(dateKey(year, month, day))

  function goToMonth(offset: number) {
    const d = new Date(year, month + offset, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  function handleAdd() {
    addTodo(selectedDate, newItem)
    setNewItem('')
  }

  const selectedTodos = todosByDate.get(selectedDate) ?? []
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <Card title="To-Do Calendar" accent="bg-amber-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{monthLabel}</span>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-slate-400">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((key, i) => {
              if (!key) return <div key={`empty-${i}`} />
              const dayTodos = todosByDate.get(key) ?? []
              const openCount = dayTodos.filter((t) => !t.done).length
              const isSelected = key === selectedDate
              const isToday = key === todayKey()
              const dayNum = Number(key.slice(-2))
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`flex h-11 flex-col items-center justify-center rounded-lg border text-sm ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${isToday ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}
                >
                  {dayNum}
                  {dayTodos.length > 0 && (
                    <span className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: Math.min(dayTodos.length, 3) }).map((_, dotI) => (
                        <span
                          key={dotI}
                          className={`h-1 w-1 rounded-full ${openCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <ul className="flex flex-col gap-2">
            {selectedTodos.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <label className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTodo(t.id)}
                    className="h-4 w-4 shrink-0 accent-amber-500"
                  />
                  <span className={t.done ? 'truncate text-slate-400 line-through' : 'truncate'}>{t.text}</span>
                </label>
                <button
                  onClick={() => removeTodo(t.id)}
                  aria-label={`Remove ${t.text}`}
                  className="shrink-0 text-xs text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
            {selectedTodos.length === 0 && (
              <p className="text-sm text-slate-400">Nothing yet — add an item below.</p>
            )}
          </ul>
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="New item"
              maxLength={200}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              onClick={handleAdd}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
