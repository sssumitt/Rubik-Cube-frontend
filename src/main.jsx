import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Your style imports
import '../styles/style.css';
import '../styles/utils.css';
import '../styles/component/hero.css';
import '../styles/modern-normalize.css';

import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  
    <BrowserRouter>
      <App />
    </BrowserRouter>
  
);
