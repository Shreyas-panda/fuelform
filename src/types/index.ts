// ─── User Input Models ────────────────────────────────────────────────────────

export type Unit = 'metric' | 'imperial'
export type Gender = 'male' | 'female' | 'other'
export type GoalType = 'bulking' | 'shredding' | 'maintenance'
export type DietType = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian'
export type CuisineType = 'indian' | 'mediterranean' | 'american' | 'asian' | 'mixed'
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active'

export interface UserProfile {
  name: string
  age: number
  gender: Gender
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  unit: Unit
}

export interface BMIResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  recommendedGoal: GoalType
  tdee: number
}

export interface FoodPreferences {
  dietType: DietType
  cuisineType: CuisineType
  allergies: string[]
  dislikedFoods: string[]
  mealsPerDay: 1 | 2 | 3 | 4 | 5 | 6
  includeSupplements: boolean
  flexMeals: number
}

export interface UserGoal {
  type: GoalType
  targetCalories?: number
}

// ─── Diet Plan Models ─────────────────────────────────────────────────────────

export interface Ingredient {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface AlternateMeal {
  name: string
  foods: string
  ingredients: Ingredient[]
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  name: string
  time: string
  ingredients: Ingredient[]
  preparationNotes: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  alternates?: AlternateMeal[]
}

export interface DailyMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  water: number
}

export interface DietPlan {
  id: string
  generatedAt: string
  userProfile: UserProfile
  goal: UserGoal
  bmiResult: BMIResult
  preferences: FoodPreferences
  dailyTargetMacros: DailyMacros
  meals: Meal[]
  supplementStack: string[]
  hydrationTips: string[]
  generalTips: string[]
  weeklyVariationNote: string
}

// ─── Workout Plan Models ──────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'full body'
  | 'cardio'

export interface Exercise {
  name: string
  sets: number
  reps: string        // e.g. "8-12" or "30 sec"
  rest: string        // e.g. "60 sec"
  muscleGroup: MuscleGroup
  tips: string        // form cue in one sentence
  youtubeSearchQuery: string  // e.g. "barbell bench press proper form tutorial"
}

export interface WorkoutDay {
  day: string           // e.g. "Monday", "Day 1"
  focus: string         // e.g. "Push — Chest, Shoulders, Triceps"
  isRestDay: boolean
  exercises: Exercise[]
  estimatedDuration: string  // e.g. "45-60 min"
  warmup: string
  cooldown: string
}

export interface WorkoutPlan {
  id: string
  generatedAt: string
  goal: GoalType
  split: string           // e.g. "Push / Pull / Legs"
  daysPerWeek: number
  days: WorkoutDay[]
  progressionTips: string[]
  generalAdvice: string
}

// ─── Monthly Plan Models ──────────────────────────────────────────────────────

export interface WeekMeal {
  name: string    // e.g. "Breakfast"
  foods: string   // e.g. "Masala oats with sprouts and mint chutney"
  kcal: number
}

export interface MonthlyWeek {
  week: number
  theme: string        // e.g. "Foundation Week"
  focus: string        // what changes and why
  meals: WeekMeal[]    // one sample day's full meal schedule
  keyChanges: string[] // bullet list of differences vs previous week
}

export interface MonthlyPlan {
  id: string
  generatedAt: string
  weeks: MonthlyWeek[]
  monthlyTips: string[]
}

// ─── App State ────────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4
export type AppStatus = 'idle' | 'generating' | 'success' | 'error'
export type AppView = 'hero' | 'wizard' | 'results' | 'learn'
export type ResultTab = 'diet' | 'workout' | 'monthly' | 'tracker'
