import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'

import './styles/global.scss'
import App from './App.tsx'
import './i18n'
import setupConsoleSilencer from './utils/consoleSilencer'
import appInitService from './services/appInitService'

// Set up console silencer to filter out known third-party errors
setupConsoleSilencer()

// Initialize app services (including token expiration timer)
// Nếu là trang public, truyền true. Có thể xác định bằng window.location.pathname
const publicPaths = ['/', '/about', '/blog', '/shop', '/tour', '/404'];
const isPublicPage = publicPaths.some(path => window.location.pathname.startsWith(path));
appInitService.initialize(isPublicPage);

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