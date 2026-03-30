import { createContext, useContext } from 'react'
import { theme } from './theme'

// Create theme context
const ThemeContext = createContext(theme)

/**
 * ThemeProvider
 * Wrap your app with this to make theme available everywhere.
 * To switch palette: edit src/theme/theme.js and change the exported `theme` object.
 */
export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme hook
 * Usage: const { theme } = useTheme()
 *        style={{ backgroundColor: theme.primary }}
 */
export function useTheme() {
  const currentTheme = useContext(ThemeContext)
  return { theme: currentTheme }
}

export default ThemeContext
