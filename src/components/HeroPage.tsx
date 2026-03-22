import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Dumbbell, Flame, Brain, Video, BookOpen, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDietStore } from '@/store/useDietStore'

// Free Mixkit gym videos (CDN — no API key needed, Mixkit free license)
const GYM_VIDEOS = [
  'https://assets.mixkit.co/videos/52112/52112-720.mp4',
  'https://assets.mixkit.co/videos/52104/52104-720.mp4',
]

const FEATURES = [
  {
    icon: <Flame className="h-5 w-5" />,
    title: 'BMI-Based Diet Plan',
    desc: 'Exact ingredient measurements and macros for every meal, tailored to your body.',
  },
  {
    icon: <Dumbbell className="h-5 w-5" />,
    title: 'Weekly Workout Routine',
    desc: 'A personalised training split matched to your fitness level.',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'Cuisine-Aware Meal Plans',
    desc: 'Pick Indian, Mediterranean, Asian, or American — every meal uses ingredients from that cuisine only.',
  },
  {
    icon: <Video className="h-5 w-5" />,
    title: 'Exercise Video Guides',
    desc: 'Every exercise links to a YouTube tutorial so you always train with perfect form.',
  },
]

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
]


export function HeroPage() {
  const { setAppView } = useDietStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — gradient fallback is visible
      })
    }
  }, [])

  function scrollTo(href: string) {
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── Video background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          {GYM_VIDEOS.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50"
      >
        <div className="flex items-center justify-between px-4 sm:px-10 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-slate-100 tracking-tight">
              Fuel<span className="text-emerald-400">Form</span>
            </span>
          </div>

          {/* Nav links — desktop (md+) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => setAppView('learn')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-200"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Learn Basics
            </button>
          </div>

          {/* Right side: CTA + hamburger */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setAppView('wizard')}
              className="shadow-lg shadow-emerald-500/20"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            {/* Hamburger — mobile only (hidden md+) */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden md:hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-md"
            >
              <div className="flex flex-col px-4 py-3 gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className="w-full text-left px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200"
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => { setAppView('learn'); setMobileMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4" />
                  Learn Basics
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero content ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-screen pt-20 px-4 sm:px-6 text-center">

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-lg shadow-emerald-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered · 100% Free · No Signup
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-100 leading-tight mb-6 max-w-4xl"
        >
          Your Body.{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Your Plan.
          </span>
          <br />
          Zero Guesswork.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Enter your stats and get a personalised{' '}
          <strong className="text-slate-200">bulking or shredding diet</strong> with exact
          ingredient measurements — plus a full{' '}
          <strong className="text-slate-200">workout routine</strong> tailored to your fitness level.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12 sm:mb-20 w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={() => setAppView('wizard')}
            className="w-full sm:w-auto px-10 py-4 text-base shadow-2xl shadow-emerald-500/30 hover:scale-105 transition-transform min-h-[52px]"
          >
            Build My Plan <ArrowRight className="h-5 w-5" />
          </Button>
          <button
            onClick={() => scrollTo('#how-it-works')}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline underline-offset-4 min-h-[44px] flex items-center"
          >
            See how it works
          </button>
        </motion.div>

        {/* Learn CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mb-10 w-full max-w-xl"
        >
          <button
            onClick={() => setAppView('learn')}
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 rounded-2xl bg-amber-500/8 border border-amber-500/25 hover:border-amber-500/50 hover:bg-amber-500/12 transition-all duration-300 text-left group min-h-[44px]"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-amber-300 font-bold text-sm">New to fitness terms?</div>
              <div className="text-slate-500 text-xs mt-0.5">Understand BMI, TDEE &amp; Macros before you build your plan</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['BMI', 'TDEE', 'Macros', 'Goals', 'Activity Levels'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-500 text-xs">{t}</span>
                ))}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400/60 group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-0 divide-x divide-slate-800 mb-12 sm:mb-16 text-center"
        >
          {[
            { value: '5', label: 'Cuisine Types' },
            { value: '4-Week', label: 'Monthly Plans' },
            { value: '100%', label: 'Free, No Signup' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-4 sm:px-6 py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 bg-slate-950/90 backdrop-blur-sm px-4 sm:px-10 py-16 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100">How It Works</h2>
          </motion.div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Connecting line on desktop */}
            <div className="absolute hidden md:block top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-emerald-500/10 pointer-events-none" />
            {[
              { step: 1, title: 'Enter Your Stats', desc: 'Height, weight, age, gender and activity level.' },
              { step: 2, title: 'Choose Your Goal', desc: 'Bulk, shred, or maintain — we pre-select based on your BMI.' },
              { step: 3, title: 'Set Preferences', desc: 'Diet type, cuisine, allergies and meals per day.' },
              { step: 4, title: 'Get Your Plan', desc: 'Diet plan with exact macros, workout split with YouTube guides, 4-week monthly rotation, and a daily goal tracker.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex flex-col items-center sm:items-start gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/60 transition-colors text-center sm:text-left"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl z-10 shadow-lg shadow-emerald-500/10 flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="text-slate-100 font-bold text-sm mb-1.5">{item.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-center mt-10"
          >
            <Button size="lg" onClick={() => setAppView('wizard')} className="shadow-xl shadow-emerald-500/20 w-full sm:w-auto min-h-[52px]">
              Start Now — It's Free <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 bg-slate-950 px-4 sm:px-10 py-16 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">What You Get</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100">Everything You Need</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 group overflow-hidden cursor-default"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/5 border border-emerald-500/25 text-emerald-400 w-fit">
                  {f.icon}
                </div>
                <div>
                  <div className="text-slate-100 font-bold text-sm mb-1.5">{f.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-800/60 px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <Dumbbell className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-slate-200 font-black text-lg">Fuel<span className="text-emerald-400">Form</span></span>
          </div>
          <p className="text-slate-500 text-xs">AI-powered diet &amp; workout planner · Built for gym enthusiasts</p>
          <p className="text-slate-700 text-xs">Free forever · No signup · No data stored · Powered by Llama 3.3 70B</p>
        </div>
      </footer>

    </div>
  )
}
