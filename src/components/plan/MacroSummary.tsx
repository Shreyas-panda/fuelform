import { Droplets, Flame } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { DailyMacros } from '@/types'

function MacroDonut({ protein, carbs, fat, calories }: { protein: number; carbs: number; fat: number; calories: number }) {
  const size = 148
  const stroke = 15
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const total = protein + carbs + fat || 1
  const gap = 3

  const segments = [
    { val: protein, color: '#60a5fa' },
    { val: carbs,   color: '#fbbf24' },
    { val: fat,     color: '#fb7185' },
  ]

  let accumulated = 0
  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0f172a" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const pct = seg.val / total
          const dash = Math.max(0, pct * circ - gap)
          const offset = -(accumulated / total) * circ
          accumulated += seg.val
          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-black text-slate-100 leading-none">{calories}</div>
        <div className="text-xs text-slate-500 mt-0.5 font-medium">kcal / day</div>
      </div>
    </div>
  )
}

export function MacroSummary({ macros }: { macros: DailyMacros }) {
  const total = macros.protein + macros.carbs + macros.fat || 1

  const macroRows = [
    {
      label: 'Protein',
      value: macros.protein,
      pct: Math.round((macros.protein / total) * 100),
      color: 'bg-blue-400',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/8',
      dot: '#60a5fa',
    },
    {
      label: 'Carbs',
      value: macros.carbs,
      pct: Math.round((macros.carbs / total) * 100),
      color: 'bg-amber-400',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/8',
      dot: '#fbbf24',
    },
    {
      label: 'Fat',
      value: macros.fat,
      pct: Math.round((macros.fat / total) * 100),
      color: 'bg-rose-400',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/8',
      dot: '#fb7185',
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-slate-100 font-bold text-base mb-5 flex items-center gap-2">
        <Flame className="h-4 w-4 text-emerald-400" />
        Daily Macro Targets
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <MacroDonut
          protein={macros.protein}
          carbs={macros.carbs}
          fat={macros.fat}
          calories={macros.calories}
        />

        {/* Macro rows */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {macroRows.map((m) => (
            <div key={m.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${m.border} ${m.bg}`}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.dot }} />
              <div className={`text-sm font-bold ${m.text} w-14 flex-shrink-0`}>{m.label}</div>
              <div className="flex-1 h-1.5 rounded-full bg-slate-800/80">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-700`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <div className="text-slate-200 font-bold text-sm w-12 text-right flex-shrink-0">{m.value}g</div>
              <div className="text-slate-500 text-xs w-9 text-right flex-shrink-0">{m.pct}%</div>
            </div>
          ))}

          {/* Fiber + Water */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
              <Droplets className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 leading-none mb-0.5">Fiber</div>
                <div className="text-slate-200 font-bold text-sm">{macros.fiber}g</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
              <Droplets className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 leading-none mb-0.5">Water</div>
                <div className="text-slate-200 font-bold text-sm">{macros.water}L</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
