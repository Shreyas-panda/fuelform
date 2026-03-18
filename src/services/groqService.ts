import type { BMIResult, DietPlan, FoodPreferences, GoalType, Meal, MonthlyPlan, MonthlyWeek, UserGoal, UserProfile } from '@/types'
import { callGroq } from './apiClient'

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'sedentary (desk job, no gym)',
  lightly_active: 'lightly active (gym 1-3x/week)',
  moderately_active: 'moderately active (gym 4-5x/week)',
  very_active: 'very active (gym 6-7x/week, hard training)',
  extra_active: 'extremely active (athlete or physical job + gym)',
}

const CUISINE_GUIDANCE: Record<string, string> = {
  indian: `MANDATORY CUISINE RULE — Use ONLY authentic Indian household ingredients. Examples: dal (masoor/moong/toor/chana), chawal (rice), roti/chapati (atta flour), sabzi (gobi, palak, aloo, bhindi, karela, lauki), paneer, dahi (curd/yogurt), besan, poha, upma, idli, dosa, sambar, rajma, chole, ghee, mustard seeds, turmeric, cumin, coriander, garam masala. Non-veg: chicken curry, egg bhurji, fish curry, mutton keema. STRICTLY NO oats porridge, Caesar salad, spaghetti, wraps, or any Western foods.`,
  mediterranean: `MANDATORY CUISINE RULE — Use ONLY authentic Mediterranean ingredients. Examples: hummus, pita bread, falafel, tabbouleh, olive oil, feta cheese, Greek yogurt, chickpeas, lentils, couscous, eggplant/baba ganoush, olives, tzatziki, grilled fish, chicken souvlaki, stuffed grape leaves, labneh, za'atar, harissa, shakshuka (eggs in tomato sauce). STRICTLY NO Indian curries, soy sauce, rice bowls, or Asian foods.`,
  american: `MANDATORY CUISINE RULE — Use ONLY American-style ingredients. Examples: grilled chicken breast, ground turkey, eggs, Greek yogurt, cottage cheese, sweet potato, brown rice, oatmeal, whole wheat bread, avocado, black beans, peanut butter, broccoli, spinach, protein shakes, turkey burgers, wraps, sandwiches, BBQ chicken, mac and cheese (lightened). STRICTLY NO Indian curries, Mediterranean mezze, or Asian noodles.`,
  asian: `MANDATORY CUISINE RULE — Use ONLY authentic Asian ingredients. Examples: tofu, tempeh, edamame, miso soup, soy sauce, brown rice, soba/udon/rice noodles, bok choy, shiitake mushrooms, ginger, sesame oil, nori, salmon, steamed fish, stir-fry vegetables, kimchi, congee, spring rolls, dumplings, teriyaki chicken, pad thai, ramen. STRICTLY NO Indian spices, Mediterranean ingredients, or Western fast food.`,
  mixed: `Use a creative mix of ingredients from multiple global cuisines — combine Indian, Mediterranean, American, and Asian foods for maximum variety and nutritional completeness across different meals.`,
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

${prefs.mealsPerDay <= 2 ? `INTERMITTENT FASTING PROTOCOL: This athlete is following intermittent fasting with only ${prefs.mealsPerDay} meal(s) per day. ALL daily nutrition targets must be achieved within these ${prefs.mealsPerDay} meal(s). Use larger, calorie-dense portions and nutrient-dense ingredients. Do NOT suggest small snacks — every meal must be substantial.` : ''}

${CUISINE_GUIDANCE[prefs.cuisineType]}

${prefs.flexMeals > 0 ? `FLEX SWAPS: For each meal, provide exactly ${prefs.flexMeals} alternate meal option(s) in the "alternates" array. Each alternate must: use the SAME cuisine, meet similar macro targets (±15%), and be a completely different meal (different ingredients/dish).` : ''}

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
      "totalFat": <sum>,
      "alternates": ${prefs.flexMeals > 0 ? `[${Array.from({ length: prefs.flexMeals }, (_, i) => `{"name": "Alternative ${i + 1}", "foods": "Brief description of alternate meal using same cuisine", "kcal": <number>, "protein": <number>, "carbs": <number>, "fat": <number>}`).join(', ')}]` : '[]'}
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

export async function generateMonthlyPlan(
  profile: UserProfile,
  bmi: BMIResult,
  goal: UserGoal,
  prefs: FoodPreferences,
): Promise<MonthlyPlan> {
  const targetCalories = goal.targetCalories
    ? goal.targetCalories
    : goal.type === 'bulking'
      ? bmi.tdee + 400
      : goal.type === 'shredding'
        ? bmi.tdee - 500
        : bmi.tdee

  const prompt = `You are a certified sports nutritionist. Create a 4-week progressive monthly diet plan.

RESPOND WITH VALID JSON ONLY. No markdown, no explanation, no text outside the JSON object.

ATHLETE PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weightKg}kg, TDEE: ${bmi.tdee} kcal
- Goal: ${GOAL_LABELS[goal.type]}
- Target calories: ${targetCalories} kcal/day
- Diet: ${prefs.dietType}, ${prefs.cuisineType} cuisine, ${prefs.mealsPerDay} meals/day

${CUISINE_GUIDANCE[prefs.cuisineType]}

TASK: Create 4 weeks of diet variation. Each week uses DIFFERENT meals/foods than the previous week (same cuisine, same macro targets). This prevents adaptation and boredom. Week 1 is the baseline. Weeks 2–4 rotate different foods, cooking styles, and meal compositions while hitting the same daily calorie and macro targets.

For each week provide ONE sample day's full meal schedule (${prefs.mealsPerDay} meals) with specific food names.

Return this exact JSON:
{
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation Week",
      "focus": "Establish baseline habits with simple, familiar meals",
      "meals": [
        { "name": "Breakfast", "foods": "Specific meal name and description", "kcal": 450 },
        { "name": "Lunch", "foods": "Specific meal name and description", "kcal": 650 }
      ],
      "keyChanges": ["Baseline plan — reference point for all future weeks"]
    },
    {
      "week": 2,
      "theme": "Variety Week",
      "focus": "Introduce new protein sources and cooking methods",
      "meals": [...],
      "keyChanges": ["Swapped X for Y to vary amino acid profile", "Added Z for more fiber"]
    },
    { "week": 3, "theme": "...", "focus": "...", "meals": [...], "keyChanges": [...] },
    { "week": 4, "theme": "...", "focus": "...", "meals": [...], "keyChanges": [...] }
  ],
  "monthlyTips": [
    "Tip about cycling foods monthly",
    "When to adjust if weight stalls after 2 weeks"
  ]
}`

  const rawText = await callGroq({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content:
          'You are a certified sports nutritionist. Always respond with valid JSON only — no markdown, no code fences, no explanation. The JSON must be parseable by JSON.parse().',
      },
      { role: 'user', content: prompt },
    ],
  })

  let parsed: { weeks: MonthlyWeek[]; monthlyTips: string[] }
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse monthly plan response:', rawText)
    throw new Error('The AI returned an unexpected response. Please try again.')
  }

  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    weeks: parsed.weeks,
    monthlyTips: parsed.monthlyTips ?? [],
  }
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
