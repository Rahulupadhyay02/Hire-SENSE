import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const ThemeContext = createContext({
  isDark: false,
  themeMode: 'system', // 'light' (Day), 'dark' (Night), 'system'
  toggle: () => { },
  setDark: () => { },
  setMode: () => { },
})

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode')
    return saved || 'system'
  })

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true
  })

  // Listen to OS preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Derived isDark boolean for consumers (e.g. charts, SVGs)
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemIsDark)

  const setMode = useCallback((mode) => {
    setThemeMode(mode)
    try {
      localStorage.setItem('theme-mode', mode)
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setMode(isDark ? 'light' : 'dark')
  }, [isDark, setMode])

  const setDark = useCallback((dark) => {
    setMode(dark ? 'dark' : 'light')
  }, [setMode])

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, toggle, setDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
