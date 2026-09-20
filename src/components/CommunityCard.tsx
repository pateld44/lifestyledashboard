import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { computeStreak, todayStr } from '../lib/streak'
import { Card } from './Card'

interface CommunityMember {
  id: string
  displayName: string
  avatarUrl: string | null
  bestStreak: number
  steps: number | null
  workedOut: boolean
}

export function CommunityCard({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const today = todayStr()

      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url')
        .neq('id', currentUserId)

      if (!profiles?.length) {
        if (!cancelled) {
          setMembers([])
          setLoading(false)
        }
        return
      }

      const ids = profiles.map((p) => p.id)

      const [{ data: habits }, { data: logs }, { data: vitals }] = await Promise.all([
        supabase.from('habits').select('id, user_id').in('user_id', ids).is('archived_at', null),
        supabase.from('habit_logs').select('habit_id, user_id, log_date, done').in('user_id', ids),
        supabase.from('vitals_logs').select('user_id, steps, worked_out').in('user_id', ids).eq('log_date', today),
      ])

      const result: CommunityMember[] = profiles.map((p) => {
        const theirHabitIds = new Set((habits ?? []).filter((h) => h.user_id === p.id).map((h) => h.id))
        const bestStreak = [...theirHabitIds].reduce((max, habitId) => {
          const habitLogs = (logs ?? []).filter((l) => l.habit_id === habitId)
          return Math.max(max, computeStreak(habitLogs, today))
        }, 0)
        const theirVitals = (vitals ?? []).find((v) => v.user_id === p.id)

        return {
          id: p.id,
          displayName: p.display_name || 'Someone',
          avatarUrl: p.avatar_url,
          bestStreak,
          steps: theirVitals?.steps ?? null,
          workedOut: theirVitals?.worked_out ?? false,
        }
      })

      if (!cancelled) {
        setMembers(result)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [currentUserId])

  return (
    <Card title="Community" accent="bg-sky-500">
      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {!loading && members.length === 0 && (
        <p className="text-sm text-slate-400">No other invited users yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                  {m.displayName[0]?.toUpperCase()}
                </span>
              )}
              <span className="text-sm text-slate-700 dark:text-slate-200">{m.displayName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>🔥 {m.bestStreak}</span>
              {m.steps != null && <span>{m.steps.toLocaleString()} steps</span>}
              {m.workedOut && <span>💪</span>}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-400">Habits &amp; vitals only — budgets stay private.</p>
    </Card>
  )
}
