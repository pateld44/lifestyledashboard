import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface CategoryTotal {
  category: string
  total: number
}

function daysAgoStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function useExpenseHistory(userId: string, days = 30) {
  const [byCategory, setByCategory] = useState<CategoryTotal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const since = daysAgoStr(days - 1)
    const { data } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', userId)
      .gte('log_date', since)

    const totals = new Map<string, number>()
    let sum = 0
    for (const row of data ?? []) {
      const key = row.category || 'general'
      totals.set(key, (totals.get(key) ?? 0) + row.amount)
      sum += row.amount
    }

    setByCategory(
      [...totals.entries()]
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total),
    )
    setTotal(sum)
    setLoading(false)
  }, [userId, days])

  useEffect(() => {
    reload()
  }, [reload])

  return { byCategory, total, loading, reload }
}
