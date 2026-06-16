import { type ReactNode, type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-bg-elevated border border-surface/50 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
