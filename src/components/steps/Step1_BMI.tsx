import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Scale } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useDietStore } from '@/store/useDietStore'
import { computeBMIResult, lbsToKg, inchesToCm } from '@/utils/bmiCalculator'
import type { ActivityLevel, BMIResult, Gender, Unit } from '@/types'

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary — desk job, no gym' },
  { value: 'lightly_active', label: 'Lightly Active — gym 1-3x/week' },
  { value: 'moderately_active', label: 'Moderately Active — gym 4-5x/week' },
  { value: 'very_active', label: 'Very Active — gym 6-7x/week, hard training' },
  { value: 'extra_active', label: 'Extremely Active — athlete or physical job + gym' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const BMI_INFO: Record<string, { badge: BadgeVariant; label: string; desc: string }> = {
  underweight: { badge: 'blue', label: 'Underweight', desc: 'Time to build mass — bulking recommended.' },
  normal: { badge: 'emerald', label: 'Normal Weight', desc: 'Great base — pick your direction.' },
  overweight: { badge: 'amber', label: 'Overweight', desc: 'Cut fat, keep muscle — shredding recommended.' },
  obese: { badge: 'red', label: 'Obese', desc: 'Priority: fat loss — shredding strongly recommended.' },
}

type BadgeVariant = 'blue' | 'emerald' | 'amber' | 'red'

export function Step1_BMI() {
  const { setUserProfile, setBMIResult, nextStep } = useDietStore()

  const [unit, setUnit] = useState<Unit>('metric')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState<ActivityLevel>('moderately_active')
  const [bmiResult, setBmiLocal] = useState<BMIResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleNameChange(value: string) {
    // Only allow letters and spaces
    const cleaned = value.replace(/[^a-zA-Z\s]/g, '')
    setName(cleaned)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (name.trim() && !/^[a-zA-Z\s]+$/.test(name)) e.name = 'Name must contain only letters'
    if (!age || +age < 10 || +age > 100) e.age = 'Enter a valid age (10–100)'
    if (!height || +height <= 0) e.height = 'Enter a valid height'
    if (!weight || +weight <= 0) e.weight = 'Enter a valid weight'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleCalculate() {
    if (!validate()) return

    const heightCm = unit === 'metric' ? +height : inchesToCm(+height)
    const weightKg = unit === 'metric' ? +weight : lbsToKg(+weight)

    const result = computeBMIResult(weightKg, heightCm, +age, gender, activity)
    setBmiLocal(result)
    setUserProfile({ name: name.trim(), age: +age, gender, heightCm, weightKg, activityLevel: activity, unit })
    setBMIResult(result)
  }

  function handleContinue() {
    nextStep()
  }

  const info = bmiResult ? BMI_INFO[bmiResult.category] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <Scale className="h-3.5 w-3.5" />
          Step 1 of 4
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Your Body Stats</h2>
        <p className="text-slate-400 text-sm">We calculate your BMI and TDEE to build a plan that actually works.</p>
      </div>

      <Card className="p-4 sm:p-6 flex flex-col gap-5">
        {/* Unit toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-700/60 w-full sm:self-start">
          {(['metric', 'imperial'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 sm:flex-none px-4 min-h-[44px] sm:min-h-0 sm:py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                unit === u
                  ? 'bg-emerald-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <Input label="Your Name" placeholder="e.g. Alex" value={name} onChange={(e) => handleNameChange(e.target.value)} error={errors.name} />

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Input label="Age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} error={errors.age} />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            options={GENDER_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Input
            label={`Height (${unit === 'metric' ? 'cm' : 'inches'})`}
            type="number"
            placeholder={unit === 'metric' ? '175' : '69'}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            error={errors.height}
            suffix={unit === 'metric' ? 'cm' : 'in'}
          />
          <Input
            label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`}
            type="number"
            placeholder={unit === 'metric' ? '80' : '176'}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            error={errors.weight}
            suffix={unit === 'metric' ? 'kg' : 'lbs'}
          />
        </div>

        <Select
          label="Activity Level"
          value={activity}
          onChange={(e) => setActivity(e.target.value as ActivityLevel)}
          options={ACTIVITY_OPTIONS}
        />

        <Button onClick={handleCalculate} size="lg" className="w-full">
          Calculate BMI
        </Button>
      </Card>

      {/* BMI Result */}
      {bmiResult && info && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 sm:p-6" spotlight glow selected>
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="min-w-0">
                <div className="text-4xl sm:text-5xl font-black text-slate-100 mb-1">{bmiResult.bmi}</div>
                <div className="text-slate-400 text-sm">Body Mass Index</div>
              </div>
              <Badge variant={info.badge}>{info.label}</Badge>
            </div>
            <p className="text-slate-300 text-sm mb-4">{info.desc}</p>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
              <div>
                <div className="text-slate-500 text-xs mb-0.5">Daily Calorie Burn (TDEE)</div>
                <div className="text-emerald-400 font-bold text-lg">{bmiResult.tdee} <span className="text-slate-500 text-xs font-normal">kcal/day</span></div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-0.5">Recommended Goal</div>
                <div className="text-slate-100 font-bold text-lg capitalize">{bmiResult.recommendedGoal}</div>
              </div>
            </div>
            <Button onClick={handleContinue} size="lg" className="w-full mt-5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
