import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw, BarChart3 } from 'lucide-react'
import TypingArea from '@/components/typing/TypingArea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useTypingSession } from '@/hooks/useTypingSession'
import { listTextSources } from '@/text'

const sources = listTextSources()

const sourceOptions = sources.map((s) => ({
  value: s.id,
  label: s.name,
}))

export default function TypingPage() {
  const navigate = useNavigate()
  const session = useTypingSession()

  useEffect(() => {
    if (session.phase === 'idle' && !session.text && !session.isLoading) {
      session.loadText('library')
    }
  }, [session.phase, session.text, session.isLoading, session.loadText])

  const isReady =
    session.phase === 'ready' ||
    session.phase === 'active' ||
    session.phase === 'complete'

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          Practice Session
        </h2>

        <div className="flex items-center gap-2">
          <Select
            options={sourceOptions}
            value={session.sourceId}
            onChange={(e) => session.loadText(e.target.value)}
            className="w-40"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => session.loadText(session.sourceId)}
            disabled={session.isLoading}
            aria-label="Reload text"
          >
            <RefreshCw
              size={16}
              className={session.isLoading ? 'animate-spin' : ''}
            />
          </Button>
          {session.phase === 'complete' && (
            <Button
              size="sm"
              onClick={() =>
                navigate('/results', {
                  state: {
                    stats: session.stats,
                    sourceId: session.sourceId,
                  },
                })
              }
            >
              <BarChart3 size={16} className="mr-1.5" />
              View Results
            </Button>
          )}
        </div>
      </div>

      {session.error && (
        <div className="flex items-center gap-2 rounded-lg bg-incorrect/10 border border-incorrect/30 px-4 py-3 text-sm text-incorrect">
          <AlertCircle size={16} />
          {session.error}
        </div>
      )}

      <TypingArea
        snapshot={session.snapshot}
        stats={session.stats}
        isReady={isReady}
        isActive={session.phase === 'active'}
        isComplete={session.phase === 'complete'}
        isLoading={session.isLoading}
        onStart={session.startSession}
        onReset={session.resetSession}
        onKeyDown={session.handleKeyDown}
      />
    </div>
  )
}
