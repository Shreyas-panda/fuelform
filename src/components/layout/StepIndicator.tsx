import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import type { WizardStep } from '@/types'

const STEPS = [
  { num: 1, label: 'Body Stats' },
  { num: 2, label: 'Your Goal' },
  { num: 3, label: 'Preferences' },
  { num: 4, label: 'Your Plan' },
]

export function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xs sm:max-w-sm mx-auto px-2">
      {STEPS.map((step, idx) => {
        const done = current > step.num
        const active = current === step.num

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 flex-shrink-0',
                  done && 'bg-emerald-500 border-emerald-500 text-slate-900',
                  active && 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/20',
                  !done && !active && 'border-slate-700 text-slate-600 bg-slate-800/50',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : step.num}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium whitespace-nowrap hidden sm:block',
                  active ? 'text-emerald-400' : done ? 'text-slate-400' : 'text-slate-600',
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-px mx-1.5 sm:mx-2 transition-all duration-500',
                  done ? 'bg-emerald-500' : 'bg-slate-700',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
