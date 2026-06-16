import type { TypingStats } from '@/types/engine'

interface StatsBarProps {
  stats: TypingStats
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const statConfigs = [
  { label: 'WPM', key: 'wpm' as const, format: (v: number) => v.toFixed(0) },
  {
    label: 'Accuracy',
    key: 'accuracy' as const,
    format: (v: number) => `${v.toFixed(0)}%`,
  },
  {
    label: 'Time',
    key: 'timeElapsed' as const,
    format: formatTime,
  },
  {
    label: 'Errors',
    key: 'errorCount' as const,
    format: (v: number) => v.toFixed(0),
  },
]

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-4"
      role="status"
      aria-label="Typing statistics"
    >
      {statConfigs.map(({ label, key, format }) => (
        <div
          key={key}
          className="flex flex-col items-center rounded-xl bg-bg-elevated border border-surface/30 p-2 sm:p-3"
        >
          <span className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider">
            {label}
          </span>
          <span className="text-lg sm:text-2xl font-bold text-text tabular-nums mt-0.5">
            {format(stats[key])}
          </span>
        </div>
      ))}
    </div>
  )
}
