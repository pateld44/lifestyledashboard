import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface VitalsHistoryPoint {
  date: string
  sleepHours: number | null
  waterGlasses: number | null
  steps: number | null
  workedOut: boolean
}

function daysAgoStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function useVitalsHistory(userId: string, days = 30) {
  const [points, setPoints] = useState<VitalsHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const since = daysAgoStr(days - 1)
    const { data } = await supabase
      .from('vitals_logs')
      .select('log_date, sleep_hours, water_glasses, steps, worked_out')
      .eq('user_id', userId)
      .gte('log_date', since)
      .order('log_date', { ascending: true })

    setPoints(
      (data ?? []).map((r) => ({
        date: r.log_date,
        sleepHours: r.sleep_hours,
        waterGlasses: r.water_glasses,
        steps: r.steps,
        workedOut: r.worked_out,
      })),
    )
    setLoading(false)
  }, [userId, days])

  useEffect(() => {
    reload()
  }, [reload])

  return { points, loading, reload }
}
