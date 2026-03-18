import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, CalendarDays, TrendingUp, Utensils, Dumbbell, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useDietStore } from '@/store/useDietStore'
import { clsx } from 'clsx'

interface TrackerDay {
  meals: Record<string, boolean>
  exercises: Record<string, boolean>
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateKey(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

function formatDayLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function loadDay(dateKey: string): TrackerDay {
  try {
    const raw = localStorage.getItem(`fuelform_tracker_${dateKey}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { meals: {}, exercises: {} }
}

function saveDay(dateKey: string, data: TrackerDay) {
  localStorage.setItem(`fuelform_tracker_${dateKey}`, JSON.stringify(data))
}

function ProgressRing({ pct, size = 64, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#3b82f6'}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

export function GoalTracker() {
  const { dietPlan, workoutPlan, workoutStatus } = useDietStore()
  const [view, setView] = useState<'daily' | 'weekly'>('daily')
  const [tracker, setTracker] = useState<TrackerDay>(() => loadDay(todayKey()))

  useEffect(() => {
    saveDay(todayKey(), tracker)
  }, [tracker])

  if (!dietPlan) return null

  const { meals } = dietPlan

  // Get today's workout day (cycle through workout days)
  const todayWorkoutDay = workoutPlan?.days.find((d) => !d.isRestDay) ?? null

  const totalMeals = meals.length
  const completedMeals = meals.filter((m) => tracker.meals[m.id]).length

  const totalExercises = todayWorkoutDay?.exercises.length ?? 0
  const completedExercises = workoutPlan
    ? (todayWorkoutDay?.exercises.filter((_, i) => tracker.exercises[`today_${i}`]) ?? []).length
    : 0

  const totalItems = totalMeals + totalExercises
  const completedItems = completedMeals + completedExercises
  const overallPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  function toggleMeal(id: string) {
    setTracker((prev) => ({
      ...prev,
      meals: { ...prev.meals, [id]: !prev.meals[id] },
    }))
  }

  function toggleExercise(key: string) {
    setTracker((prev) => ({
      ...prev,
      exercises: { ...prev.exercises, [key]: !prev.exercises[key] },
    }))
  }

  // Weekly data: last 7 days
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const key = formatDateKey(i)
    const day = loadDay(key)
    const mTotal = meals.length
    const mDone = Object.values(day.meals).filter(Boolean).length
    const eDone = Object.values(day.exercises).filter(Boolean).length
    const eTotal = todayWorkoutDay?.exercises.length ?? 0
    const total = mTotal + (i === 0 ? eTotal : 0)
    const done = mDone + (i === 0 ? eDone : 0)
    return {
      key,
      label: formatDayLabel(key),
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
      mealsCompleted: mDone,
      mealsTotal: mTotal,
    }
  }).reverse()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Beta badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        Goal Tracker — Free during beta. Track your daily meals and workouts, tick off what you complete.
      </div>

      {/* Overall progress card */}
      <Card className="p-5">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <ProgressRing pct={overallPct} size={72} stroke={6} />
            <span className="absolute text-sm font-black text-slate-100">{overallPct}%</span>
          </div>
          <div>
            <div className="text-slate-100 font-bold text-lg">Today's Progress</div>
            <div className="text-slate-400 text-sm mt-0.5">
              {completedItems} of {totalItems} goals completed
            </div>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-blue-400">{completedMeals}/{totalMeals} meals</span>
              {totalExercises > 0 && (
                <span className="text-emerald-400">{completedExercises}/{totalExercises} exercises</span>
              )}
            </div>
          </div>
          {overallPct === 100 && (
            <div className="ml-auto text-2xl">🎉</div>
          )}
        </div>
      </Card>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/60">
        {(['daily', 'weekly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
              view === v
                ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
            )}
          >
            {v === 'daily' ? <Utensils className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Daily view */}
      {view === 'daily' && (
        <div className="flex flex-col gap-4">
          {/* Meals checklist */}
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-400" /> Meals
            </h3>
            {meals.map((meal) => {
              const done = !!tracker.meals[meal.id]
              return (
                <button
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left w-full',
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/8'
                      : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600',
                  )}
                >
                  {done
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    : <Circle className="h-5 w-5 text-slate-600 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className={clsx('text-sm font-semibold', done ? 'line-through text-slate-500' : 'text-slate-200')}>
                      {meal.name}
                    </div>
                    <div className="text-xs text-slate-500">{meal.time} · {meal.totalCalories} kcal</div>
                  </div>
                </button>
              )
            })}
          </Card>

          {/* Workout checklist */}
          {workoutStatus === 'success' && todayWorkoutDay ? (
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-blue-400" /> Workout — {todayWorkoutDay.focus}
              </h3>
              {todayWorkoutDay.exercises.map((ex, i) => {
                const key = `today_${i}`
                const done = !!tracker.exercises[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleExercise(key)}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left w-full',
                      done
                        ? 'border-blue-500/30 bg-blue-500/5'
                        : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600',
                    )}
                  >
                    {done
                      ? <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      : <Circle className="h-5 w-5 text-slate-600 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className={clsx('text-sm font-semibold', done ? 'line-through text-slate-500' : 'text-slate-200')}>
                        {ex.name}
                      </div>
                      <div className="text-xs text-slate-500">{ex.sets} sets × {ex.reps} · {ex.muscleGroup}</div>
                    </div>
                  </button>
                )
              })}
            </Card>
          ) : workoutStatus !== 'success' ? (
            <Card className="p-5 flex items-center gap-3 text-slate-500 text-sm">
              <Dumbbell className="h-4 w-4" />
              Generate your Workout Plan first to track exercises here.
            </Card>
          ) : null}
        </div>
      )}

      {/* Weekly view */}
      {view === 'weekly' && (
        <div className="flex flex-col gap-3">
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Last 7 Days
            </h3>
            {weekData.map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-400 flex-shrink-0 truncate">{day.label}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      day.pct >= 100 ? 'bg-emerald-500' : day.pct >= 50 ? 'bg-amber-400' : 'bg-slate-600',
                    )}
                    style={{ width: `${day.pct}%` }}
                  />
                </div>
                <div className="w-10 text-xs text-right font-bold text-slate-400 flex-shrink-0">{day.pct}%</div>
                <div className="w-14 text-xs text-right text-slate-600 flex-shrink-0">{day.mealsCompleted}/{day.mealsTotal} meals</div>
              </div>
            ))}
          </Card>

          {/* Premium teaser */}
          <Card className="p-5 border-dashed border-slate-700/60 bg-slate-900/20">
            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-300 font-semibold text-sm">Monthly Goal View — Coming Soon</div>
                <div className="text-slate-500 text-xs mt-1">30-day calendar heatmap, streak tracking, and milestone badges. Part of the Active plan.</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
