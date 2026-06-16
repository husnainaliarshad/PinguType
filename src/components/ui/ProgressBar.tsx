interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'primary' | 'correct' | 'incorrect'
  size?: 'sm' | 'md'
  className?: string
}

const barColors: Record<string, string> = {
  primary: 'bg-primary',
  correct: 'bg-correct',
  incorrect: 'bg-incorrect',
}

const sizes: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div
      className={`w-full rounded-full bg-surface overflow-hidden ${sizes[size]} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${barColors[variant]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
