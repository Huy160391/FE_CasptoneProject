import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import './LanguageSwitcher.scss'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const handleChange = (value: string) => {
    i18n.changeLanguage(value)
  }

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      className="select-language-container"
      options={[
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'en', label: 'English' },
      ]}
    />
  )
}

export default LanguageSwitcher
