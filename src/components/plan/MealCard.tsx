import { useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { IngredientList } from './IngredientList'
import type { Meal } from '@/types'
import { clsx } from 'clsx'

export function MealCard({ meal, index }: { meal: Meal; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card spotlight className="overflow-hidden">
        {/* Header — always visible */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/20 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <div className="text-slate-100 font-bold">{meal.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Clock className="h-3 w-3" />
                {meal.time}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Meal macro pills */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="text-slate-300 font-bold">{meal.totalCalories} <span className="text-slate-600 font-normal">kcal</span></span>
              <span className="text-blue-400">{meal.totalProtein}g P</span>
              <span className="text-amber-400">{meal.totalCarbs}g C</span>
              <span className="text-rose-400">{meal.totalFat}g F</span>
            </div>
            <ChevronDown
              className={clsx('h-4 w-4 text-slate-500 transition-transform duration-300', open && 'rotate-180')}
            />
          </div>
        </button>

        {/* Mobile macro strip */}
        <div className="sm:hidden flex items-center gap-3 px-5 pb-3 text-xs">
          <span className="text-slate-300 font-bold">{meal.totalCalories} kcal</span>
          <span className="text-blue-400">{meal.totalProtein}g P</span>
          <span className="text-amber-400">{meal.totalCarbs}g C</span>
          <span className="text-rose-400">{meal.totalFat}g F</span>
        </div>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-700/60 pt-4">
                <IngredientList ingredients={meal.ingredients} />

                {meal.preparationNotes && (
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
                    <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Prep</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{meal.preparationNotes}</p>
                  </div>
                )}

                {meal.alternates && meal.alternates.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <span className="h-px flex-1 bg-slate-700/60" />
                      Flex Swaps
                      <span className="h-px flex-1 bg-slate-700/60" />
                    </div>
                    {meal.alternates.map((alt, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-emerald-500/20 transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-slate-400">Option {i + 1}</span>
                          <span className="text-sm text-slate-300">{alt.name || alt.foods}</span>
                          {alt.name && alt.foods && alt.name !== alt.foods && (
                            <span className="text-xs text-slate-500">{alt.foods}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-xs">
                          <span className="text-slate-300 font-bold">{alt.kcal} <span className="text-slate-600 font-normal">kcal</span></span>
                          <div className="flex gap-2">
                            <span className="text-blue-400">{alt.protein}g P</span>
                            <span className="text-amber-400">{alt.carbs}g C</span>
                            <span className="text-rose-400">{alt.fat}g F</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
