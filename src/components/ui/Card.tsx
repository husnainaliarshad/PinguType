import { type ReactNode, type HTMLAttributes } from 'react'
import { User } from 'lucide-react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`relative rounded-lg bg-sand-light border-l-[16px] border-l-brick shadow-md ${className}`}
      {...props}
    >
      <User
        size={20}
        className="absolute top-4 right-4 text-espresso-muted"
        strokeWidth={1.5}
      />
      {children}
    </div>
  )
}
