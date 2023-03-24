/**
 * @fileoverview Master Router of application.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from 'pages/LandingPage';
import BroadcasterCreate from 'pages/BroadcasterCreate';

function Router() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />}></Route>
      <Route
        exact
        path="/broadcasters/create"
        element={<BroadcasterCreate />}
      ></Route>
    </Routes>
  );
}

export default Router;
