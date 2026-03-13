import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max: number
  color?: 'emerald' | 'blue' | 'amber' | 'rose'
  label?: string
  showValue?: boolean
}

export function ProgressBar({ value, max, color = 'emerald', label, showValue }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="flex flex-col gap-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          {showValue && <span className="text-slate-300 font-semibold">{value}g</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', {
            'bg-emerald-400': color === 'emerald',
            'bg-blue-400': color === 'blue',
            'bg-amber-400': color === 'amber',
            'bg-rose-400': color === 'rose',
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
