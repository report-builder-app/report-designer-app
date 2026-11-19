import React from 'react';
import './index.css';
import App from './App';
import { ReportProvider } from './contexts/ReportContext';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <React.StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
