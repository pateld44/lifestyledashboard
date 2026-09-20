export interface HabitLogEntry {
  log_date: string
  done: boolean
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Consecutive days of completion ending today. If today isn't logged yet,
 * counts from yesterday backward so an unfinished "today" doesn't zero out
 * an otherwise-intact streak.
 */
export function computeStreak(logs: HabitLogEntry[], today: string = todayStr()): number {
  const doneDates = new Set(logs.filter((l) => l.done).map((l) => l.log_date))
  const cursor = new Date(today + 'T00:00:00')
  if (!doneDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (doneDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
