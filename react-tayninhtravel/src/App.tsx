import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import Chatbot from './components/common/Chatbot'
import './styles/global.scss'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Chatbot />
    </BrowserRouter>
  )
}

export default App
