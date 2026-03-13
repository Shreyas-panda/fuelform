import type { Ingredient } from '@/types'

export function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60">
            <th className="text-left py-2 pr-4 text-slate-500 font-medium text-xs uppercase tracking-wide">Ingredient</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium text-xs uppercase tracking-wide">Qty</th>
            <th className="text-right py-2 px-2 text-slate-500 font-medium text-xs uppercase tracking-wide">Cal</th>
            <th className="text-right py-2 px-2 text-blue-400/70 font-medium text-xs uppercase tracking-wide">P</th>
            <th className="text-right py-2 px-2 text-amber-400/70 font-medium text-xs uppercase tracking-wide">C</th>
            <th className="text-right py-2 pl-2 text-rose-400/70 font-medium text-xs uppercase tracking-wide">F</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-800/60 last:border-0 hover:bg-slate-700/20 transition-colors"
            >
              <td className="py-2.5 pr-4 text-slate-200 font-medium">{ing.name}</td>
              <td className="py-2.5 px-2 text-slate-400 text-right whitespace-nowrap">{ing.quantity}</td>
              <td className="py-2.5 px-2 text-slate-300 text-right font-semibold">{ing.calories}</td>
              <td className="py-2.5 px-2 text-blue-400 text-right">{ing.protein}g</td>
              <td className="py-2.5 px-2 text-amber-400 text-right">{ing.carbs}g</td>
              <td className="py-2.5 pl-2 text-rose-400 text-right">{ing.fat}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
