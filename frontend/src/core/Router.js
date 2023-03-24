/**
 * @fileoverview Master Router of application.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from 'pages/LandingPage';

function Router() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />}></Route>
    </Routes>
  );
}

export default Router;
