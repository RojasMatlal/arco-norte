import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

export default function ProtectedRoute({ allowedRoles, children }) {
  const user = AuthService.getUser();

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(Number(user.id_rol))) {
    return <Navigate to="/login" />;
  }

  return children;
}
