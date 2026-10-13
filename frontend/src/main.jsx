import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { wakeServer } from './services/api';
import { blockInspect, guardDevtools } from './utils/blockInspect';

wakeServer();
blockInspect();
guardDevtools();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
