import type { BMIResult, DietPlan, FoodPreferences, GoalType, Meal, UserGoal, UserProfile } from '@/types'
import { callGroq } from './apiClient'

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'sedentary (desk job, no gym)',
  lightly_active: 'lightly active (gym 1-3x/week)',
  moderately_active: 'moderately active (gym 4-5x/week)',
  very_active: 'very active (gym 6-7x/week, hard training)',
  extra_active: 'extremely active (athlete or physical job + gym)',
}

const GOAL_LABELS: Record<GoalType, string> = {
  bulking: 'BULKING — caloric surplus of 300-500 kcal above TDEE to build muscle',
  shredding: 'SHREDDING — caloric deficit of 400-600 kcal below TDEE, preserve muscle mass',
  maintenance: 'MAINTENANCE — eat at TDEE to maintain weight and body composition',
}

function buildPrompt(
  profile: UserProfile,
  bmi: BMIResult,
  goal: UserGoal,
  prefs: FoodPreferences,
): string {
  const targetCalories = goal.targetCalories
    ? goal.targetCalories
    : goal.type === 'bulking'
      ? bmi.tdee + 400
      : goal.type === 'shredding'
        ? bmi.tdee - 500
        : bmi.tdee

  return `You are a certified sports nutritionist specializing in gym performance. Create a complete personalized daily diet plan.

RESPOND WITH VALID JSON ONLY. No markdown, no explanation, no text outside the JSON object.

ATHLETE PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.heightCm}cm, Weight: ${profile.weightKg}kg
- BMI: ${bmi.bmi} (${bmi.category})
- Activity: ${ACTIVITY_LABELS[profile.activityLevel]}
- TDEE: ${bmi.tdee} kcal/day

GOAL: ${GOAL_LABELS[goal.type]}
Target daily calories: ${targetCalories} kcal

DIET CONSTRAINTS:
- Diet type: ${prefs.dietType}
- Cuisine preference: ${prefs.cuisineType}
- Allergies (STRICTLY AVOID): ${prefs.allergies.length ? prefs.allergies.join(', ') : 'None'}
- Disliked foods (avoid if possible): ${prefs.dislikedFoods.length ? prefs.dislikedFoods.join(', ') : 'None'}
- Number of meals per day: ${prefs.mealsPerDay}
- Include supplement recommendations: ${prefs.includeSupplements ? 'Yes' : 'No'}

REQUIREMENTS:
- Every ingredient must have exact quantity in grams (or ml for liquids, or count for whole items like eggs — always include gram equivalent in parentheses e.g. "2 whole (100g)")
- Calculate calories, protein, carbs, fat per ingredient (realistic nutritional values)
- Provide brief prep notes (2-3 sentences max)
- Distribute meals across the day with suggested times
- Weekly variation note: how to adjust on rest days vs training days

Return this exact JSON structure:
{
  "dailyTargetMacros": {
    "calories": ${targetCalories},
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fat": <number in grams>,
    "fiber": <number in grams>,
    "water": <liters as number>
  },
  "meals": [
    {
      "id": "meal_1",
      "name": "Breakfast",
      "time": "7:00 AM",
      "ingredients": [
        {
          "name": "Oats",
          "quantity": "80g",
          "calories": 303,
          "protein": 10,
          "carbs": 54,
          "fat": 6
        }
      ],
      "preparationNotes": "Brief prep instructions here.",
      "totalCalories": <sum of ingredient calories>,
      "totalProtein": <sum>,
      "totalCarbs": <sum>,
      "totalFat": <sum>
    }
  ],
  "supplementStack": ${prefs.includeSupplements ? '["Whey protein 30g post-workout", "Creatine monohydrate 5g daily"]' : '[]'},
  "hydrationTips": ["Drink 500ml water first thing in the morning", "Sip water throughout training"],
  "generalTips": ["Tip 1 relevant to the goal", "Tip 2"],
  "weeklyVariationNote": "On rest days reduce carbs by X grams. On training days prioritize pre and post workout meals."
}`
}

function recalculateMealTotals(meals: Meal[]): Meal[] {
  return meals.map((meal) => ({
    ...meal,
    totalCalories: meal.ingredients.reduce((s, i) => s + i.calories, 0),
    totalProtein: Math.round(meal.ingredients.reduce((s, i) => s + i.protein, 0) * 10) / 10,
    totalCarbs: Math.round(meal.ingredients.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
    totalFat: Math.round(meal.ingredients.reduce((s, i) => s + i.fat, 0) * 10) / 10,
  }))
}

function parseResponse(raw: string): Partial<DietPlan> {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  parsed.meals = recalculateMealTotals(parsed.meals)
  return parsed
}

export async function generateDietPlan(
  profile: UserProfile,
  bmi: BMIResult,
  goal: UserGoal,
  prefs: FoodPreferences,
): Promise<DietPlan> {
  const prompt = buildPrompt(profile, bmi, goal, prefs)

  const rawText = await callGroq({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content:
          'You are a certified sports nutritionist. Always respond with valid JSON only — no markdown, no code fences, no explanation. The JSON must be parseable by JSON.parse().',
      },
      { role: 'user', content: prompt },
    ],
  })

  let parsed: Partial<DietPlan>
  try {
    parsed = parseResponse(rawText)
  } catch {
    console.error('Failed to parse Groq response:', rawText)
    throw new Error('The AI returned an unexpected response. Please try again.')
  }

  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    userProfile: profile,
    goal,
    bmiResult: bmi,
    preferences: prefs,
    dailyTargetMacros: parsed.dailyTargetMacros!,
    meals: parsed.meals!,
    supplementStack: parsed.supplementStack ?? [],
    hydrationTips: parsed.hydrationTips ?? [],
    generalTips: parsed.generalTips ?? [],
    weeklyVariationNote: parsed.weeklyVariationNote ?? '',
  }
}
