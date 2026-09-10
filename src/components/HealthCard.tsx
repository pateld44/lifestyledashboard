import { Card } from './Card'
import type { HealthLog } from '../types'

function Stat({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 rounded-md border border-slate-200 bg-transparent px-2 py-1 text-sm outline-none focus:border-emerald-400 dark:border-slate-700"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  )
}

export function HealthCard({
  log,
  onChange,
}: {
  log: HealthLog
  onChange: (log: HealthLog) => void
}) {
  return (
    <Card title="Health" accent="bg-emerald-500">
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Sleep"
          value={log.sleepHours}
          step={0.5}
          suffix="hrs"
          onChange={(sleepHours) => onChange({ ...log, sleepHours })}
        />
        <Stat
          label="Water"
          value={log.waterGlasses}
          suffix="glasses"
          onChange={(waterGlasses) => onChange({ ...log, waterGlasses })}
        />
        <Stat
          label="Steps"
          value={log.steps}
          step={100}
          suffix="steps"
          onChange={(steps) => onChange({ ...log, steps })}
        />
        <label className="flex items-center gap-2 rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800">
          <input
            type="checkbox"
            checked={log.workedOut}
            onChange={(e) => onChange({ ...log, workedOut: e.target.checked })}
            className="h-4 w-4 accent-emerald-500"
          />
          Worked out today
        </label>
      </div>
    </Card>
  )
}
