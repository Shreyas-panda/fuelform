import type { BMIResult, GoalType, UserProfile, WorkoutPlan } from '@/types'
import { callGroq } from './apiClient'

const ACTIVITY_GUIDANCE: Record<string, { label: string; days: number; intensity: string; exerciseStyle: string }> = {
  sedentary: {
    label: 'Sedentary (no prior gym experience)',
    days: 3,
    intensity: 'LOW — beginner-friendly',
    exerciseStyle:
      'Use only beginner exercises: bodyweight movements (squats, push-ups, lunges, planks), light dumbbell work, and simple machine exercises. Avoid complex barbell lifts. Keep sets to 2-3, reps 12-15. Focus on learning movement patterns.',
  },
  lightly_active: {
    label: 'Lightly Active (gym 1-3x/week)',
    days: 3,
    intensity: 'LOW-MEDIUM — novice level',
    exerciseStyle:
      'Mix of bodyweight and light free weights. Include dumbbell presses, goblet squats, assisted pull-ups, cable rows. Introduce barbell deadlift at light load. 3 sets, 10-15 reps. Keep rest short (45-60 sec).',
  },
  moderately_active: {
    label: 'Moderately Active (gym 4-5x/week)',
    days: 4,
    intensity: 'MEDIUM — intermediate level',
    exerciseStyle:
      'Standard barbell + dumbbell compound movements. Include bench press, squat, deadlift, overhead press, barbell rows. Mix compound and isolation exercises. 3-4 sets, 8-12 reps. Structured rest periods.',
  },
  very_active: {
    label: 'Very Active (gym 6-7x/week, hard training)',
    days: 5,
    intensity: 'HIGH — advanced level',
    exerciseStyle:
      'Heavy compound lifts with progressive overload. Include Romanian deadlifts, weighted pull-ups, barbell hip thrusts, incline press, face pulls. Add intensity techniques: supersets, drop sets where appropriate. 4-5 sets, 5-10 reps for strength, higher for hypertrophy.',
  },
  extra_active: {
    label: 'Extremely Active (athlete / physical job + gym)',
    days: 5,
    intensity: 'VERY HIGH — elite/athlete level',
    exerciseStyle:
      'Advanced programming with periodisation. Include power movements (clean pulls, box jumps), heavy compounds, unilateral work (Bulgarian split squats, single-arm rows), and sport-specific conditioning. 5 sets, varied rep ranges (3-5 for strength, 8-12 for hypertrophy). Include deload guidance.',
  },
}

function buildWorkoutPrompt(profile: UserProfile, bmi: BMIResult, goal: GoalType): string {
  const guidance = ACTIVITY_GUIDANCE[profile.activityLevel]
  const daysPerWeek = guidance.days

  return `You are an expert certified personal trainer and strength coach. Create a complete weekly workout plan.

RESPOND WITH VALID JSON ONLY. No markdown, no explanation, no text outside the JSON.

ATHLETE PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weightKg}kg, Height: ${profile.heightCm}cm
- BMI: ${bmi.bmi} (${bmi.category})
- Activity Level: ${guidance.label}
- Training Goal: ${goal.toUpperCase()}

EXERCISE SELECTION RULES (CRITICAL — follow exactly):
- Intensity: ${guidance.intensity}
- ${guidance.exerciseStyle}
- Do NOT suggest exercises above the athlete's level. A sedentary person must never get barbell squats or deadlifts.
- Tailor rest periods, sets, and reps precisely to the activity level above.

REQUIREMENTS:
- ${daysPerWeek} training days per week with rest/active recovery days
- Choose the best split for the goal and level (beginners: full body; intermediate: upper/lower or PPL; advanced: PPL or specialisation)
- For each exercise include: name, sets, rep range, rest period, primary muscle group, one key form tip, and a YouTube search query to find a tutorial video
- Include warm-up and cooldown instructions per day
- Include progressive overload tips appropriate for the athlete's level
- Make it realistic and science-backed

MUSCLE GROUPS allowed values (use exactly one): "chest", "back", "shoulders", "biceps", "triceps", "legs", "glutes", "core", "full body", "cardio"

Return this exact JSON structure:
{
  "split": "Push / Pull / Legs",
  "daysPerWeek": ${daysPerWeek},
  "days": [
    {
      "day": "Monday",
      "focus": "Push — Chest, Shoulders, Triceps",
      "isRestDay": false,
      "estimatedDuration": "55-65 min",
      "warmup": "5 min light cardio + arm circles + band pull-aparts",
      "cooldown": "5 min static stretching focusing on chest and shoulders",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "6-8",
          "rest": "90 sec",
          "muscleGroup": "chest",
          "tips": "Keep shoulder blades retracted and feet flat on the floor throughout the movement.",
          "youtubeSearchQuery": "barbell bench press proper form tutorial beginners"
        }
      ]
    },
    {
      "day": "Tuesday",
      "focus": "Rest / Active Recovery",
      "isRestDay": true,
      "estimatedDuration": "20-30 min",
      "warmup": "",
      "cooldown": "",
      "exercises": []
    }
  ],
  "progressionTips": [
    "Add 2.5kg when you can complete all sets at the top of the rep range for 2 consecutive sessions.",
    "Track your lifts in a notebook or app every session."
  ],
  "generalAdvice": "Short paragraph of advice specific to the ${goal} goal and the athlete's BMI/level."
}`
}

function parseWorkout(raw: string): Partial<WorkoutPlan> {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

export async function generateWorkoutPlan(
  profile: UserProfile,
  bmi: BMIResult,
  goal: GoalType,
): Promise<WorkoutPlan> {
  const prompt = buildWorkoutPrompt(profile, bmi, goal)

  const rawText = await callGroq({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content:
          'You are a certified personal trainer. Always respond with valid JSON only — no markdown, no code fences, no explanation. The JSON must be parseable by JSON.parse().',
      },
      { role: 'user', content: prompt },
    ],
  })

  let parsed: Partial<WorkoutPlan>
  try {
    parsed = parseWorkout(rawText)
  } catch {
    console.error('Failed to parse workout response:', rawText)
    throw new Error('Could not parse workout plan. Please try again.')
  }

  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    goal,
    split: parsed.split ?? '',
    daysPerWeek: parsed.daysPerWeek ?? 4,
    days: parsed.days ?? [],
    progressionTips: parsed.progressionTips ?? [],
    generalAdvice: parsed.generalAdvice ?? '',
  }
}
