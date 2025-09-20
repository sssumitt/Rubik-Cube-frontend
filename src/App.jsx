import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Import your page components
import Navbar from './pages/NavBar/NavBar';
import DashboardPage from './pages/DashBoard/DashBoard';
import SolverPage from './pages/SolverPage';
import SinglePlayerPage from './pages/SinglePlayer';
import Auth from './pages/Auth/Auth';

// Import BOTH route protection components
import ProtectedRoute from './pages/ProtectedRoute';
import TwoPlayerCubeView from './pages/MultiPlayer';
import { SocketProvider } from './context/SocketContext';

const NotFoundPage = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
);

function App() {
  const location = useLocation();
  const { isInitialized } = useContext(AuthContext);

  const navBarPaths = ['/', '/dashboard', '/solver', '/singlePlayer', '/multiPlayer'];
  const showNavbar = navBarPaths.includes(location.pathname);

  if (!isInitialized) {
    return <div>Loading Application...</div>;
  }

  return (
    <>
      {showNavbar && <Navbar />}
      
      <Routes>
        <Route 
          path="/auth" 
          element={
              <Auth />
          } 
        />
        <Route path='/multiPlayer' element={<ProtectedRoute><SocketProvider> <TwoPlayerCubeView/> </SocketProvider> </ProtectedRoute>} />
        
        {/* Your other protected routes remain the same */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/solver" 
          element={<ProtectedRoute><SolverPage /></ProtectedRoute>} 
        />
        <Route 
          path="/singlePlayer" 
          element={<ProtectedRoute><SinglePlayerPage /></ProtectedRoute>} 
        />
        <Route 
          path="/multiPlayer" 
          element={<ProtectedRoute>{/* Your Multiplayer Component Here */}</ProtectedRoute>} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;