import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
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
      className="language-switcher"
      options={[
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'en', label: 'English' },
      ]}
      suffixIcon={<GlobalOutlined />}
    />
  )
}

export default LanguageSwitcher
