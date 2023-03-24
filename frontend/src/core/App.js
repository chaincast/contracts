/**
 * @fileoverview The core application component, everything starts from here.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// core components
import Router from './Router';

function App() {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
