// src/services/AuthService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const AuthService = {
  async login(email, password) {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/login`,
        { email, password },
        { timeout: 10000 }
      );

      const data = res.data;
      if (!data?.success) return data;

      // Normaliza user para ProtectedRoute + vistas
      if (data.user) {
        const u = data.user;
        const normalized = {
          ...u,
          id_rol: Number(u.id_rol ?? u.rol_id ?? u.idRol ?? u.id_role),
          rol: u.rol ?? u.role ?? u.nombre_rol,
        };
        localStorage.setItem("user", JSON.stringify(normalized));
      }

      if (data.token) localStorage.setItem("token", data.token);

      return data;
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        return {
          success: false,
          message: `HTTP ${err.response.status}: ${
            err.response.data?.debug || err.response.data?.message || "Error del servidor"
          }`,
        };
      }

      return {
        success: false,
        message: `Sin respuesta del servidor (CORS/URL). API_BASE_URL=${API_BASE_URL}`,
      };
    }
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("remember");
  },
};
