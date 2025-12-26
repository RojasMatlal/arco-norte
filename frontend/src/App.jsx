import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './View/login.jsx'; 
import User_Admin from './View/user_admin.jsx'; 
import User_Oper from './View/user_oper.jsx'; 
import ProtectedRoute from "./View/ProtectedRoute";

 function App() {
  return (
    <Routes>
      {/* Redirección por defecto al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />}/>

       <Route
       path="/user_admin"
       element={
    <ProtectedRoute allowedRoles={[745]}>
      <User_Admin />
    </ProtectedRoute>
  }
/>
  

  <Route
  path="/user_oper"
  element={
    <ProtectedRoute allowedRoles={[125]}>
      <User_Oper />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
