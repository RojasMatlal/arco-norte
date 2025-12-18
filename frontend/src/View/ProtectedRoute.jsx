import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const user = AuthService.getUser();

  // No logueado
  if (!user) return <Navigate to="/login" replace />;

  // Normaliza id_rol a número
  const idRol = Number(user.id_rol);

  // Logueado pero sin rol permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(idRol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
