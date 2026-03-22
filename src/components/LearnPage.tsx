import { motion } from 'framer-motion'
import { ArrowLeft, Scale, Flame, Beef, Wheat, Droplets, TrendingUp, TrendingDown, Minus, Activity, Dumbbell, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDietStore } from '@/store/useDietStore'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BMI_CATEGORIES = [
  {
    range: '< 18.5',
    label: 'Underweight',
    color: 'text-blue-400',
    bar: 'bg-blue-400',
    width: 'w-[18%]',
    desc: 'Your weight is below the healthy range. This can mean insufficient muscle mass, low energy reserves, or nutritional deficiencies. Goal: build mass through a caloric surplus.',
    goal: 'Bulking',
    goalColor: 'text-blue-400',
  },
  {
    range: '18.5 – 24.9',
    label: 'Normal Weight',
    color: 'text-emerald-400',
    bar: 'bg-emerald-400',
    width: 'w-[40%]',
    desc: 'You are within the healthy weight range. This does not mean you cannot improve — you can choose to build muscle (bulk) or lean down (shred) based on your physique goals.',
    goal: 'Your choice',
    goalColor: 'text-emerald-400',
  },
  {
    range: '25 – 29.9',
    label: 'Overweight',
    color: 'text-amber-400',
    bar: 'bg-amber-400',
    width: 'w-[65%]',
    desc: 'Your weight is above the healthy range, usually due to excess body fat. The priority here is fat loss while preserving muscle. Goal: caloric deficit with high protein intake.',
    goal: 'Shredding',
    goalColor: 'text-amber-400',
  },
  {
    range: '≥ 30',
    label: 'Obese',
    color: 'text-red-400',
    bar: 'bg-red-400',
    width: 'w-[85%]',
    desc: 'BMI above 30 is associated with higher health risks. Significant fat loss is the priority. A structured caloric deficit with regular movement and high protein is the safest approach.',
    goal: 'Shredding',
    goalColor: 'text-red-400',
  },
]

const MACROS = [
  {
    icon: <Beef className="h-5 w-5" />,
    name: 'Protein',
    cal: '4 kcal/g',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    bar: 'bg-blue-400',
    pct: 30,
    roles: [
      'Builds and repairs muscle tissue',
      'Keeps you feeling full (high satiety)',
      'Preserves muscle during a caloric deficit',
    ],
    target: 'Aim for 1.6–2.2g per kg of bodyweight per day when training.',
    sources: 'Chicken breast, eggs, Greek yogurt, lentils, tofu, whey protein',
  },
  {
    icon: <Wheat className="h-5 w-5" />,
    name: 'Carbohydrates',
    cal: '4 kcal/g',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    bar: 'bg-amber-400',
    pct: 50,
    roles: [
      'Primary fuel for gym training and the brain',
      'Replenishes glycogen in muscles after a workout',
      'Supports performance and recovery',
    ],
    target: 'Higher on training days (3–5g/kg), lower on rest days (1–3g/kg).',
    sources: 'Rice, oats, sweet potato, banana, whole wheat bread, quinoa',
  },
  {
    icon: <Droplets className="h-5 w-5" />,
    name: 'Fats',
    cal: '9 kcal/g',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    bar: 'bg-rose-400',
    pct: 20,
    roles: [
      'Regulates hormones including testosterone',
      'Absorbs fat-soluble vitamins (A, D, E, K)',
      'Protects joints and organs',
    ],
    target: 'Keep at 0.8–1.2g per kg of bodyweight. Do not go below 20% of total calories.',
    sources: 'Avocado, olive oil, nuts, eggs, salmon, dark chocolate',
  },
]

