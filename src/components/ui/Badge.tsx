import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'emerald' | 'blue' | 'amber' | 'red' | 'slate' | 'rose'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'emerald', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold tracking-wide uppercase',
        {
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30': variant === 'emerald',
          'bg-blue-500/15 text-blue-400 border border-blue-500/30': variant === 'blue',
          'bg-amber-500/15 text-amber-400 border border-amber-500/30': variant === 'amber',
          'bg-red-500/15 text-red-400 border border-red-500/30': variant === 'red',
          'bg-slate-500/15 text-slate-400 border border-slate-500/30': variant === 'slate',
          'bg-rose-500/15 text-rose-400 border border-rose-500/30': variant === 'rose',
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-xs': size === 'md',
        },
      )}
    >
      {children}
    </span>
  )
}
