import en from './en.json'
import ja from './ja.json'

export type Locale = 'en' | 'ja'
export type TranslationKey = keyof typeof en

const translations: Record<Locale, typeof en> = {
  en,
  ja,
}

let currentLocale: Locale = 'en'

/**
 * Set active locale
 */
export function setLocale(locale: Locale) {
  currentLocale = locale
  document.documentElement.lang = locale
  localStorage.setItem('hagumi-locale', locale)
}

/**
 * Get active locale
 */
export function getLocale(): Locale {
  return currentLocale
}

/**
 * Initialize locale from localStorage or browser default
 */
export function initLocale(): Locale {
  const saved = localStorage.getItem('hagumi-locale') as Locale | null
  if (saved && translations[saved]) {
    currentLocale = saved
    return saved
  }
  // Try browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'ja') {
    currentLocale = 'ja'
  }
  document.documentElement.lang = currentLocale
  return currentLocale
}

/**
 * Translate a key with optional interpolation
 * Usage: t('pet.feed') or t('death.passed_away', { name: 'Mochi' })
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: unknown = translations[currentLocale as Locale]
  
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k]
  }

  if (typeof value !== 'string') {
    console.warn(`[i18n] Missing translation: ${key} (${currentLocale})`)
    return key
  }

  // Interpolate {param}
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, param) => {
      return params[param]?.toString() || `{${param}}`
    })
  }

  return value
}

/**
 * React hook for translations
 */
export function useTranslation() {
  return {
    t,
    locale: currentLocale,
    setLocale,
  }
}