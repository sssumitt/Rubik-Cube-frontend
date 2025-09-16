import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components.
// Make sure you have created these files in a `src/pages` folder.

import Navbar from './pages/NavBar/NavBar';
import DashboardPage from './pages/DashBoard/DashBoard';
import SolverPage from './pages/SolverPage';
import  SinglePlayerPage from './pages/SinglePlayer';

// This App component now acts as the main router for your website.
function App() {
  return (
    <>
    <Navbar/> 
      <Routes>
        <Route path="/" element={<DashboardPage/>} />
        <Route path="/solver" element={<SolverPage/>}/>
        <Route path="/singlePlayer" element={<SinglePlayerPage/>} />
         <Route path="/multiPlayer" element= {<></>} />
      </Routes>
    </>
   
  );
}

export default App;

