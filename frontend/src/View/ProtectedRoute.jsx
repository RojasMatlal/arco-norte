import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const user = AuthService.getUser();

  // No logueado
  if (!user) return <Navigate to="/login" replace />;

  // Logueado pero sin rol permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.id_rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
