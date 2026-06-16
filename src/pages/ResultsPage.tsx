import { type ElementType } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RotateCcw, Trophy, Gauge, Target, Timer, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { TypingStats } from '@/types/engine'

interface StatRowProps {
  icon: ElementType
  label: string
  value: string
  color?: string
}

function StatRow({ icon: Icon, label, value, color = 'text-text' }: StatRowProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-text-muted shrink-0" />
      <span className="text-sm text-text-muted flex-1">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface ResultsState {
  stats: TypingStats
  sourceId: string
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResultsState | null

  if (!state?.stats) {
    return (
      <div className="flex flex-col items-center gap-6 pt-12">
        <Trophy size={48} className="text-text-muted/40" />
        <p className="text-text-muted text-lg">No results yet.</p>
        <p className="text-text-muted text-sm -mt-3">
          Complete a practice session to see your stats here.
        </p>
        <Button onClick={() => navigate('/practice')}>Start a Session</Button>
      </div>
    )
  }

  const { stats } = state

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto pt-4">
      <Trophy size={40} className="text-current-char" />

      <Card className="w-full p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text text-center">Session Results</h2>

        <div className="flex flex-col gap-3">
          <StatRow
            icon={Gauge}
            label="WPM"
            value={stats.wpm.toFixed(0)}
          />
          <StatRow
            icon={Gauge}
            label="Raw WPM"
            value={stats.rawWpm.toFixed(0)}
            color="text-text-muted"
          />
          <StatRow
            icon={Target}
            label="Accuracy"
            value={`${stats.accuracy.toFixed(1)}%`}
            color={stats.accuracy >= 95 ? 'text-correct' : 'text-current-char'}
          />
          <StatRow
            icon={Timer}
            label="Time"
            value={formatTime(stats.timeElapsed)}
          />
          <StatRow
            icon={AlertCircle}
            label="Errors"
            value={stats.errorCount.toString()}
            color={stats.errorCount === 0 ? 'text-correct' : 'text-incorrect'}
          />
        </div>

        <div className="pt-2 border-t border-surface/30 text-sm text-text-muted text-center">
          {stats.completedChars} / {stats.totalChars} characters typed
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => navigate('/practice')}>
          <RotateCcw size={16} className="mr-2" />
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    </div>
  )
}
