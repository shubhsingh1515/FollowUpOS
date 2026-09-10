import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => null,
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('followupos-theme') as Theme) || 'light'
  })

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let darkActive = false
    if (theme === 'system') {
      darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      darkActive = theme === 'dark'
    }

    setIsDark(darkActive)
    if (darkActive) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
    localStorage.setItem('followupos-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
