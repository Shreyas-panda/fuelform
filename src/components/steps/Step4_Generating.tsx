import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useDietStore } from '@/store/useDietStore'

const MESSAGES = [
  'Calculating your macros...',
  'Selecting the right ingredients...',
  'Balancing protein, carbs and fats...',
  'Timing your meals for performance...',
  'Adding the finishing touches...',
]

export function Step4_Generating() {
  const { status, errorMessage, generatePlan, prevStep } = useDietStore()
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (status !== 'generating') return
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2800)
    return () => clearInterval(id)
  }, [status])

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 text-center max-w-md mx-auto"
      >
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h3>
          <p className="text-slate-400 text-sm">{errorMessage}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button variant="secondary" onClick={prevStep} className="min-h-[44px]">
            Go Back
          </Button>
          <Button onClick={() => generatePlan()} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 text-center max-w-sm mx-auto"
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0">
        <div className="absolute w-28 h-28 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute w-20 h-20 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <Spinner className="h-7 w-7 text-emerald-400" />
        </div>
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">Building Your Plan</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-emerald-400 text-sm font-medium"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-slate-600 text-xs mt-3">This usually takes 15–20 seconds</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              i <= msgIndex ? 'bg-emerald-400' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
