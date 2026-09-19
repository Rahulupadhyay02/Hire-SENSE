import { createContext, useContext, useState } from 'react'

export const ThemeContext = createContext({
  isDark: false,
  toggle: () => { },
  setDark: () => { },
})

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.body.classList.add('dark-mode')
        document.body.classList.remove('light-mode')
      } else {
        document.body.classList.remove('dark-mode')
        document.body.classList.add('light-mode')
      }
      return next
    })
  }

  const setDark = (dark) => {
    setIsDark(dark)
    if (dark) {
      document.body.classList.add('dark-mode')
      document.body.classList.remove('light-mode')
    } else {
      document.body.classList.remove('dark-mode')
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

