import { Dumbbell } from 'lucide-react'
import { useDietStore } from '@/store/useDietStore'

export function Header() {
  const { setAppView } = useDietStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <button
        onClick={() => setAppView('hero')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Dumbbell className="h-5 w-5 text-emerald-400" />
        </div>
        <span className="text-lg font-bold text-slate-100 tracking-tight">
          Fuel<span className="text-emerald-400">Form</span>
        </span>
      </button>
      <span className="text-xs text-slate-500 hidden sm:block">AI-Powered Gym Nutrition</span>
    </header>
  )
}
