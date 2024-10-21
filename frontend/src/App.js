import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Game from './Game';
import Game2 from './Game2';
import Game3 from './Game3';
import Game4 from './Game4';
import Game5 from './Game5';
import axios from 'axios';

// Helper function to check if the user is authenticated
const checkAuth = async () => {
  try {
    const response = await axios.get('http://localhost:8081/check-auth', {
      withCredentials: true, // Send cookies to check session
    });
    return response.data.isAuthenticated; // Expected response to indicate authentication status
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// ProtectedRoute component to protect specific routes
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Optional: A loading state while verifying
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Use ProtectedRoute to protect the routes that require authentication */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/game2" element={<ProtectedRoute><Game2 /></ProtectedRoute>} />
        <Route path="/game3" element={<ProtectedRoute><Game3 /></ProtectedRoute>} />
        <Route path="/game4" element={<ProtectedRoute><Game4 /></ProtectedRoute>} />
        <Route path="/game5" element={<ProtectedRoute><Game5 /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
