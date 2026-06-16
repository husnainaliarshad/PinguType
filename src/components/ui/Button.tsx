import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/50',
  secondary:
    'bg-surface text-text hover:bg-bg-elevated focus-visible:ring-text-muted',
  ghost:
    'bg-transparent text-text-muted hover:bg-surface hover:text-text focus-visible:ring-text-muted',
  danger:
    'bg-incorrect text-white hover:bg-red-600 focus-visible:ring-red-500/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
        active:scale-[0.97]
        disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
