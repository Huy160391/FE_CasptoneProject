import { Button, Tooltip } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useThemeStore } from '@/store/useThemeStore'
import { useTranslation } from 'react-i18next'
import './ThemeToggle.scss'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore()
  const { t } = useTranslation()

  const buttonStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    borderRadius: '50%',
    marginRight: '8px',
    backgroundColor: isDarkMode ? '#79eac0' : undefined,
    color: isDarkMode ? '#000000' : undefined,
  }

  return (
    <Tooltip title={isDarkMode ? t('common.light_mode') : t('common.dark_mode')}>
      <Button
        type="text"
        icon={
          isDarkMode ? (
            <SunOutlined className="theme-icon light-icon" />
          ) : (
            <MoonOutlined className="theme-icon dark-icon" />
          )
        }
        onClick={toggleTheme}
        style={buttonStyle}
      />
    </Tooltip>
  )
}

export default ThemeToggle
