import { useNavigate } from 'react-router-dom'
import { Keyboard, Zap, BarChart3 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: Keyboard,
    title: 'Precision',
    desc: 'Character-level feedback shows exactly where you slip.',
  },
  {
    icon: Zap,
    title: 'Speed',
    desc: 'Track your WPM in real-time and push your limits.',
  },
  {
    icon: BarChart3,
    title: 'Progress',
    desc: 'Detailed stats after every session to measure growth.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center gap-10 pt-6 sm:pt-12 pb-8">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-primary tracking-tight">
          PinguType
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
          Sharpen your typing. Master every keystroke. Beautiful, minimal, and relentless.
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={() => navigate('/practice')}>
            Start Typing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="flex flex-col items-center text-center p-6 gap-3">
            <Icon size={28} className="text-accent" />
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-sm text-text-muted">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
