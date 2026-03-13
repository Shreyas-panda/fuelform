# Diet Planner — CLAUDE.md

## Project Overview

A web app for gym enthusiasts that:
- Calculates BMI and recommends a goal (Bulking / Shredding / Maintenance)
- Generates a fully personalized daily diet plan with **exact ingredient measurements** and macros
- Lets users set food preferences (diet type, cuisine, allergies, disliked foods)
- Uses **Groq API (free tier)** with **Llama 3.3 70B** for AI-generated meal plans
- Built as a 4-step wizard — no backend, no database, browser-only

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 |
| AI | Groq SDK (`groq-sdk`) |
| AI Model | `llama-3.3-70b-versatile` (Groq free tier) |
| Icons | Lucide React |

All tools are **free and open-source**. Groq free tier: 30 req/min, 6000 req/day.
Sign up at https://console.groq.com (no credit card required).

## Environment Variables

```bash
# .env  (never commit this file)
VITE_GROQ_API_KEY=gsk_...

# .env.example  (committed — shows required vars, no values)
VITE_GROQ_API_KEY=your_groq_api_key_here
```

The `VITE_` prefix exposes the variable to the browser bundle via `import.meta.env`.
**Never commit `.env`** — it is in `.gitignore`.

## Project Structure

```
diet-planner/
├── CLAUDE.md
├── .env                          # secrets — not committed
├── .env.example                  # template — committed
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx                   # Step-based routing (no React Router)
    ├── index.css                 # Tailwind directives + print CSS
    ├── vite-env.d.ts
    │
    ├── types/
    │   └── index.ts              # ALL TypeScript interfaces — write this first
    │
    ├── store/
    │   └── useDietStore.ts       # Zustand store — single source of truth
    │
    ├── services/
    │   └── groqService.ts        # Groq API call + prompt builder + JSON parser
    │
    ├── utils/
    │   ├── bmiCalculator.ts      # BMI + TDEE calculation (pure functions)
    │   └── goalRecommender.ts    # Maps BMI category to recommended goal
    │
    └── components/
        ├── ui/                   # Reusable primitives
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   ├── Input.tsx
        │   ├── Select.tsx
        │   ├── Badge.tsx
        │   ├── ProgressBar.tsx
        │   └── Spinner.tsx
        │
        ├── layout/
        │   ├── Header.tsx
        │   └── StepIndicator.tsx
        │
        ├── steps/                # One component per wizard step
        │   ├── Step1_BMI.tsx
        │   ├── Step2_Goal.tsx
        │   ├── Step3_Preferences.tsx
        │   └── Step4_Generating.tsx
        │
        └── plan/                 # Diet plan display
            ├── DietPlanDisplay.tsx
            ├── MacroSummary.tsx
            ├── MealCard.tsx
            ├── IngredientList.tsx
            └── PlanActions.tsx
```

## User Flow (4 Steps)

### Step 1 — Body Stats & BMI (`Step1_BMI.tsx`)
- Inputs: Name, Age, Gender, Height, Weight, Unit toggle (metric/imperial), Activity Level
- On submit: calculate BMI + TDEE, show result badge
- BMI categories → recommended goal:
  - `< 18.5` underweight → **Bulking**
  - `18.5–24.9` normal → **Maintenance** (user picks)
  - `25–29.9` overweight → **Shredding**
  - `>= 30` obese → **Shredding**

### Step 2 — Goal Selection (`Step2_Goal.tsx`)
- Cards: Bulking / Shredding / Maintenance (recommended one pre-selected)
- Optional custom calorie target override

### Step 3 — Food Preferences (`Step3_Preferences.tsx`)
- Diet type: Vegetarian / Non-Veg / Vegan / Eggetarian
- Cuisine: Indian / Mediterranean / American / Asian / Mixed
- Meals per day: 3, 4, 5, or 6
- Allergies: tag input (type + Enter)
- Disliked foods: tag input
- Include supplement recommendations: toggle
- "Generate Plan" triggers Groq API call

### Step 4 — Generating (`Step4_Generating.tsx`)
- Animated spinner + cycling messages ("Calculating macros...", "Selecting ingredients...", etc.)
- On success → `DietPlanDisplay`
- On error → error message + Retry button

### Result — Diet Plan Display
- Daily macro summary with visual bars (Protein=blue, Carbs=amber, Fat=rose)
- Meal cards with ingredient table: Name | Quantity | Cal | P | C | F
- Supplement stack, hydration tips, general tips
- Print / Regenerate buttons

## Key Data Models (`src/types/index.ts`)

