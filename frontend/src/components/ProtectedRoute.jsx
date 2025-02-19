import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Fetch stored token

  if (token) {
    return <Navigate to="/" replace />; // Redirect logged-in users to home page
  }

  return children; // Allow access if not logged in
};

export default ProtectedRoute;
