import { motion } from 'framer-motion'
import { Printer, RefreshCw, Pill, Lightbulb, CalendarDays, Droplets, Utensils, Dumbbell, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MacroSummary } from './MacroSummary'
import { MealCard } from './MealCard'
import { WorkoutDisplay } from './WorkoutDisplay'
import { MonthlyPlanDisplay } from './MonthlyPlanDisplay'
import { GoalTracker } from '@/components/tracker/GoalTracker'
import { useDietStore } from '@/store/useDietStore'
import { clsx } from 'clsx'
import type { DietPlan, ResultTab } from '@/types'

function printDietPlan(plan: DietPlan) {
  const { userProfile, goal, bmiResult, dailyTargetMacros, meals, supplementStack, hydrationTips, generalTips, weeklyVariationNote } = plan

  const mealsHtml = meals.map((meal) => `
    <div class="meal">
      <div class="meal-header">
        <strong>${meal.name}</strong>
        <span class="meal-time">${meal.time}</span>
        <span class="meal-kcal">${meal.totalCalories} kcal</span>
      </div>
      <table>
        <thead>
          <tr><th>Ingredient</th><th>Qty</th><th>Kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr>
        </thead>
        <tbody>
          ${meal.ingredients.map((ing) => `
            <tr>
              <td>${ing.name}</td>
              <td>${ing.quantity}</td>
              <td>${ing.calories}</td>
              <td>${ing.protein}g</td>
              <td>${ing.carbs}g</td>
              <td>${ing.fat}g</td>
            </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr class="totals-row">
            <td colspan="2"><strong>Meal Total</strong></td>
            <td><strong>${meal.totalCalories}</strong></td>
            <td><strong>${meal.totalProtein}g</strong></td>
            <td><strong>${meal.totalCarbs}g</strong></td>
            <td><strong>${meal.totalFat}g</strong></td>
          </tr>
        </tfoot>
      </table>
      ${meal.preparationNotes ? `<p class="prep-notes">${meal.preparationNotes}</p>` : ''}
    </div>`).join('')

  const supplementsHtml = supplementStack.length > 0
    ? `<div class="section"><h3>Supplement Stack</h3><ul>${supplementStack.map((s) => `<li>${s}</li>`).join('')}</ul></div>`
    : ''

  const hydrationHtml = hydrationTips.length > 0
    ? `<div class="section"><h3>Hydration Tips</h3><ul>${hydrationTips.map((t) => `<li>${t}</li>`).join('')}</ul></div>`
    : ''

  const tipsHtml = generalTips.length > 0
    ? `<div class="section"><h3>Pro Tips</h3><ul>${generalTips.map((t) => `<li>${t}</li>`).join('')}</ul></div>`
    : ''

  const variationHtml = weeklyVariationNote
    ? `<div class="section"><h3>Training vs Rest Day Adjustment</h3><p>${weeklyVariationNote}</p></div>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>FuelForm — ${userProfile.name}'s ${goal.type} Plan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; color: #111; background: #fff; padding: 24px 32px; }
    h1 { font-size: 20pt; color: #065f46; margin-bottom: 4px; }
    h2 { font-size: 13pt; color: #111; margin: 16px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 11pt; color: #065f46; margin-bottom: 6px; }
    .subtitle { color: #555; font-size: 10pt; margin-bottom: 12px; }
    .badges { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 9pt; font-weight: 600; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .macro-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .macro-box { padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; min-width: 100px; text-align: center; }
    .macro-box .val { font-size: 16pt; font-weight: 800; color: #065f46; }
    .macro-box .label { font-size: 8pt; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
    .meal { margin-bottom: 20px; page-break-inside: avoid; }
    .meal-header { display: flex; gap: 12px; align-items: baseline; margin-bottom: 6px; }
    .meal-header strong { font-size: 12pt; color: #111; }
    .meal-time { color: #555; font-size: 9pt; }
    .meal-kcal { margin-left: auto; font-weight: 700; color: #065f46; font-size: 10pt; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 6px; }
    th { background: #f1f5f9; color: #374151; text-align: left; padding: 5px 8px; font-weight: 600; border: 1px solid #e2e8f0; }
    td { padding: 4px 8px; border: 1px solid #e2e8f0; color: #374151; }
    .totals-row td { background: #f8fafc; font-weight: 600; }
    .prep-notes { font-size: 9pt; color: #555; font-style: italic; margin-top: 4px; }
    .section { margin-bottom: 16px; page-break-inside: avoid; }
    .section ul { padding-left: 18px; }
    .section li { color: #374151; font-size: 10pt; margin-bottom: 3px; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #999; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>FuelForm — ${userProfile.name}'s Plan</h1>
  <p class="subtitle">${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Plan · Generated ${new Date().toLocaleDateString()}</p>
  <div class="badges">
    <span class="badge">${goal.type.toUpperCase()}</span>
    <span class="badge">BMI ${bmiResult.bmi} · ${bmiResult.category}</span>
    <span class="badge">${dailyTargetMacros.calories} kcal/day</span>
    <span class="badge">${userProfile.weightKg}kg · ${userProfile.heightCm}cm</span>
  </div>

  <h2>Daily Macro Targets</h2>
  <div class="macro-row">
    <div class="macro-box"><div class="val">${dailyTargetMacros.calories}</div><div class="label">Calories</div></div>
    <div class="macro-box"><div class="val">${dailyTargetMacros.protein}g</div><div class="label">Protein</div></div>
    <div class="macro-box"><div class="val">${dailyTargetMacros.carbs}g</div><div class="label">Carbs</div></div>
    <div class="macro-box"><div class="val">${dailyTargetMacros.fat}g</div><div class="label">Fat</div></div>
    <div class="macro-box"><div class="val">${dailyTargetMacros.fiber}g</div><div class="label">Fiber</div></div>
    <div class="macro-box"><div class="val">${dailyTargetMacros.water}L</div><div class="label">Water</div></div>
  </div>

  <h2>Meal Plan (${meals.length} Meals)</h2>
  ${mealsHtml}

  ${supplementsHtml}
  ${hydrationHtml}
  ${tipsHtml}
  ${variationHtml}

  <div class="footer">Generated by FuelForm · fuelform.vercel.app · Powered by Llama 3.3 70B via Groq</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

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
  { id: 'monthly', label: 'Monthly Plan', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'tracker', label: 'Goal Tracker', icon: <CheckCircle2 className="h-4 w-4" /> },
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
            <Button variant="secondary" size="sm" onClick={() => printDietPlan(dietPlan)}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RefreshCw className="h-4 w-4" /> New Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Flow guide ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 print:hidden">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Suggested order</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { num: '1', label: 'Read Diet Plan', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { num: '2', label: 'Generate Workout', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { num: '3', label: 'Get Monthly Rotation', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
            { num: '4', label: 'Track Daily Progress', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          ].map((step, i, arr) => (
            <div key={step.num} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold ${step.color}`}>
                <span className="opacity-60">{step.num}.</span> {step.label}
              </span>
              {i < arr.length - 1 && <span className="text-slate-700">→</span>}
            </div>
          ))}
        </div>
      </div>

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
      {resultTab === 'diet' && (
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
      )}

      {resultTab === 'workout' && (
        <motion.div
          key="workout"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <WorkoutDisplay />
        </motion.div>
      )}

      {resultTab === 'monthly' && (
        <motion.div
          key="monthly"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <MonthlyPlanDisplay />
        </motion.div>
      )}

      {resultTab === 'tracker' && (
        <motion.div
          key="tracker"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GoalTracker />
        </motion.div>
      )}

      <Button variant="secondary" onClick={resetAll} className="w-full print:hidden">
        <RefreshCw className="h-4 w-4" /> Start Over — Generate a New Plan
      </Button>
    </motion.div>
  )
}
