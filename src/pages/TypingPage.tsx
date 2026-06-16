import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import TypingArea from '@/components/typing/TypingArea'
import Toolbar from '@/components/Toolbar'
import { useTypingSession } from '@/hooks/useTypingSession'

export default function TypingPage() {
  const session = useTypingSession()

  useEffect(() => {
    if (
      session.phase === 'complete' &&
      session.pageInfo &&
      session.pageInfo.current < session.pageInfo.total
    ) {
      session.nextChunk()
    }
  }, [session.phase, session.pageInfo, session.nextChunk])

  const isReady =
    session.phase === 'ready' ||
    session.phase === 'active' ||
    session.phase === 'complete'

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto pt-2 sm:pt-4">
      <Toolbar
        stats={session.stats}
        pageInfo={session.pageInfo}
        isLoading={session.isLoading}
        onUpload={() => session.loadText('pdf')}
        onPrevPage={session.prevChunk}
        onNextPage={session.nextChunk}
        onGoToPage={session.goToChunk}
      />

      {session.error && (
        <div className="flex items-center gap-2 rounded-lg bg-burgundy/10 border border-burgundy/20 px-4 py-3 text-sm text-burgundy">
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
        onJumpToChar={session.jumpToChar}
        onKeyDown={session.handleKeyDown}
      />
    </div>
  )
}
