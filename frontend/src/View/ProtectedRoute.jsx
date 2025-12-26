import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const user = AuthService.getUser();

  if (!user) return <Navigate to="/login" replace />;

  const idRol=Number(user.id_rol);

  if (allowedRoles.length > 0 && !allowedRoles.includes(idRol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
