import { forwardRef } from 'react'

interface TypingInputProps {
  disabled: boolean
}

const TypingInput = forwardRef<HTMLInputElement, TypingInputProps>(
  ({ disabled }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={disabled}
        onPaste={(e) => e.preventDefault()}
        onChange={() => {}}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
          }
        }}
        aria-label="Type the text shown above"
        className="absolute inset-0 opacity-0"
      />
    )
  },
)

TypingInput.displayName = 'TypingInput'

export default TypingInput
