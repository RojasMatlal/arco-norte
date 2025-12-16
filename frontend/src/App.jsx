import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './View/login.jsx'; 
import Users from './View/users.jsx'; 

 function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />}/>
      <Route path="/users" element={<Users />}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
