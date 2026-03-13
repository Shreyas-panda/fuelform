import { type HTMLAttributes, useRef, useState } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
  selected?: boolean
  glow?: boolean
}

// Spotlight card — inspired by berkcangumusisik/spotlight-card on 21st.dev
// Mouse-following radial gradient spotlight on hover
export function Card({ spotlight, selected, glow, className, children, ...props }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSpotlightStyle({
      background: `radial-gradient(300px circle at ${x}px ${y}px, rgba(52, 211, 153, 0.12), transparent 70%)`,
    })
  }

  const handleMouseLeave = () => {
    setSpotlightStyle({})
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'relative rounded-2xl border bg-slate-800/60 backdrop-blur-sm transition-all duration-300 overflow-hidden',
        selected
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
          : 'border-slate-700/60 hover:border-slate-600',
        glow && selected && 'shadow-xl shadow-emerald-500/30',
        className,
      )}
      {...props}
    >
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-all duration-300 rounded-2xl"
          style={spotlightStyle}
        />
      )}
      {children}
    </div>
  )
}
