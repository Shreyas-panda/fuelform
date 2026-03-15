import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CalendarDays, Lightbulb, RefreshCw, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDietStore } from '@/store/useDietStore'
import type { MonthlyWeek } from '@/types'
import { clsx } from 'clsx'

const WEEK_COLORS = [
  { accent: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-400' },
  { accent: 'text-cyan-400',    border: 'border-cyan-500/20',    bg: 'bg-cyan-500/5',    badge: 'bg-cyan-500/15 text-cyan-400'    },
  { accent: 'text-violet-400',  border: 'border-violet-500/20',  bg: 'bg-violet-500/5',  badge: 'bg-violet-500/15 text-violet-400' },
  { accent: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/5',   badge: 'bg-amber-500/15 text-amber-400'  },
]

function WeekCard({ week, defaultOpen }: { week: MonthlyWeek; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const color = WEEK_COLORS[(week.week - 1) % 4]

  return (
    <Card className={clsx('overflow-hidden border', color.border)}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-full', color.badge)}>
            Week {week.week}
          </span>
          <div className="text-left">
            <div className={clsx('font-bold text-sm', color.accent)}>{week.theme}</div>
            <div className="text-slate-500 text-xs mt-0.5">{week.focus}</div>
          </div>
        </div>
        <ChevronDown
          className={clsx('h-4 w-4 text-slate-500 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={clsx('px-5 pb-5 pt-1 flex flex-col gap-4', color.bg)}>

              {/* Sample day meals */}
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Sample Day Schedule
                </p>
                <div className="flex flex-col gap-2">
                  {week.meals.map((meal, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60"
                    >
                      <div className={clsx('text-xs font-bold min-w-[80px]', color.accent)}>
                        {meal.name}
                      </div>
                      <div className="flex-1">
                        <div className="text-slate-200 text-sm">{meal.foods}</div>
                      </div>
                      <div className="text-slate-500 text-xs whitespace-nowrap">{meal.kcal} kcal</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key changes */}
              {week.keyChanges.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    {week.week === 1 ? 'Baseline Notes' : 'Changes vs Previous Week'}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {week.keyChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className={clsx('mt-0.5 font-bold', color.accent)}>·</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export function MonthlyPlanDisplay() {
  const { monthlyStatus, monthlyPlan, generateMonthly } = useDietStore()

  useEffect(() => {
    if (monthlyStatus === 'idle') {
      generateMonthly()
    }
  }, [monthlyStatus, generateMonthly])

  if (monthlyStatus === 'idle' || monthlyStatus === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm">Building your 4-week monthly plan…</p>
      </div>
    )
  }

  if (monthlyStatus === 'error' || !monthlyPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-slate-400 text-sm">Failed to generate monthly plan.</p>
        <Button size="sm" onClick={generateMonthly}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Intro card */}
      <Card className="p-5 border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
        <div className="flex items-start gap-3">
          <CalendarDays className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-slate-100 font-bold text-sm mb-1">4-Week Progressive Diet Plan</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Each week rotates different foods within your chosen cuisine to prevent dietary boredom and metabolic adaptation — while keeping the same daily calorie and macro targets.
            </p>
          </div>
        </div>
      </Card>

      {/* Week cards */}
      {monthlyPlan.weeks.map((week, i) => (
        <WeekCard key={week.week} week={week} defaultOpen={i === 0} />
      ))}

      {/* Monthly tips */}
      {monthlyPlan.monthlyTips.length > 0 && (
        <Card className="p-5">
          <h4 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" /> Monthly Strategy Tips
          </h4>
          <ul className="flex flex-col gap-2">
            {monthlyPlan.monthlyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-amber-500 mt-0.5">·</span> {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button variant="secondary" size="sm" onClick={generateMonthly} className="self-center">
        <RefreshCw className="h-4 w-4" /> Regenerate Monthly Plan
      </Button>
    </motion.div>
  )
}
