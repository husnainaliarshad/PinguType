import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import { getCustomText, saveCustomText } from '@/text/custom'
import { listTextSources } from '@/text'

const sources = listTextSources()

export default function SettingsPage() {
  const [textSource, setTextSource] = useState('library')
  const [difficulty, setDifficulty] = useState('medium')
  const [duration, setDuration] = useState('0')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [blinkingCursor, setBlinkingCursor] = useState(true)
  const [keySounds, setKeySounds] = useState(false)
  const [customText, setCustomText] = useState(() => getCustomText())

  const handleSaveCustom = () => {
    saveCustomText(customText)
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 pt-4">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
        Settings
      </h2>

      <Card className="p-6 flex flex-col gap-6">
        <Select
          label="Text Source"
          options={sources.map((s) => ({ value: s.id, label: s.name }))}
          value={textSource}
          onChange={(e) => setTextSource(e.target.value)}
        />

        {textSource === 'custom' && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="custom-text"
              className="text-sm font-medium text-text-muted"
            >
              Custom Text
            </label>
            <textarea
              id="custom-text"
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your practice text here..."
              className="w-full rounded-lg bg-surface border border-surface/50 px-4 py-3 text-text text-sm
                resize-y placeholder:text-text-muted/50
                transition-all duration-200 ease-in-out
                hover:border-text-muted/30
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveCustom}>
                Save Text
              </Button>
            </div>
          </div>
        )}

        <Select
          label="Difficulty"
          options={[
            { value: 'easy', label: 'Easy — short words' },
            { value: 'medium', label: 'Medium — mixed length' },
            { value: 'hard', label: 'Hard — punctuation & caps' },
          ]}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />

        <Select
          label="Duration"
          options={[
            { value: '30', label: '30 seconds' },
            { value: '60', label: '1 minute' },
            { value: '120', label: '2 minutes' },
            { value: '0', label: 'Free typing (no limit)' },
          ]}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-text-muted">Display</span>
          <div className="flex flex-col gap-3">
            <Toggle
              checked={showKeyboard}
              onChange={setShowKeyboard}
              label="Show on-screen keyboard"
            />
            <Toggle
              checked={blinkingCursor}
              onChange={setBlinkingCursor}
              label="Blinking cursor"
            />
            <Toggle
              checked={keySounds}
              onChange={setKeySounds}
              label="Keypress sounds"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
