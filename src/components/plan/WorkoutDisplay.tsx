import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ExternalLink, Play, RefreshCw, TrendingUp, Coffee } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useDietStore } from '@/store/useDietStore'
import type { Exercise, WorkoutDay } from '@/types'
import { clsx } from 'clsx'

type BadgeColor = 'blue' | 'emerald' | 'amber' | 'red' | 'rose' | 'slate'

const MUSCLE_BADGE_MAP: Record<string, BadgeColor> = {
  chest: 'blue',
  back: 'emerald',
  shoulders: 'amber',
  biceps: 'slate',
  triceps: 'slate',
  legs: 'rose',
  glutes: 'rose',
  core: 'amber',
  'full body': 'emerald',
  cardio: 'red',
}

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearchQuery)}`

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 min-h-[56px] text-left hover:bg-slate-700/20 transition-colors"
      >
        <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-100 font-semibold text-sm">{exercise.name}</span>
            <Badge variant={MUSCLE_BADGE_MAP[exercise.muscleGroup] ?? 'slate'} size="sm">
              {exercise.muscleGroup}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
            <span>{exercise.sets} sets × {exercise.reps}</span>
            <span>·</span>
            <span>Rest: {exercise.rest}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 min-w-[36px] min-h-[36px] px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
          >
            <Play className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Watch</span>
          </a>
          <ChevronDown
            className={clsx('h-4 w-4 text-slate-500 transition-transform duration-300 flex-shrink-0', expanded && 'rotate-180')}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 flex flex-col gap-3">
              {/* Form tip */}
              <div className="flex gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide whitespace-nowrap mt-0.5">Form</span>
                <p className="text-slate-300 text-sm">{exercise.tips}</p>
              </div>

              {/* YouTube link */}
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch tutorial: "{exercise.youtubeSearchQuery}"
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function WorkoutDayCard({ day, index }: { day: WorkoutDay; index: number }) {
  const [open, setOpen] = useState(index === 0 && !day.isRestDay)

  if (day.isRestDay) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        <Card className="p-4 opacity-60 border-dashed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/40 flex items-center justify-center">
              <Coffee className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <div className="text-slate-400 font-semibold">{day.day}</div>
              <div className="text-slate-600 text-xs">{day.focus}</div>
            </div>
            <span className="ml-auto"><Badge variant="slate" size="sm">Rest</Badge></span>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card spotlight className="overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 min-h-[56px] text-left hover:bg-slate-700/20 transition-colors"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-100 font-bold truncate">{day.day}</div>
            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5 flex-wrap">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{day.estimatedDuration}</span>
              <span className="text-slate-600">·</span>
              <span className="truncate">{day.focus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-500 text-xs hidden sm:block">{day.exercises.length} exercises</span>
            <ChevronDown
              className={clsx('h-4 w-4 text-slate-500 transition-transform duration-300 flex-shrink-0', open && 'rotate-180')}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-slate-700/60 pt-4 flex flex-col gap-3">
                {/* Warmup */}
                {day.warmup && (
                  <div className="flex gap-2 text-xs p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-amber-400 font-bold uppercase tracking-wide whitespace-nowrap">Warm-up</span>
                    <span className="text-slate-400">{day.warmup}</span>
                  </div>
                )}

                {/* Exercises */}
                <div className="flex flex-col gap-2">
                  {day.exercises.map((ex, i) => (
                    <ExerciseRow key={`${ex.name}-${i}`} exercise={ex} index={i} />
                  ))}
                </div>

                {/* Cooldown */}
                {day.cooldown && (
                  <div className="flex gap-2 text-xs p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold uppercase tracking-wide whitespace-nowrap">Cool-down</span>
                    <span className="text-slate-400">{day.cooldown}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export function WorkoutDisplay() {
  const { workoutPlan, workoutStatus, generateWorkout, userGoal } = useDietStore()

  // Auto-generate on first view
  useEffect(() => {
    if (workoutStatus === 'idle') {
      generateWorkout()
    }
  }, [])

  if (workoutStatus === 'idle' || workoutStatus === 'generating') {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Spinner className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <div>
          <p className="text-slate-200 font-semibold">Generating your workout plan...</p>
          <p className="text-slate-500 text-sm mt-1">Building your {userGoal?.type} training split</p>
        </div>
      </div>
    )
  }

  if (workoutStatus === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-slate-400">Couldn't generate the workout plan.</p>
        <Button onClick={() => generateWorkout()}>
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  if (!workoutPlan) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">Weekly Training Plan</p>
            <h3 className="text-2xl font-black text-slate-100 mb-2">
              <span className="capitalize bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {workoutPlan.split}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">{workoutPlan.daysPerWeek} days/week</Badge>
              <Badge variant="slate">{workoutPlan.goal}</Badge>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => generateWorkout()}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
        </div>

        {workoutPlan.generalAdvice && (
          <p className="text-slate-400 text-sm mt-4 pt-4 border-t border-slate-700/60 leading-relaxed">
            {workoutPlan.generalAdvice}
          </p>
        )}
      </Card>

      {/* Weekly schedule */}
      <div className="flex flex-col gap-3">
        <h4 className="text-slate-300 font-bold text-sm uppercase tracking-widest px-1">Weekly Schedule</h4>
        {workoutPlan.days.map((day, i) => (
          <WorkoutDayCard key={`${day.day}-${i}`} day={day} index={i} />
        ))}
      </div>

      {/* Progression tips */}
      {workoutPlan.progressionTips.length > 0 && (
        <Card className="p-5">
          <h4 className="text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Progressive Overload Tips
          </h4>
          <ul className="flex flex-col gap-2">
            {workoutPlan.progressionTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">·</span> {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  )
}
