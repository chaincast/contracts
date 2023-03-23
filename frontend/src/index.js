import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './pages/LandingPage';

// We import bootstrap here, but you can remove if you want
import 'bootstrap/dist/css/bootstrap.css';

// This is the entry point of your application, but it just renders the LandingPage
// react component. All of the logic is contained in it.

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
);
