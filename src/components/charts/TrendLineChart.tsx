import { useState } from 'react'

export interface TrendPoint {
  date: string
  value: number | null
}

// Single-series small-multiple line chart. No legend box (one color = the
// title already says what's plotted); value labeled only at the line's end,
// per dataviz's "label selectively, never every point" rule.
export function TrendLineChart({
  data,
  color,
  unit = '',
  height = 120,
  goalLine,
}: {
  data: TrendPoint[]
  color: string
  unit?: string
  height?: number
  goalLine?: number
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 600
  const padding = { top: 14, right: 12, bottom: 8, left: 8 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const values = data.map((d) => d.value).filter((v): v is number => v != null)
  const maxV = Math.max(...values, goalLine ?? 0, 1)
  const minV = Math.min(...values, 0)
  const range = maxV - minV || 1

  function x(i: number) {
    return padding.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  }
  function y(v: number) {
    return padding.top + innerH - ((v - minV) / range) * innerH
  }

  const segments: string[] = []
  let current = ''
  data.forEach((d, i) => {
    if (d.value == null) {
      if (current) segments.push(current)
      current = ''
      return
    }
    current += (current ? ' L ' : 'M ') + `${x(i)} ${y(d.value)}`
  })
  if (current) segments.push(current)

  let lastIndex = -1
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].value != null) {
      lastIndex = i
      break
    }
  }
  const lastValue = lastIndex >= 0 ? data[lastIndex].value : null

  const hoverPoint = hoverIndex != null ? data[hoverIndex] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trend over time">
        {goalLine != null && (
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(goalLine)}
            y2={y(goalLine)}
            stroke="currentColor"
            strokeWidth={1}
            className="text-slate-200 dark:text-slate-700"
          />
        )}
        {segments.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {lastIndex >= 0 && lastValue != null && (
          <>
            <circle
              cx={x(lastIndex)}
              cy={y(lastValue)}
              r={5}
              fill={color}
              stroke="currentColor"
              strokeWidth={2}
              className="text-white dark:text-slate-900"
            />
            <text
              x={x(lastIndex)}
              y={Math.max(y(lastValue) - 10, 10)}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {lastValue}
              {unit}
            </text>
          </>
        )}
        {data.map((d, i) =>
          d.value != null ? (
            <circle
              key={i}
              cx={x(i)}
              cy={y(d.value)}
              r={10}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ) : null,
        )}
        {hoverPoint?.value != null && (
          <circle cx={x(hoverIndex!)} cy={y(hoverPoint.value)} r={4} fill={color} className="pointer-events-none" />
        )}
      </svg>
      {hoverPoint?.value != null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white dark:bg-slate-100 dark:text-slate-900"
          style={{ left: `${(x(hoverIndex!) / width) * 100}%` }}
        >
          {hoverPoint.date}: {hoverPoint.value}
          {unit}
        </div>
      )}
      {data.length > 0 && (
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>{data[0].date}</span>
          <span>{data[data.length - 1].date}</span>
        </div>
      )}
    </div>
  )
}
