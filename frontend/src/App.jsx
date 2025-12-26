import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './View/login.jsx'; 
import User_Admin from './View/user_admin.jsx'; 
import User_Oper from './View/user_oper.jsx'; 
import {AuthService} from "./services/AuthService.js";


// ✅ Ruta protegida por autenticación y rol
function ProtectedRoute({ allowedRoles = [], children }) {
  const user = AuthService.getUser();

  // No hay sesión
  if (!user) return <Navigate to="/login" replace />;

  const idRol = Number(user?.id_rol);
  const rolNombre = String(user?.rol || "").toLowerCase();

  // Si allowedRoles está vacío -> solo requiere login
  if (allowedRoles.length === 0) return children;

  // Permitir por ID de rol (745 admin, 125 operador)
  const allowed = allowedRoles.includes(idRol);

  // fallback por nombre (por si tu BD manda strings)
  const allowedByName =
    (allowedRoles.includes(745) && rolNombre === "administrador") ||
    (allowedRoles.includes(125) && rolNombre === "operador");

  return allowed || allowedByName ? children : <Navigate to="/login" replace />;
}

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
