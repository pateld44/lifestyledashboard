import { useVitalsHistory } from '../hooks/useVitalsHistory'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useIsDark } from '../hooks/useIsDark'
import { categoryColor, categoryLabel } from '../lib/categories'
import { Card } from './Card'
import { TrendLineChart } from './charts/TrendLineChart'
import { CategoryDonutChart } from './charts/CategoryDonutChart'

const DAYS = 30

export function HistoryView({ userId }: { userId: string }) {
  const { points, loading: vitalsLoading } = useVitalsHistory(userId, DAYS)
  const { byCategory, total, loading: financeLoading } = useExpenseHistory(userId, DAYS)
  const isDark = useIsDark()

  const sleepData = points.map((p) => ({ date: p.date, value: p.sleepHours }))
  const stepsData = points.map((p) => ({ date: p.date, value: p.steps }))
  const waterData = points.map((p) => ({ date: p.date, value: p.waterGlasses }))
  const workoutDays = points.filter((p) => p.workedOut).length

  const slices = byCategory.map((c) => ({
    key: c.category,
    label: categoryLabel(c.category),
    value: c.total,
    color: categoryColor(c.category, isDark),
  }))

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">Last {DAYS} days, rolling window.</p>

      <Card title="Health trends" accent="bg-emerald-500">
        {vitalsLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : points.length === 0 ? (
          <p className="text-sm text-slate-400">No vitals logged in this window yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Sleep (hours)</p>
              <TrendLineChart data={sleepData} color={isDark ? '#34d399' : '#059669'} unit="h" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Steps (goal 8,000)</p>
              <TrendLineChart data={stepsData} color={isDark ? '#34d399' : '#059669'} goalLine={8000} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Water (glasses)</p>
              <TrendLineChart data={waterData} color={isDark ? '#34d399' : '#059669'} unit=" glasses" />
            </div>
            <div className="flex flex-col justify-center rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Workouts</span>
              <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {workoutDays} <span className="text-sm font-normal text-slate-400">/ {points.length} days logged</span>
              </span>
            </div>
          </div>
        )}
      </Card>

      <Card title="Spending by category" accent="bg-amber-500">
        {financeLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <CategoryDonutChart slices={slices} total={total} />
        )}
      </Card>
    </div>
  )
}
