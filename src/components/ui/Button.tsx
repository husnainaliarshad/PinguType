import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta text-white hover:brightness-110 focus-visible:ring-terracotta/50',
  secondary:
    'bg-sand-light text-espresso border border-espresso/15 hover:bg-sand focus-visible:ring-espresso/20',
  ghost:
    'bg-transparent text-espresso-muted hover:text-espresso hover:bg-sand-light focus-visible:ring-espresso/20',
  danger:
    'bg-burgundy text-white hover:brightness-110 focus-visible:ring-burgundy/50',
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
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
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
