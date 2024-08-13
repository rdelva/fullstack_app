import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import { UserProvider } from './context/UserContext';


import './styles/reset.css';
import './styles/global.css';
import './styles/styles.css';


import App from './App';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>      
        <UserProvider>
          <App />
        </UserProvider>     
    </BrowserRouter>
  </React.StrictMode>
);