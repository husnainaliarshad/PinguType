import { ChevronDown } from 'lucide-react'
import { type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  label?: string
}

export default function Select({
  options,
  label,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-lg bg-surface border border-surface/50 px-4 py-2.5 pr-10 text-text
            transition-all duration-200 ease-in-out
            hover:border-text-muted/30
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </div>
  )
}
