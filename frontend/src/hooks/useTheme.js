import { useState, useEffect } from 'react'

/**
 * useTheme — manages light/dark mode.
 *
 * Reads the saved preference from localStorage on mount.
 * Applies 'dark' class to <html> element when dark mode is active.
 * Returns [theme, toggleTheme] where theme is 'light' | 'dark'.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return [theme, toggleTheme]
}
