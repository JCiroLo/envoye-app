import type { CSSProperties } from 'react'

export type EventTheme = {
  preset: string
  colors?: Record<string, string>
}

const themes: Record<string, Record<string, string>> = {
  lavender: { primary: '#6d4aff', secondary: '#efeaff', background: '#f8f7ff', ink: '#292340', accent: '#d8f5ec', mural: '#211b42' },
  rose: { primary: '#d95083', secondary: '#fff0f5', background: '#fff8fa', ink: '#452532', accent: '#ffe2c9', mural: '#3f172b' },
  ocean: { primary: '#1778b5', secondary: '#e8f6ff', background: '#f5fbff', ink: '#153041', accent: '#cef4e5', mural: '#08283a' },
  midnight: { primary: '#a58bff', secondary: '#26213d', background: '#171521', ink: '#f7f5ff', accent: '#f2c6ff', mural: '#0b0912' },
}

export const themeValues = (theme?: EventTheme) => ({ ...themes[theme?.preset ?? 'lavender'], ...(theme?.colors ?? {}) })

export const themeStyle = (theme?: EventTheme): CSSProperties => {
  const value = themeValues(theme)
  return {
    '--event-primary': value.primary, '--event-secondary': value.secondary,
    '--event-background': value.background, '--event-ink': value.ink,
    '--event-accent': value.accent, '--event-mural': value.mural,
    '--primary': value.primary, '--secondary': value.secondary, '--ring': value.primary,
  } as CSSProperties
}

export const applyThemeToDocument = (theme?: EventTheme) => {
  const value = themeValues(theme)
  const root = document.documentElement
  root.style.setProperty('--event-primary', value.primary)
  root.style.setProperty('--event-secondary', value.secondary)
  root.style.setProperty('--event-background', value.background)
  root.style.setProperty('--event-ink', value.ink)
  root.style.setProperty('--event-accent', value.accent)
  root.style.setProperty('--event-mural', value.mural)
}

export const themeOptions = Object.keys(themes)
