import { useState, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { useDietStore } from '@/store/useDietStore'
import type { CuisineType, DietType } from '@/types'
import { clsx } from 'clsx'

const DIET_TYPES: { value: DietType; label: string; emoji: string }[] = [
  { value: 'non-vegetarian', label: 'Non-Veg', emoji: '🍗' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'eggetarian', label: 'Eggetarian', emoji: '🥚' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
]

const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'american', label: 'American' },
  { value: 'asian', label: 'Asian' },
  { value: 'mixed', label: 'Mixed / No Preference' },
]

const MEALS_OPTIONS = [3, 4, 5, 6] as const

function TagInput({
  label,
  placeholder,
  tags,
  onChange,
}: {
  label: string
  placeholder: string
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')

  function addTag() {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="min-h-[2.75rem] flex flex-wrap gap-1.5 items-center rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all duration-200">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
          >
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="h-3 w-3 hover:text-white" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-slate-100 text-sm placeholder-slate-600 focus:outline-none"
        />
      </div>
      <p className="text-xs text-slate-600">Press Enter or comma to add</p>
    </div>
  )
}

export function Step3_Preferences() {
  const { generatePlan, prevStep, setPreferences } = useDietStore()

  const [dietType, setDietType] = useState<DietType>('non-vegetarian')
  const [cuisine, setCuisine] = useState<CuisineType>('mixed')
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5 | 6>(4)
  const [allergies, setAllergies] = useState<string[]>([])
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([])
  const [includeSupplements, setIncludeSupplements] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setPreferences({ dietType, cuisineType: cuisine, allergies, dislikedFoods, mealsPerDay, includeSupplements })
    setLoading(true)
    await generatePlan()
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">Step 3 of 4</p>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Food Preferences</h2>
        <p className="text-slate-400 text-sm">Tell us what you like — we'll build around it.</p>
      </div>

      <Card className="p-6 flex flex-col gap-6">
        {/* Diet type selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Diet Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIET_TYPES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDietType(d.value)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200',
                  dietType === d.value
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600',
                )}
              >
                <span className="text-xl">{d.emoji}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Cuisine Preference"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value as CuisineType)}
          options={CUISINE_OPTIONS}
        />

        {/* Meals per day */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Meals per Day</label>
          <div className="flex gap-2">
            {MEALS_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setMealsPerDay(n)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200',
                  mealsPerDay === n
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <TagInput
          label="Allergies (strictly avoided)"
          placeholder="e.g. peanuts, gluten, dairy..."
          tags={allergies}
          onChange={setAllergies}
        />

        <TagInput
          label="Disliked Foods"
          placeholder="e.g. broccoli, tofu..."
          tags={dislikedFoods}
          onChange={setDislikedFoods}
        />

        {/* Supplements toggle */}
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
          <div>
            <div className="text-slate-200 text-sm font-medium">Include Supplement Recommendations</div>
            <div className="text-slate-500 text-xs mt-0.5">Whey protein, creatine, vitamins etc.</div>
          </div>
          <button
            onClick={() => setIncludeSupplements((v) => !v)}
            className={clsx(
              'relative w-11 h-6 rounded-full border-2 transition-all duration-300',
              includeSupplements
                ? 'bg-emerald-500 border-emerald-500'
                : 'bg-slate-700 border-slate-600',
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300',
                includeSupplements && 'translate-x-5',
              )}
            />
          </button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={prevStep} disabled={loading}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handleGenerate} loading={loading} size="lg" className="flex-1">
          <Zap className="h-4 w-4" />
          {loading ? 'Generating your plan...' : 'Generate My Diet Plan'}
        </Button>
      </div>
    </motion.div>
  )
}
