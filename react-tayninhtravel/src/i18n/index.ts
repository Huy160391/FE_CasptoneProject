import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import viMessages from './messages/vi.json'
import enMessages from './messages/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: viMessages },
      en: { translation: enMessages },
    },
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
