import type { ActivityLevel, BMIResult, Gender } from '@/types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number): BMIResult['category'] {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function getRecommendedGoal(category: BMIResult['category']): BMIResult['recommendedGoal'] {
  if (category === 'underweight') return 'bulking'
  if (category === 'normal') return 'maintenance'
  return 'shredding'
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  if (gender === 'male') return male
  if (gender === 'female') return female
  return (male + female) / 2
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

export function computeBMIResult(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): BMIResult {
  const bmi = calculateBMI(weightKg, heightCm)
  const category = getBMICategory(bmi)
  const recommendedGoal = getRecommendedGoal(category)
  const bmr = calculateBMR(weightKg, heightCm, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)
  return { bmi, category, recommendedGoal, tdee }
}

// Convert imperial inputs to metric for storage
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10
}
