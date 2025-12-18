import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './View/login.jsx'; 
import UserAdmin from './View/user_admin.jsx'; 
import UserOper from './View/user_oper.jsx'; 
import ProtectedRoute from "./View/ProtectedRoute";

 function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}/>

       <Route
  path="/user_admin"
  element={
    <ProtectedRoute allowedRoles={[745]}>
      <UserAdmin />
    </ProtectedRoute>
  }
/>

<Route
  path="/user_oper"
  element={
    <ProtectedRoute allowedRoles={[125]}>
      <UserOper />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
