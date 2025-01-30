import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = document.getElementById('root');
console.log('Root element:', root);

if (!root) {
  console.error('Root element not found!');
} else {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
}
