import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Card } from './Card'
import { useTodos } from '../hooks/useTodos'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function todayKey() {
  const d = new Date()
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function TodoCalendar({ userId }: { userId: string }) {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos(userId)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [focusedDate, setFocusedDate] = useState(todayKey())
  const [newItem, setNewItem] = useState('')
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())

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
  const totalDays = daysInMonth(year, month)

  const weeks: (string | null)[][] = []
  let week: (string | null)[] = new Array(startWeekday).fill(null)
  for (let day = 1; day <= totalDays; day++) {
    week.push(dateKey(year, month, day))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  function moveFocusTo(key: string) {
    const d = parseDateKey(key)
    setCursor((prev) =>
      prev.year === d.getFullYear() && prev.month === d.getMonth()
        ? prev
        : { year: d.getFullYear(), month: d.getMonth() },
    )
    setFocusedDate(key)
    requestAnimationFrame(() => buttonRefs.current.get(key)?.focus())
  }

  function goToMonth(offset: number) {
    const focused = parseDateKey(focusedDate)
    const target = new Date(year, month + offset, 1)
    const clampedDay = Math.min(focused.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
    setCursor({ year: target.getFullYear(), month: target.getMonth() })
    setFocusedDate(dateKey(target.getFullYear(), target.getMonth(), clampedDay))
  }

  function handleAdd() {
    addTodo(selectedDate, newItem)
    setNewItem('')
  }

  function handleCellKeyDown(e: KeyboardEvent<HTMLButtonElement>, key: string) {
    const d = parseDateKey(key)

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedDate(key)
      return
    }

    let deltaDays = 0
    if (e.key === 'ArrowLeft') deltaDays = -1
    else if (e.key === 'ArrowRight') deltaDays = 1
    else if (e.key === 'ArrowUp') deltaDays = -7
    else if (e.key === 'ArrowDown') deltaDays = 7
    else if (e.key === 'Home') deltaDays = -d.getDay()
    else if (e.key === 'End') deltaDays = 6 - d.getDay()
    else if (e.key === 'PageUp') {
      e.preventDefault()
      goToMonth(-1)
      return
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      goToMonth(1)
      return
    } else {
      return
    }

    e.preventDefault()
    const next = new Date(d)
    next.setDate(next.getDate() + deltaDays)
    moveFocusTo(dateKey(next.getFullYear(), next.getMonth(), next.getDate()))
  }

  const selectedTodos = todosByDate.get(selectedDate) ?? []
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <Card title="To-Do Calendar" accent="bg-amber-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ‹
            </button>
            <span id="todo-cal-month-label" className="text-sm font-medium text-slate-700 dark:text-slate-200" aria-live="polite">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ›
            </button>
          </div>

          <table aria-labelledby="todo-cal-month-label" className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                {WEEKDAYS.map((w) => (
                  <th
                    key={w}
                    scope="col"
                    abbr={w}
                    className="pb-1 text-center text-[11px] font-medium uppercase text-slate-400"
                  >
                    {w.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, wi) => (
                <tr key={wi}>
                  {w.map((key, di) => {
                    if (!key) return <td key={di} />
                    const dayTodos = todosByDate.get(key) ?? []
                    const openCount = dayTodos.filter((t) => !t.done).length
                    const isSelected = key === selectedDate
                    const isToday = key === todayKey()
                    const dayNum = Number(key.slice(-2))
                    const dateLabel = parseDateKey(key).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    const itemsLabel =
                      dayTodos.length === 0
                        ? 'no items'
                        : `${dayTodos.length} item${dayTodos.length === 1 ? '' : 's'}, ${openCount} open`

                    return (
                      <td key={key} className="p-0">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) buttonRefs.current.set(key, el)
                            else buttonRefs.current.delete(key)
                          }}
                          tabIndex={key === focusedDate ? 0 : -1}
                          aria-current={isToday ? 'date' : undefined}
                          aria-pressed={isSelected}
                          aria-label={`${dateLabel}, ${itemsLabel}`}
                          onClick={() => {
                            setSelectedDate(key)
                            setFocusedDate(key)
                          }}
                          onFocus={() => setFocusedDate(key)}
                          onKeyDown={(e) => handleCellKeyDown(e, key)}
                          className={`flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg border text-sm ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950'
                              : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                          } ${isToday ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          {dayNum}
                          {dayTodos.length > 0 && (
                            <span className="flex gap-0.5" aria-hidden="true">
                              {Array.from({ length: Math.min(dayTodos.length, 3) }).map((_, dotI) => (
                                <span
                                  key={dotI}
                                  className={`h-1 w-1 rounded-full ${openCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                />
                              ))}
                            </span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3" aria-live="polite">
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
            <label htmlFor="todo-new-item" className="sr-only">
              New to-do item
            </label>
            <input
              id="todo-new-item"
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