const GOALS = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    label: 'Bulking',
    tagline: 'Caloric Surplus',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    surplus: '+300 to +500 kcal above TDEE',
    protein: 'Very High (2–2.5g/kg)',
    carbs: 'High',
    fat: 'Moderate',
    desc: 'You eat more calories than you burn. The excess energy, combined with resistance training and adequate protein, is used to build new muscle tissue. Expect some fat gain — this is normal.',
    tip: 'Dirty bulking (eating everything) works short-term but adds too much fat. A lean bulk (+300 kcal) keeps fat gain minimal while still building muscle.',
  },
  {
    icon: <TrendingDown className="h-6 w-6" />,
    label: 'Shredding',
    tagline: 'Caloric Deficit',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    surplus: '−400 to −600 kcal below TDEE',
    protein: 'Very High (2–2.5g/kg) — to preserve muscle',
    carbs: 'Moderate to Low',
    fat: 'Moderate',
    desc: 'You eat fewer calories than you burn. Your body is forced to use stored fat as fuel. Protein must stay very high to prevent muscle breakdown during the deficit.',
    tip: 'Losing 0.5–1% of body weight per week is the sweet spot — fast enough to see results, slow enough to protect muscle.',
  },
  {
    icon: <Minus className="h-6 w-6" />,
    label: 'Maintenance',
    tagline: 'At TDEE',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    surplus: '±0 kcal (at TDEE)',
    protein: 'High (1.6–2g/kg)',
    carbs: 'Moderate',
    fat: 'Moderate',
    desc: 'You eat exactly what you burn. Weight stays stable. Useful for body recomposition (slowly trading fat for muscle) or as a recovery phase between bulking and shredding cycles.',
    tip: 'Beginners and those returning after a break can often gain muscle and lose fat simultaneously at maintenance — called "newbie gains".',
  },
]

const ACTIVITY_LEVELS = [
  {
    label: 'Sedentary',
    multiplier: '× 1.2',
    desc: 'Desk job, little to no exercise. Your TDEE is just your BMR plus minimal daily movement.',
    example: 'Office worker who does not exercise.',
  },
  {
    label: 'Lightly Active',
    multiplier: '× 1.375',
    desc: 'Light exercise 1–3 days per week. Moderate daily activity.',
    example: 'Walks to work + gym 2x/week.',
  },
  {
    label: 'Moderately Active',
    multiplier: '× 1.55',
    desc: 'Moderate exercise 4–5 days per week. This is the most common level for regular gym-goers.',
    example: 'Gym 4x/week, active lifestyle.',
  },
  {
    label: 'Very Active',
    multiplier: '× 1.725',
    desc: 'Hard training 6–7 days per week. High-volume training programs.',
    example: 'Bodybuilder or athlete in-season.',
  },
  {
    label: 'Extremely Active',
    multiplier: '× 1.9',
    desc: 'Very hard daily training or a physical job plus gym. Maximum caloric needs.',
    example: 'Construction worker who also trains twice a day.',
  },
]

