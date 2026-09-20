import { useState } from 'react'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle)
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle)
  const startInner = polarToCartesian(cx, cy, rInner, startAngle)
  const endInner = polarToCartesian(cx, cy, rInner, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ')
}

// Donut chart with a legend list (required for >= 2 categorical series) that
// also doubles as the "visible labels" mitigation the palette validator
// requires for a few of these hues that sit under 3:1 against the surface.
export function CategoryDonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null)

  const size = 200
  const cx = size / 2
  const cy = size / 2
  const rOuter = 90
  const rInner = 55
  const padAngle = slices.length > 1 ? 1.5 : 0

  const arcs = slices.reduce<{ cursor: number; result: Array<DonutSlice & { start: number; end: number }> }>(
    (acc, s) => {
      const sweep = total > 0 ? (s.value / total) * 360 : 0
      const start = acc.cursor + padAngle / 2
      const end = Math.max(acc.cursor + Math.max(sweep - padAngle, 0), start)
      acc.result.push({ ...s, start, end })
      acc.cursor += sweep
      return acc
    },
    { cursor: 0, result: [] },
  ).result

  const centerValue = hover != null ? arcs[hover].value : total
  const centerLabel = hover != null ? arcs[hover].label : 'Total'

  if (total <= 0) {
    return <p className="text-sm text-slate-400">No expenses logged in this window yet.</p>
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Spending by category">
          {arcs.map((s, i) =>
            s.end > s.start ? (
              <path
                key={s.key}
                d={arcPath(cx, cy, rOuter, rInner, s.start, s.end)}
                fill={s.color}
                opacity={hover == null || hover === i ? 1 : 0.35}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ) : null,
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">${centerValue.toFixed(0)}</span>
          <span className="text-[10px] text-slate-400">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex w-full flex-1 flex-col gap-1">
        {arcs.map((s, i) => (
          <li
            key={s.key}
            className="flex items-center justify-between gap-3 rounded px-1.5 py-1 text-xs"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ backgroundColor: hover === i ? 'rgba(148,163,184,0.14)' : undefined }}
          >
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              ${s.value.toFixed(0)}{' '}
              <span className="text-slate-400">({total > 0 ? Math.round((s.value / total) * 100) : 0}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
