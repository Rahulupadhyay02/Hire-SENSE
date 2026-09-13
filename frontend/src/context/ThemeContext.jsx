import { createContext, useContext, useState } from 'react'

export const ThemeContext = createContext({
  isDark: true,
  toggle: () => {},
  setDark: () => {},
})

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      document.body.classList.toggle('light-mode', !next)
      return next
    })
  }

  const setDark = (dark) => {
    setIsDark(dark)
    if (dark) {
      document.body.classList.remove('light-mode')
    } else {
      document.body.classList.add('light-mode')
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle, setDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

