import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
}

const items: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/practice', label: 'Practice' },
  { to: '/results', label: 'Results' },
  { to: '/settings', label: 'Settings' },
]

export default function NavBar() {
  const baseClasses =
    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out'

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-1">
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${baseClasses} ${
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-text hover:bg-surface'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
