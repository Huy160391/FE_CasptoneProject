import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from './routes';
import Chatbot from './components/common/Chatbot';
import './styles/global.scss';

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
      <Chatbot />
    </Router>
  );
};

export default App;
