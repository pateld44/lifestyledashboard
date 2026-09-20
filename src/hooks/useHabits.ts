import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { computeStreak, todayStr } from '../lib/streak'
import type { Habit } from '../types'

export function useHabits(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const today = todayStr()

    const { data: habitRows } = await supabase
      .from('habits')
      .select('id, name')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    const habitIds = (habitRows ?? []).map((h) => h.id)
    const { data: logRows } = habitIds.length
      ? await supabase.from('habit_logs').select('habit_id, log_date, done').in('habit_id', habitIds)
      : { data: [] as { habit_id: string; log_date: string; done: boolean }[] }

    const logsByHabit = new Map<string, { log_date: string; done: boolean }[]>()
    for (const row of logRows ?? []) {
      const list = logsByHabit.get(row.habit_id) ?? []
      list.push(row)
      logsByHabit.set(row.habit_id, list)
    }

    setHabits(
      (habitRows ?? []).map((h) => {
        const logs = logsByHabit.get(h.id) ?? []
        return {
          id: h.id,
          name: h.name,
          doneToday: logs.some((l) => l.log_date === today && l.done),
          streak: computeStreak(logs, today),
        }
      }),
    )
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  async function addHabit(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const { error } = await supabase.from('habits').insert({ user_id: userId, name: trimmed })
    if (error) throw error
    await reload()
  }

  async function removeHabit(id: string) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  async function toggleHabit(id: string) {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return
    const today = todayStr()

    const { error } = habit.doneToday
      ? await supabase.from('habit_logs').delete().eq('habit_id', id).eq('log_date', today)
      : await supabase
          .from('habit_logs')
          .upsert({ habit_id: id, user_id: userId, log_date: today, done: true }, { onConflict: 'habit_id,log_date' })
    if (error) throw error
    await reload()
  }

  return { habits, loading, addHabit, removeHabit, toggleHabit, reload }
}
