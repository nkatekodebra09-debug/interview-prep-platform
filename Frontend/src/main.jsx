import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import './styles/landing.css';
import './styles/login.css';
import './styles/dashboard.css';
import './styles/workspace.css';
import './styles/student.css';
import './styles/instructor.css';
import './styles/admin.css';
import './styles/assessment.css';
import './styles/responsive.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
