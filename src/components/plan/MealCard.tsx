import { useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { IngredientList } from './IngredientList'
import type { Meal } from '@/types'
import { clsx } from 'clsx'

function FlexSwapsSection({ alternates }: { alternates: NonNullable<Meal['alternates']> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
        <span className="h-px flex-1 bg-slate-700/60" />
        <span className="flex items-center gap-1.5">⚡ Flex Swaps</span>
        <span className="h-px flex-1 bg-slate-700/60" />
      </div>
      {alternates.map((alt, i) => (
        <div key={i} className="rounded-xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] bg-slate-900/50 hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="min-w-0 flex-1 mr-2">
              <div className="text-sm font-semibold text-slate-200 truncate">{alt.name || `Option ${i + 1}`}</div>
              {alt.foods && alt.foods !== alt.name && (
                <div className="text-xs text-slate-500 mt-0.5 truncate">{alt.foods}</div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="text-slate-300 font-bold">{alt.kcal} <span className="text-slate-600 font-normal">kcal</span></span>
                <span className="text-blue-400">{alt.protein}g P</span>
                <span className="text-amber-400">{alt.carbs}g C</span>
                <span className="text-rose-400">{alt.fat}g F</span>
              </div>
              <ChevronDown className={clsx('h-4 w-4 text-slate-500 transition-transform duration-200', openIndex === i && 'rotate-180')} />
            </div>
          </button>
          {/* Mobile macro strip */}
          <div className="sm:hidden flex items-center gap-3 px-4 pb-2 text-xs">
            <span className="text-slate-300 font-bold">{alt.kcal} kcal</span>
            <span className="text-blue-400">{alt.protein}g P</span>
            <span className="text-amber-400">{alt.carbs}g C</span>
            <span className="text-rose-400">{alt.fat}g F</span>
          </div>
          <AnimatePresence initial={false}>
            {openIndex === i && alt.ingredients && alt.ingredients.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pb-4 border-t border-slate-700/40 pt-3">
                  <div className="overflow-x-auto rounded-lg border border-slate-700/40 mx-4">
                    <table className="w-full text-xs min-w-[320px]">
                      <thead>
                        <tr className="bg-slate-800/60">
                          <th className="text-left px-3 py-2 text-slate-400 font-semibold">Ingredient</th>
                          <th className="text-right px-3 py-2 text-slate-400 font-semibold">Qty</th>
                          <th className="text-right px-3 py-2 text-slate-400 font-semibold">Cal</th>
                          <th className="text-right px-3 py-2 text-blue-400 font-semibold">P</th>
                          <th className="text-right px-3 py-2 text-amber-400 font-semibold">C</th>
                          <th className="text-right px-3 py-2 text-rose-400 font-semibold">F</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alt.ingredients.map((ing, j) => (
                          <tr key={j} className="border-t border-slate-700/30 hover:bg-slate-800/20">
                            <td className="px-3 py-2 text-slate-300">{ing.name}</td>
                            <td className="px-3 py-2 text-slate-400 text-right">{ing.quantity}</td>
                            <td className="px-3 py-2 text-slate-300 font-medium text-right">{ing.calories}</td>
                            <td className="px-3 py-2 text-blue-400 text-right">{ing.protein}g</td>
                            <td className="px-3 py-2 text-amber-400 text-right">{ing.carbs}g</td>
                            <td className="px-3 py-2 text-rose-400 text-right">{ing.fat}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

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
          className="w-full flex items-center justify-between p-4 sm:p-5 min-h-[56px] text-left hover:bg-slate-700/20 transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="text-slate-100 font-bold truncate">{meal.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{meal.time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 ml-2">
            {/* Meal macro pills — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="text-slate-300 font-bold">{meal.totalCalories} <span className="text-slate-600 font-normal">kcal</span></span>
              <span className="text-blue-400">{meal.totalProtein}g P</span>
              <span className="text-amber-400">{meal.totalCarbs}g C</span>
              <span className="text-rose-400">{meal.totalFat}g F</span>
            </div>
            <ChevronDown
              className={clsx('h-4 w-4 text-slate-500 transition-transform duration-300 flex-shrink-0', open && 'rotate-180')}
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
                {/* Negative-margin wrapper so overflow-x-auto can scroll without being clipped by the parent overflow-hidden animation wrapper */}
                <div className="-mx-5 px-5 overflow-x-auto">
                  <div className="min-w-[360px]">
                    <IngredientList ingredients={meal.ingredients} />
                  </div>
                </div>

                {meal.preparationNotes && (
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
                    <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Prep</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{meal.preparationNotes}</p>
                  </div>
                )}

                {meal.alternates && meal.alternates.length > 0 && (
                  <FlexSwapsSection alternates={meal.alternates} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
