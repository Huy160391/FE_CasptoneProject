import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.scss'
import App from './App.tsx'
import './i18n'
import setupConsoleSilencer from './utils/consoleSilencer'

// Set up console silencer to filter out known third-party errors
setupConsoleSilencer()

// Additional event listener for network errors
window.addEventListener('error', (event) => {
  if (event.filename?.includes('cloudflareinsights') ||
    (typeof event.message === 'string' && event.message.includes('ERR_BLOCKED_BY_CLIENT'))) {
    event.preventDefault()
    return true
  }
  return false
}, true)

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)