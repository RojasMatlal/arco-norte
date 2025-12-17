import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './View/login.jsx'; 
import Users from './View/users.jsx'; 
import ProtectedRoute from "./View/ProtectedRoute";
//import { AuthService } from './services/AuthService.js';

 function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}/>

          {/* UNA sola ruta protegida */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
