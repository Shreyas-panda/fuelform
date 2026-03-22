import { AnimatePresence, motion } from 'framer-motion'
import { HeroPage } from '@/components/HeroPage'
import { LearnPage } from '@/components/LearnPage'
import { Header } from '@/components/layout/Header'
import { StepIndicator } from '@/components/layout/StepIndicator'
import { Step1_BMI } from '@/components/steps/Step1_BMI'
import { Step2_Goal } from '@/components/steps/Step2_Goal'
import { Step3_Preferences } from '@/components/steps/Step3_Preferences'
import { Step4_Generating } from '@/components/steps/Step4_Generating'
import { ResultsPage } from '@/components/plan/ResultsPage'
import { useDietStore } from '@/store/useDietStore'

function App() {
  const { appView, currentStep, status } = useDietStore()

  return (
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence mode="wait">
        {appView === 'learn' ? (
          <motion.div
            key="learn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LearnPage />
          </motion.div>
        ) : appView === 'hero' ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroPage />
          </motion.div>
        ) : appView === 'results' ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Header />

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
            </div>

            <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 overflow-x-hidden">
              <ResultsPage />
            </main>
          </motion.div>
        ) : (
          /* Wizard view */
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Header />

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
            </div>

            <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 overflow-x-hidden">
              <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
                <StepIndicator current={currentStep} />
              </div>

              <div className="max-w-3xl mx-auto w-full">
                {status === 'generating' || currentStep === 4 ? (
                  <Step4_Generating />
                ) : currentStep === 1 ? (
                  <Step1_BMI />
                ) : currentStep === 2 ? (
                  <Step2_Goal />
                ) : (
                  <Step3_Preferences />
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