```typescript
// Core types — see src/types/index.ts for full definitions

UserProfile       // name, age, gender, heightCm, weightKg, activityLevel, unit
BMIResult         // bmi, category, recommendedGoal
FoodPreferences   // dietType, cuisineType, allergies[], dislikedFoods[], mealsPerDay, includeSupplements
UserGoal          // type: 'bulking' | 'shredding' | 'maintenance', optional targetCalories
Ingredient        // name, quantity (string with unit), calories, protein, carbs, fat
Meal              // id, name, time, ingredients[], preparationNotes, totals
DietPlan          // full plan: dailyTargetMacros, meals[], supplementStack[], tips[]
```

## BMI + TDEE Logic (`src/utils/bmiCalculator.ts`)

```
BMI = weightKg / (heightM²)

BMR (Mifflin-St Jeor):
  Male:   10*kg + 6.25*cm - 5*age + 5
  Female: 10*kg + 6.25*cm - 5*age - 161
  Other:  average of male and female formulas

Activity multipliers:
  sedentary:         1.2
  lightly_active:    1.375
  moderately_active: 1.55
  very_active:       1.725
  extra_active:      1.9

TDEE = BMR × activityMultiplier
```

**Always store and pass heights/weights in metric (cm/kg).** Convert from imperial at input time.
Pass TDEE into the Groq prompt as the calorie base for accurate surplus/deficit math.

## Groq API Integration (`src/services/groqService.ts`)

```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,  // safe for local personal tool; add proxy if deploying publicly
});

// Model: 'llama-3.3-70b-versatile'
// max_tokens: 4096
```

**Prompt strategy:**
- System message: sports nutritionist role, **return valid JSON only** (no markdown, no explanation)
- User message: profile + goal + TDEE + preferences + exact JSON schema example
- Parser: strip ` ```json ``` ` fences defensively, then `JSON.parse()`
- **Recalculate meal totals in the frontend** from ingredient data — do not trust model arithmetic

**JSON schema must be passed as a filled-in example** (not abstract schema) for best Llama compliance.

## Zustand Store (`src/store/useDietStore.ts`)

Single flat store, no slices. Key actions:
- `setUserProfile`, `setBMIResult`, `setUserGoal`, `setPreferences`
- `nextStep` / `prevStep` (clamps to 1–4)
- `generatePlan()` — async action: calls `groqService`, sets `status` to `'generating'` → `'success'` | `'error'`
- `resetAll()` — clears everything back to Step 1

## App.tsx Routing (no React Router)

```
status === 'success'    →  <DietPlanDisplay />
currentStep === 1       →  <Step1_BMI />
currentStep === 2       →  <Step2_Goal />
currentStep === 3       →  <Step3_Preferences />
currentStep === 4 (generating) →  <Step4_Generating />
```

## UI Design

- **Dark theme**: `bg-slate-900` background, `emerald-400` accent
- **Card style**: `bg-slate-800 border border-slate-700 rounded-xl`
- **Progress**: 4 numbered dots connected by a line at the top
- **Macro bars**: Protein=`blue-400`, Carbs=`amber-400`, Fat=`rose-400`
- **Meal cards**: collapsible accordion in the result view

## Development Commands

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

## Build & Run (First Time)

```bash
# 1. Scaffold (if starting fresh)
npm create vite@latest . -- --template react-ts

# 2. Install deps
npm install zustand lucide-react groq-sdk
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Add VITE_GROQ_API_KEY to .env
# 4. npm run dev
```

## Implementation Order (for future Claude sessions)

1. `src/types/index.ts` — define all interfaces first (shapes everything else)
2. `src/utils/bmiCalculator.ts` — pure functions, no dependencies
3. `src/store/useDietStore.ts` — state before any UI
4. `src/services/groqService.ts` — most complex logic; build prompt carefully
5. `src/components/ui/` — primitives
6. `src/components/layout/` — Header + StepIndicator
7. `src/components/steps/` — Step1 → Step2 → Step3 → Step4
8. `src/components/plan/` — MacroSummary → MealCard → IngredientList → DietPlanDisplay
9. `App.tsx` — wire routing
10. `index.css` — Tailwind + print CSS

## Known Gotchas

- **Llama may return malformed JSON**: always wrap `JSON.parse` in try/catch; show retry button on error
- **Llama arithmetic is unreliable**: recalculate per-meal totals from `ingredient.calories` sums in the frontend
- **Long generation time (10–20s)**: show cycling loading messages to keep UX active
- **Imperial inputs**: convert to metric immediately on input; never send imperial values to the model
- **`dangerouslyAllowBrowser: true`**: acceptable for a local personal tool. If ever deployed publicly, route the API call through a backend proxy instead.