// ─── Reusable section header ──────────────────────────────────────────────────

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">{tag}</p>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-3">{title}</h2>
      {subtitle && <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LearnPage() {
  const { setAppView } = useDietStore()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
            <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            Fuel<span className="text-emerald-400">Form</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setAppView('hero')} className="min-h-[44px] px-3">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Back</span>
          </Button>
          <Button size="sm" onClick={() => setAppView('wizard')} className="min-h-[44px] px-3 sm:px-4 whitespace-nowrap">
            Build My Plan
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col gap-16 sm:gap-24">

        {/* Page intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
            <Info className="h-3.5 w-3.5" />
            No jargon — plain English
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 mb-4">
            Understand Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fitness Numbers
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            FuelForm uses science-backed formulas to build your plan. Here's exactly what each concept means and why it matters for your results.
          </p>
        </motion.div>

        {/* ── BMI ─────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            tag="Body Mass Index"
            title="What Is BMI?"
            subtitle="BMI is a simple ratio of your weight to your height squared. It gives a quick snapshot of whether your weight is in a healthy range for your height."
          />

          {/* Formula */}
          <Card className="p-5 mb-6 border-emerald-500/20 bg-emerald-500/5 text-center">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-slate-200 font-bold text-lg">BMI</div>
              <div className="text-slate-500 text-lg">=</div>
              <div className="flex flex-col items-center">
                <div className="text-slate-200 font-bold border-b border-slate-500 pb-1 px-2">Weight (kg)</div>
                <div className="text-slate-200 font-bold pt-1 px-2">Height (m)²</div>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3">Example: 75 kg ÷ (1.75 × 1.75) = BMI 24.5 → Normal</p>
          </Card>

          {/* BMI categories */}
          <div className="flex flex-col gap-4">
            {BMI_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card spotlight className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${cat.color}`}>{cat.label}</span>
                          <span className="text-slate-500 text-xs font-mono">{cat.range}</span>
                        </div>
                        {/* Visual bar */}
                        <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                          <div className={`h-full rounded-full ${cat.bar} ${cat.width} transition-all duration-700`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm leading-relaxed mb-2">{cat.desc}</p>
                      <span className={`text-xs font-semibold ${cat.goalColor}`}>
                        Recommended goal: {cat.goal}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-4 mt-4 bg-amber-500/5 border-amber-500/20">
            <p className="text-amber-400/80 text-xs leading-relaxed">
              <strong className="text-amber-400">Important:</strong> BMI is a screening tool, not a diagnostic. It does not measure body fat directly and can misclassify muscular athletes as overweight. Use it as a starting point, not the full picture.
            </p>
          </Card>
        </motion.section>

        {/* ── TDEE ────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            tag="Total Daily Energy Expenditure"
            title="What Is TDEE?"
            subtitle="TDEE is the total number of calories your body burns in a day — including exercise, digestion, and just staying alive. It's the most important number for your diet."
          />

          {/* TDEE breakdown visual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: <Activity className="h-5 w-5 text-emerald-400" />,
                title: 'BMR (60–70%)',
                label: 'Basal Metabolic Rate',
                desc: 'Calories your body burns at complete rest — for breathing, heartbeat, organ function. This is the baseline even if you do absolutely nothing all day.',
              },
              {
                icon: <Flame className="h-5 w-5 text-amber-400" />,
                title: 'Activity (20–30%)',
                label: 'Exercise & Movement',
                desc: 'Calories burned through gym sessions, walking, and general daily movement. This is where your activity level multiplier comes in.',
              },
              {
                icon: <Scale className="h-5 w-5 text-blue-400" />,
                title: 'TEF (8–10%)',
                label: 'Thermic Effect of Food',
                desc: 'Calories burned just by digesting and processing the food you eat. Protein has the highest TEF (20–30%) — one reason high-protein diets are effective.',
              },
            ].map((item) => (
              <Card key={item.title} spotlight className="p-5 flex flex-col gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 w-fit">{item.icon}</div>
                <div>
                  <div className="text-slate-100 font-bold text-sm">{item.title}</div>
                  <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">{item.label}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Formula */}
          <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
              <Scale className="h-3.5 w-3.5" /> How FuelForm Calculates Your TDEE
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold w-4 flex-shrink-0">1.</span>
                <span className="text-slate-300">Calculate <strong className="text-slate-100">BMR</strong> using the Mifflin-St Jeor formula — the most accurate equation for most people.</span>
              </div>
              {/* Scrollable formula block to prevent overflow on narrow screens */}
              <div className="overflow-x-auto">
                <div className="pl-7 font-mono text-xs text-slate-500 whitespace-nowrap">
                  Male: (10 × kg) + (6.25 × cm) − (5 × age) + 5<br />
                  Female: (10 × kg) + (6.25 × cm) − (5 × age) − 161
                </div>
              </div>
              <div className="flex items-start gap-3 mt-1">
                <span className="text-emerald-500 font-bold w-4 flex-shrink-0">2.</span>
                <span className="text-slate-300">Multiply BMR by your <strong className="text-slate-100">Activity Multiplier</strong> based on your lifestyle.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold w-4 flex-shrink-0">3.</span>
                <span className="text-slate-300">Add or subtract calories based on your <strong className="text-slate-100">goal</strong> (bulk/shred/maintain) to get your daily calorie target.</span>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* ── Macros ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            tag="Macronutrients"
            title="What Are Macros?"
            subtitle="Macros (macronutrients) are the three main nutrients your body gets from food. Every calorie you eat comes from one of them. Getting the right ratio is what separates a good diet from a great one."
          />

          <div className="flex flex-col gap-5">
            {MACROS.map((macro, i) => (
              <motion.div
                key={macro.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card spotlight className={`p-5 sm:p-6 border ${macro.border}`}>
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Left: name + bar */}
                    <div className="flex flex-row sm:flex-col sm:w-36 flex-shrink-0 gap-3 sm:gap-3">
                      <div className={`p-2.5 rounded-xl ${macro.bg} border ${macro.border} w-fit ${macro.color} flex-shrink-0`}>
                        {macro.icon}
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <div className={`font-black text-lg ${macro.color}`}>{macro.name}</div>
                        <div className="text-slate-500 text-xs">{macro.cal}</div>
                        {/* Mini bar */}
                        <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden mt-2">
                          <div className={`h-full rounded-full ${macro.bar}`} style={{ width: `${macro.pct}%` }} />
                        </div>
                        <span className="text-slate-500 text-xs">~{macro.pct}% of calories</span>
                      </div>
                    </div>

                    {/* Right: details */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">What it does</p>
                        <ul className="flex flex-col gap-1.5">
                          {macro.roles.map((role) => (
                            <li key={role} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className={`${macro.color} mt-1 flex-shrink-0`}>·</span> {role}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className={`text-xs p-3 rounded-xl ${macro.bg} border ${macro.border}`}>
                          <span className={`font-bold ${macro.color}`}>Target: </span>
                          <span className="text-slate-300">{macro.target}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="text-slate-400 font-medium">Sources: </span>{macro.sources}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Goals ───────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            tag="Training Goals"
            title="Bulking vs Shredding vs Maintenance"
            subtitle="Your goal determines how many calories you eat relative to your TDEE. Everything else in the plan — meal sizes, macro ratios, workout volume — flows from this one decision."
          />

          <div className="flex flex-col gap-5">
            {GOALS.map((goal, i) => (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card spotlight className={`p-5 sm:p-6 border ${goal.border} ${goal.bg}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2.5 rounded-xl bg-slate-800 border ${goal.border} ${goal.color} flex-shrink-0`}>
                      {goal.icon}
                    </div>
                    <div>
                      <div className={`font-black text-xl ${goal.color}`}>{goal.label}</div>
                      <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{goal.tagline}</div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{goal.desc}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Calories', value: goal.surplus },
                      { label: 'Protein', value: goal.protein },
                      { label: 'Carbs', value: goal.carbs },
                      { label: 'Fat', value: goal.fat },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                        <div className="text-slate-500 text-xs mb-1">{item.label}</div>
                        <div className="text-slate-200 text-xs font-semibold leading-tight">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/40">
                    <span className={`text-xs font-bold ${goal.color} whitespace-nowrap mt-0.5`}>Pro tip</span>
                    <p className="text-slate-400 text-xs leading-relaxed">{goal.tip}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Activity Levels ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            tag="Activity Multiplier"
            title="Which Activity Level Are You?"
            subtitle="Your activity level multiplies your BMR to give your TDEE. Choosing the right one is critical — over-estimating it means you'll eat more than you burn."
          />

          <div className="flex flex-col gap-3">
            {ACTIVITY_LEVELS.map((level, i) => (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card spotlight className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Fixed label column — slightly narrower to give desc more room on mobile */}
                    <div className="flex-shrink-0 w-20 sm:w-24 text-right">
                      <div className="text-emerald-400 font-black text-base sm:text-lg font-mono leading-tight">{level.multiplier}</div>
                      <div className="text-slate-100 font-bold text-xs sm:text-sm leading-tight mt-0.5">{level.label}</div>
                    </div>
                    <div className="flex-1 min-w-0 border-l border-slate-700/60 pl-4">
                      <p className="text-slate-300 text-sm mb-1.5">{level.desc}</p>
                      <p className="text-slate-600 text-xs italic">e.g. {level.example}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-4 mt-4 bg-slate-900/60 border-slate-700/40">
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong className="text-slate-300">When in doubt, choose one level lower.</strong> Most people overestimate how active they are. It's easier to add 100–200 kcal if you're not losing fat than to remove calories you didn't account for.
            </p>
          </Card>
        </motion.section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-8 border-t border-slate-800/60"
        >
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 mb-3">Ready to Build Your Plan?</h3>
          <p className="text-slate-400 text-sm mb-6">Now that you understand the numbers, let FuelForm do the maths for you.</p>
          <Button size="lg" onClick={() => setAppView('wizard')} className="shadow-xl shadow-emerald-500/20 w-full sm:w-auto min-h-[52px]">
            Build My Free Plan <Activity className="h-5 w-5" />
          </Button>
        </motion.div>

      </main>
    </div>
  )
}
