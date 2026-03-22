import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, CalendarDays, TrendingUp, Utensils,
  Dumbbell, RefreshCw, Trophy, ChevronDown,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDietStore } from '@/store/useDietStore'
import { clsx } from 'clsx'

interface TrackerDay {
  meals: Record<string, boolean>
  exercises: Record<string, boolean>
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getDateKey(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function formatLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function shortDayLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
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
  const color = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#3b82f6'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

export function GoalTracker() {
  const { dietPlan, workoutPlan, workoutStatus, generatePlan, setAppView } = useDietStore()
  const [view, setView] = useState<'daily' | 'weekly'>('daily')
  const [todayTracker, setTodayTracker] = useState<TrackerDay>(() => loadDay(todayKey()))
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [weekTrackers, setWeekTrackers] = useState<Record<string, TrackerDay>>({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [prevPct, setPrevPct] = useState(0)

  // Persist today's tracker
  useEffect(() => {
    saveDay(todayKey(), todayTracker)
  }, [todayTracker])

  // Load week trackers when weekly view opens
  useEffect(() => {
    if (view === 'weekly') {
      const data: Record<string, TrackerDay> = {}
      for (let i = 0; i < 7; i++) {
        const key = getDateKey(i)
        data[key] = loadDay(key)
      }
      setWeekTrackers(data)
    }
  }, [view])

  if (!dietPlan) return null

  const { meals } = dietPlan
  const todayWorkoutDay = workoutPlan?.days.find((d) => !d.isRestDay) ?? null
  const totalMeals = meals.length
  const completedMeals = meals.filter((m) => todayTracker.meals[m.id]).length
  const totalExercises = todayWorkoutDay?.exercises.length ?? 0
  const completedExercises = todayWorkoutDay?.exercises.filter((_, i) => todayTracker.exercises[`today_${i}`]).length ?? 0
  const totalItems = totalMeals + totalExercises
  const completedItems = completedMeals + completedExercises
  const overallPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  // Trigger celebration when 100% is first reached
  useEffect(() => {
    if (overallPct === 100 && prevPct < 100) {
      setShowCelebration(true)
    }
    setPrevPct(overallPct)
  }, [overallPct])

  function toggleMeal(id: string) {
    setTodayTracker((prev) => ({ ...prev, meals: { ...prev.meals, [id]: !prev.meals[id] } }))
  }

  function toggleExercise(key: string) {
    setTodayTracker((prev) => ({ ...prev, exercises: { ...prev.exercises, [key]: !prev.exercises[key] } }))
  }

  function toggleWeekMeal(dateKey: string, mealId: string) {
    const current = weekTrackers[dateKey] ?? { meals: {}, exercises: {} }
    const updated = { ...current, meals: { ...current.meals, [mealId]: !current.meals[mealId] } }
    saveDay(dateKey, updated)
    setWeekTrackers((prev) => ({ ...prev, [dateKey]: updated }))
    if (dateKey === todayKey()) setTodayTracker(updated)
  }

  // Build 7-day week data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const key = getDateKey(6 - i) // oldest first
    const tracker = weekTrackers[key] ?? loadDay(key)
    const mDone = meals.filter((m) => tracker.meals[m.id]).length
    const eDone = Object.values(tracker.exercises).filter(Boolean).length
    const eTotal = i === 6 ? totalExercises : 0 // only count exercises for today
    const total = totalMeals + eTotal
    const done = mDone + (i === 6 ? eDone : 0)
    return {
      key,
      label: formatLabel(key),
      short: shortDayLabel(key),
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
      mealsCompleted: mDone,
      mealsTotal: totalMeals,
      isToday: key === todayKey(),
      isFuture: false,
    }
  })

  // Weekly summary stats
  const weeklyMealsCompleted = weekDays.reduce((s, d) => s + d.mealsCompleted, 0)
  const weeklyMealsTotal = weekDays.reduce((s, d) => s + d.mealsTotal, 0)
  const streak = (() => {
    let s = 0
    for (let i = weekDays.length - 1; i >= 0; i--) {
      if (weekDays[i].pct >= 100) s++
      else break
    }
    return s
  })()

  function handleRegenerate() {
    // Clear today's tracker from localStorage so fresh plan starts with clean slate
    localStorage.removeItem(`fuelform_tracker_${todayKey()}`)
    setTodayTracker({ meals: {}, exercises: {} })
    setShowCelebration(false)
    setAppView('wizard')
    generatePlan()
  }

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
        Goal Tracker — Free during beta. Tick off meals and workouts as you complete them each day.
      </div>

      {/* Overall progress card */}
      <Card className={clsx('p-5 transition-all duration-500', overallPct === 100 && 'border-emerald-500/40 bg-emerald-500/5')}>
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <ProgressRing pct={overallPct} size={72} stroke={6} />
            <span className="absolute text-sm font-black text-slate-100">{overallPct}%</span>
          </div>
          <div className="flex-1">
            <div className="text-slate-100 font-bold text-lg">
              {overallPct === 100 ? "Today's goal crushed! 🎉" : "Today's Progress"}
            </div>
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
        </div>
      </Card>

      {/* Goal hit celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                  <Trophy className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-100">You crushed today's goal!</div>
                  <div className="text-slate-400 text-sm mt-1">
                    {completedMeals} meals eaten · {completedExercises > 0 ? `${completedExercises} exercises done` : 'Keep going!'}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Tomorrow same plan continues — or regenerate for variety</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button variant="secondary" onClick={() => setShowCelebration(false)} className="flex-1">
                    Continue with This Plan
                  </Button>
                  <Button onClick={handleRegenerate} className="flex-1">
                    <RefreshCw className="h-4 w-4" /> Regenerate a New Plan
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
            {v === 'daily' ? 'Daily' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* ── Daily View ─────────────────────────────────────────── */}
      {view === 'daily' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-400" /> Meals
            </h3>
            {meals.map((meal) => {
              const done = !!todayTracker.meals[meal.id]
              return (
                <button
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-3 min-h-[52px] rounded-xl border transition-all duration-200 text-left w-full',
                    done ? 'border-emerald-500/30 bg-emerald-500/8' : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600',
                  )}
                >
                  {done
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    : <Circle className="h-5 w-5 text-slate-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className={clsx('text-sm font-semibold truncate', done ? 'line-through text-slate-500' : 'text-slate-200')}>{meal.name}</div>
                    <div className="text-xs text-slate-500 truncate">{meal.time} · {meal.totalCalories} kcal · {meal.totalProtein}g protein</div>
                  </div>
                </button>
              )
            })}
          </Card>

          {workoutStatus === 'success' && todayWorkoutDay ? (
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-blue-400" /> Workout — {todayWorkoutDay.focus}
              </h3>
              {todayWorkoutDay.exercises.map((ex, i) => {
                const key = `today_${i}`
                const done = !!todayTracker.exercises[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleExercise(key)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 min-h-[52px] rounded-xl border transition-all duration-200 text-left w-full',
                      done ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600',
                    )}
                  >
                    {done
                      ? <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      : <Circle className="h-5 w-5 text-slate-600 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={clsx('text-sm font-semibold truncate', done ? 'line-through text-slate-500' : 'text-slate-200')}>{ex.name}</div>
                      <div className="text-xs text-slate-500 truncate">{ex.sets} sets × {ex.reps} · {ex.muscleGroup}</div>
                    </div>
                  </button>
                )
              })}
            </Card>
          ) : (
            <Card className="p-4 flex items-center gap-3 text-slate-500 text-sm border-dashed">
              <Dumbbell className="h-4 w-4 flex-shrink-0" />
              Go to the Workout Plan tab first to generate your workout, then track it here.
            </Card>
          )}
        </div>
      )}

      {/* ── Weekly View ─────────────────────────────────────────── */}
      {view === 'weekly' && (
        <div className="flex flex-col gap-4">
          {/* Weekly summary stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{weeklyMealsCompleted}</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-tight">Meals</div>
              <div className="text-xs text-slate-600 mt-0.5">of {weeklyMealsTotal}</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{streak}</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-tight">Streak</div>
              <div className="text-xs text-slate-600 mt-0.5">100% days</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-blue-400">{weekDays.filter((d) => d.pct > 0).length}</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-tight">Active</div>
              <div className="text-xs text-slate-600 mt-0.5">this week</div>
            </Card>
          </div>

          {/* 7-day expandable list */}
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> This Week
            </h3>
            {weekDays.map((day) => {
              const isExpanded = expandedDay === day.key
              const dayTracker = day.key === todayKey() ? todayTracker : (weekTrackers[day.key] ?? loadDay(day.key))
              return (
                <div key={day.key} className={clsx('rounded-xl border overflow-hidden transition-colors', day.isToday ? 'border-emerald-500/30' : 'border-slate-700/50')}>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] hover:bg-slate-800/30 transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <ProgressRing pct={day.pct} size={36} stroke={3} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300" style={{ fontSize: '9px' }}>{day.pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={clsx('text-sm font-semibold', day.isToday ? 'text-emerald-400' : 'text-slate-200')}>{day.label}</span>
                        {day.pct === 100 && <span className="text-sm leading-none">✅</span>}
                        {day.isToday && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold flex-shrink-0">Today</span>}
                      </div>
                      <div className="text-xs text-slate-500">{day.mealsCompleted}/{day.mealsTotal} meals completed</div>
                    </div>
                    <ChevronDown className={clsx('h-4 w-4 text-slate-600 transition-transform duration-200 flex-shrink-0', isExpanded && 'rotate-180')} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-slate-700/40 flex flex-col gap-2">
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Meals</p>
                          {meals.map((meal) => {
                            const done = !!dayTracker.meals[meal.id]
                            return (
                              <button
                                key={meal.id}
                                onClick={() => toggleWeekMeal(day.key, meal.id)}
                                className={clsx(
                                  'flex items-center gap-3 px-2.5 py-2.5 min-h-[44px] rounded-lg border transition-all duration-150 text-left w-full',
                                  done ? 'border-emerald-500/25 bg-emerald-500/6' : 'border-slate-700/40 bg-slate-900/30 hover:border-slate-600',
                                )}
                              >
                                {done
                                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                  : <Circle className="h-4 w-4 text-slate-600 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <div className={clsx('text-xs font-semibold truncate', done ? 'line-through text-slate-500' : 'text-slate-300')}>{meal.name}</div>
                                  <div className="text-xs text-slate-600 truncate">{meal.time} · {meal.totalCalories} kcal</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </Card>
        </div>
      )}
    </motion.div>
  )
}
