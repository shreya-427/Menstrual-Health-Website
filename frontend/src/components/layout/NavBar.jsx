import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◎' },
  { to: '/calendar',  label: 'Calendar',  icon: '📅' },
  { to: '/log',       label: 'Log',       icon: '✏️'  },
  { to: '/insights',  label: 'Insights',  icon: '📊' },
  { to: '/education', label: 'Education', icon: '📚' },
  { to: '/settings',  label: 'Settings',  icon: '⚙️'  },
]

/**
 * NavBar — top navigation bar.
 * Props:
 *   theme         'light' | 'dark'
 *   onToggleTheme () => void
 */
export default function NavBar({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    [
      'px-3 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-brand-pink/20 text-brand-pink-dark dark:bg-brand-pink/30 dark:text-brand-pink'
        : 'text-gray-600 hover:text-brand-purple dark:text-gray-300 dark:hover:text-brand-purple',
    ].join(' ')

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-brand-card-dark/80 backdrop-blur border-b border-gray-100 dark:border-white/10">
      <nav
        className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14"
        aria-label="Main navigation"
      >
        {/* Logo / brand */}
        <span className="font-semibold text-brand-pink-dark dark:text-brand-pink text-base select-none">
          CycleTracker
        </span>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-gray-500 hover:text-brand-purple dark:text-gray-400 dark:hover:text-brand-purple transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-brand-purple dark:text-gray-400 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-gray-100 dark:border-white/10 bg-white dark:bg-brand-card-dark"
        >
          <ul className="flex flex-col p-3 gap-1" role="list">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-2" aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
