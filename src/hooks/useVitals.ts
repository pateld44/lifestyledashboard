import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { todayStr } from '../lib/streak'
import type { HealthLog } from '../types'

const defaultLog: HealthLog = { sleepHours: 7, waterGlasses: 0, steps: 0, workedOut: false }

export function useVitals(userId: string) {
  const [vitals, setVitalsState] = useState<HealthLog>(defaultLog)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('vitals_logs')
      .select('sleep_hours, water_glasses, steps, worked_out')
      .eq('user_id', userId)
      .eq('log_date', todayStr())
      .maybeSingle()

    setVitalsState(
      data
        ? {
            sleepHours: data.sleep_hours ?? defaultLog.sleepHours,
            waterGlasses: data.water_glasses ?? defaultLog.waterGlasses,
            steps: data.steps ?? defaultLog.steps,
            workedOut: data.worked_out ?? false,
          }
        : defaultLog,
    )
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  async function setVitals(log: HealthLog) {
    setVitalsState(log)
    await supabase.from('vitals_logs').upsert(
      {
        user_id: userId,
        log_date: todayStr(),
        sleep_hours: log.sleepHours,
        water_glasses: log.waterGlasses,
        steps: log.steps,
        worked_out: log.workedOut,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' },
    )
  }

  return { vitals, loading, setVitals, reload }
}
