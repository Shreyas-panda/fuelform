import { Droplets, Flame } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { DailyMacros } from '@/types'

export function MacroSummary({ macros }: { macros: DailyMacros }) {
  return (
    <Card className="p-6">
      <h3 className="text-slate-100 font-bold text-lg mb-5 flex items-center gap-2">
        <Flame className="h-5 w-5 text-emerald-400" />
        Daily Macro Targets
      </h3>

      {/* Calorie hero */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-black text-slate-100">{macros.calories}</span>
        <span className="text-slate-400 text-sm font-medium">kcal / day</span>
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-blue-400 font-semibold">Protein</span>
            <span className="text-slate-300 font-bold">{macros.protein}g</span>
          </div>
          <ProgressBar value={macros.protein} max={macros.protein + macros.carbs + macros.fat} color="blue" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-amber-400 font-semibold">Carbohydrates</span>
            <span className="text-slate-300 font-bold">{macros.carbs}g</span>
          </div>
          <ProgressBar value={macros.carbs} max={macros.protein + macros.carbs + macros.fat} color="amber" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-rose-400 font-semibold">Fats</span>
            <span className="text-slate-300 font-bold">{macros.fat}g</span>
          </div>
          <ProgressBar value={macros.fat} max={macros.protein + macros.carbs + macros.fat} color="rose" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-500">Fiber</div>
              <div className="text-slate-200 font-semibold text-sm">{macros.fiber}g</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-xs text-slate-500">Water</div>
              <div className="text-slate-200 font-semibold text-sm">{macros.water}L</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
