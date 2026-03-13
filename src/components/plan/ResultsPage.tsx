import { motion } from 'framer-motion'
import { Printer, RefreshCw, Pill, Lightbulb, CalendarDays, Droplets, Utensils, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MacroSummary } from './MacroSummary'
import { MealCard } from './MealCard'
import { WorkoutDisplay } from './WorkoutDisplay'
import { useDietStore } from '@/store/useDietStore'
import { clsx } from 'clsx'
import type { ResultTab } from '@/types'

const GOAL_BADGE: Record<string, 'blue' | 'rose' | 'emerald'> = {
  bulking: 'blue',
  shredding: 'rose',
  maintenance: 'emerald',
}

const BMI_BADGE: Record<string, 'blue' | 'emerald' | 'amber' | 'red'> = {
  underweight: 'blue',
  normal: 'emerald',
  overweight: 'amber',
  obese: 'red',
}

const TABS: { id: ResultTab; label: string; icon: React.ReactNode }[] = [
  { id: 'diet', label: 'Diet Plan', icon: <Utensils className="h-4 w-4" /> },
  { id: 'workout', label: 'Workout Plan', icon: <Dumbbell className="h-4 w-4" /> },
]

export function ResultsPage() {
  const { dietPlan, resultTab, setResultTab, resetAll } = useDietStore()

  if (!dietPlan) return null

  const { userProfile, goal, bmiResult, dailyTargetMacros, meals, supplementStack, hydrationTips, generalTips, weeklyVariationNote } = dietPlan

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-6 print:gap-4"
    >
      {/* ── Plan hero header ─────────────────────────────────────────── */}
      <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/60 print:border-none">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">Your Personalised Plan</p>
            <h2 className="text-3xl font-black text-slate-100 mb-3">
              {userProfile.name}'s{' '}
              <span className="capitalize bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {goal.type}
              </span>{' '}
              Plan
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant={GOAL_BADGE[goal.type]}>{goal.type}</Badge>
              <Badge variant={BMI_BADGE[bmiResult.category]}>
                BMI {bmiResult.bmi} · {bmiResult.category}
              </Badge>
              <Badge variant="slate">{dailyTargetMacros.calories} kcal/day</Badge>
            </div>
          </div>

          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RefreshCw className="h-4 w-4" /> New Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/60 print:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setResultTab(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
              resultTab === tab.id
                ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {resultTab === 'diet' ? (
        <motion.div
          key="diet"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <MacroSummary macros={dailyTargetMacros} />

          <div className="flex flex-col gap-1">
            <h3 className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-3 px-1">
              {meals.length} Meals · Daily Schedule
            </h3>
            <div className="flex flex-col gap-3">
              {meals.map((meal, i) => (
                <MealCard key={meal.id} meal={meal} index={i} />
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supplementStack.length > 0 && (
              <Card className="p-5">
                <h4 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-400" /> Supplement Stack
                </h4>
                <ul className="flex flex-col gap-2">
                  {supplementStack.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-emerald-500 mt-0.5">·</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {hydrationTips.length > 0 && (
              <Card className="p-5">
                <h4 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-400" /> Hydration Tips
                </h4>
                <ul className="flex flex-col gap-2">
                  {hydrationTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-cyan-500 mt-0.5">·</span> {t}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {generalTips.length > 0 && (
              <Card className="p-5 sm:col-span-2">
                <h4 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" /> Pro Tips
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {generalTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-amber-500 mt-0.5">·</span> {t}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {weeklyVariationNote && (
              <Card className="p-5 sm:col-span-2 border-emerald-500/20 bg-emerald-500/5">
                <h4 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Training vs Rest Day Adjustment
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">{weeklyVariationNote}</p>
              </Card>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="workout"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <WorkoutDisplay />
        </motion.div>
      )}

      <Button variant="secondary" onClick={resetAll} className="w-full print:hidden">
        <RefreshCw className="h-4 w-4" /> Start Over — Generate a New Plan
      </Button>
    </motion.div>
  )
}
