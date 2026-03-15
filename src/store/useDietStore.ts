import { create } from 'zustand'
import type {
  AppStatus,
  AppView,
  BMIResult,
  DietPlan,
  FoodPreferences,
  MonthlyPlan,
  ResultTab,
  UserGoal,
  UserProfile,
  WizardStep,
  WorkoutPlan,
} from '@/types'
import { generateDietPlan, generateMonthlyPlan } from '@/services/groqService'
import { generateWorkoutPlan } from '@/services/workoutService'

interface DietStore {
  // App view
  appView: AppView
  setAppView: (view: AppView) => void

  // Result tab
  resultTab: ResultTab
  setResultTab: (tab: ResultTab) => void

  // Wizard
  currentStep: WizardStep
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void

  // User data
  userProfile: Partial<UserProfile>
  setUserProfile: (profile: Partial<UserProfile>) => void

  bmiResult: BMIResult | null
  setBMIResult: (result: BMIResult) => void

  userGoal: UserGoal | null
  setUserGoal: (goal: UserGoal) => void

  preferences: Partial<FoodPreferences>
  setPreferences: (prefs: Partial<FoodPreferences>) => void

  // Generation
  status: AppStatus
  workoutStatus: AppStatus
  monthlyStatus: AppStatus
  errorMessage: string | null
  dietPlan: DietPlan | null
  workoutPlan: WorkoutPlan | null
  monthlyPlan: MonthlyPlan | null

  generatePlan: () => Promise<void>
  generateWorkout: () => Promise<void>
  generateMonthly: () => Promise<void>
  resetAll: () => void
}

export const useDietStore = create<DietStore>((set, get) => ({
  appView: 'hero',
  resultTab: 'diet',

  currentStep: 1,
  userProfile: {},
  bmiResult: null,
  userGoal: null,
  preferences: {},
  status: 'idle',
  workoutStatus: 'idle',
  monthlyStatus: 'idle',
  errorMessage: null,
  dietPlan: null,
  workoutPlan: null,
  monthlyPlan: null,

  setAppView: (appView) => set({ appView }),
  setResultTab: (resultTab) => set({ resultTab }),

  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(s.currentStep + 1, 4) as WizardStep })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) as WizardStep })),

  setUserProfile: (profile) =>
    set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),
  setBMIResult: (bmiResult) => set({ bmiResult }),
  setUserGoal: (userGoal) => set({ userGoal }),
  setPreferences: (prefs) =>
    set((s) => ({ preferences: { ...s.preferences, ...prefs } })),

  generatePlan: async () => {
    const { userProfile, bmiResult, userGoal, preferences } = get()
    set({ status: 'generating', errorMessage: null, currentStep: 4 })
    try {
      const plan = await generateDietPlan(
        userProfile as UserProfile,
        bmiResult!,
        userGoal!,
        preferences as FoodPreferences,
      )
      set({ status: 'success', dietPlan: plan, appView: 'results' })
    } catch (err) {
      set({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      })
    }
  },

  generateWorkout: async () => {
    const { userProfile, bmiResult, userGoal } = get()
    set({ workoutStatus: 'generating' })
    try {
      const plan = await generateWorkoutPlan(
        userProfile as UserProfile,
        bmiResult!,
        userGoal!.type,
      )
      set({ workoutStatus: 'success', workoutPlan: plan })
    } catch (err) {
      set({
        workoutStatus: 'error',
        errorMessage: err instanceof Error ? err.message : 'Workout generation failed.',
      })
    }
  },

  generateMonthly: async () => {
    const { userProfile, bmiResult, userGoal, preferences } = get()
    set({ monthlyStatus: 'generating' })
    try {
      const plan = await generateMonthlyPlan(
        userProfile as UserProfile,
        bmiResult!,
        userGoal!,
        preferences as FoodPreferences,
      )
      set({ monthlyStatus: 'success', monthlyPlan: plan })
    } catch (err) {
      set({
        monthlyStatus: 'error',
        errorMessage: err instanceof Error ? err.message : 'Monthly plan generation failed.',
      })
    }
  },

  resetAll: () =>
    set({
      appView: 'hero',
      resultTab: 'diet',
      currentStep: 1,
      userProfile: {},
      bmiResult: null,
      userGoal: null,
      preferences: {},
      status: 'idle',
      workoutStatus: 'idle',
      monthlyStatus: 'idle',
      errorMessage: null,
      dietPlan: null,
      workoutPlan: null,
      monthlyPlan: null,
    }),
}))
