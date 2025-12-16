import axios from 'axios';

// Base URL del backend
// .env → REACT_APP_API_URL=http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthService = {

  // 🔐 LOGIN
  async login(email, password) {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/login`,
        { email, password }
      );

      // El backend ya devuelve { success, message, user }
      if (res.data?.success && res.data.user) {
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      return res.data;

    } catch (error) {
      console.error('Error en AuthService.login:', error);

      // Error con respuesta del backend
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Error en autenticación',
        };
      }

      // Error de red / backend apagado
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  },

  // 👤 OBTENER USUARIO LOGUEADO
  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  // 🚪 LOGOUT
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // por si luego usas JWT
  },

  // ✅ UTILIDAD EXTRA (opcional pero recomendable)
  isAuthenticated() {
    return !!localStorage.getItem('user');
  }
};
