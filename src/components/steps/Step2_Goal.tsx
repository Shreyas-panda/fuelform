import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useDietStore } from '@/store/useDietStore'
import type { GoalType } from '@/types'

const GOALS: {
  type: GoalType
  label: string
  tagline: string
  desc: string
  icon: React.ReactNode
  badge: 'blue' | 'rose' | 'emerald'
  calNote: string
}[] = [
  {
    type: 'bulking',
    label: 'Bulking',
    tagline: 'Build Mass',
    desc: 'Caloric surplus of 300–500 kcal above your TDEE. Prioritises muscle growth with high protein and carbs.',
    icon: <TrendingUp className="h-6 w-6" />,
    badge: 'blue',
    calNote: '+400 kcal above TDEE',
  },
  {
    type: 'shredding',
    label: 'Shredding',
    tagline: 'Cut Fat',
    desc: 'Caloric deficit of 400–600 kcal below TDEE. Preserves muscle while torching fat — high protein, lower carbs.',
    icon: <TrendingDown className="h-6 w-6" />,
    badge: 'rose',
    calNote: '−500 kcal below TDEE',
  },
  {
    type: 'maintenance',
    label: 'Maintenance',
    tagline: 'Stay Lean',
    desc: 'Eat at your TDEE. Maintain your current physique and body composition while fuelling performance.',
    icon: <Minus className="h-6 w-6" />,
    badge: 'emerald',
    calNote: 'At TDEE',
  },
]

export function Step2_Goal() {
  const { bmiResult, setUserGoal, nextStep, prevStep } = useDietStore()
  const [selected, setSelected] = useState<GoalType>(bmiResult?.recommendedGoal ?? 'maintenance')
  const [customCal, setCustomCal] = useState('')

  function handleContinue() {
    setUserGoal({
      type: selected,
      targetCalories: customCal ? +customCal : undefined,
    })
    nextStep()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">Step 2 of 4</p>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Choose Your Goal</h2>
        <p className="text-slate-400 text-sm">
          Based on your BMI, we recommend{' '}
          <span className="text-emerald-400 font-semibold capitalize">{bmiResult?.recommendedGoal}</span>.
          You can change this below.
        </p>
      </div>

      {/* Spotlight goal cards — inspired by berkcangumusisik/spotlight-card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GOALS.map((goal, i) => (
          <motion.div
            key={goal.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card
              spotlight
              selected={selected === goal.type}
              glow
              className="p-5 cursor-pointer h-full"
              onClick={() => setSelected(goal.type)}
            >
              <div className="flex flex-col gap-3 relative z-20">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      selected === goal.type
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-700/60 border-slate-600/60 text-slate-400'
                    } transition-all duration-300`}
                  >
                    {goal.icon}
                  </div>
                  {bmiResult?.recommendedGoal === goal.type && (
                    <Badge variant="emerald" size="sm">Recommended</Badge>
                  )}
                </div>

                <div>
                  <div className="text-slate-100 font-bold text-lg">{goal.label}</div>
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">{goal.tagline}</div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed">{goal.desc}</p>

                <div className="pt-2 border-t border-slate-700/40">
                  <span className="text-xs text-slate-500">{goal.calNote}</span>
                  {bmiResult && (
                    <div className="text-xs text-slate-300 font-semibold mt-0.5">
                      ≈{' '}
                      {goal.type === 'bulking'
                        ? bmiResult.tdee + 400
                        : goal.type === 'shredding'
                          ? bmiResult.tdee - 500
                          : bmiResult.tdee}{' '}
                      kcal/day
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Optional custom calorie override */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-slate-300 text-sm font-medium">Custom calorie target</span>
          <span className="text-slate-600 text-xs">(optional — leave blank to use defaults)</span>
        </div>
        <Input
          type="number"
          placeholder={`e.g. ${bmiResult?.tdee ?? 2500}`}
          value={customCal}
          onChange={(e) => setCustomCal(e.target.value)}
          suffix="kcal"
        />
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={prevStep} className="flex-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
