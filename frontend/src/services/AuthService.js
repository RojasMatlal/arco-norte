import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

function normalizeUser(u) {
  return {
    id_usuario: u.id_usuario,
    nombre: u.nombre,
    apellidoPaterno: u.ap_paterno,
    email: u.email,
    id_rol: Number(u.id_rol),
    rol: u.rol,
  };
}

export const AuthService = {
  async login(email, password) {
    try {
      const res = await axios.post(`${API}/api/login`, { email, password });

      if (res.data.success) {
        const user = normalizeUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return res.data;
    } catch (err) {
      return { success: false, message: 'No se pudo conectar con el servidor' };
    }
  },

  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  isAuthenticated() {
    return !!localStorage.getItem('user');
  },

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  },
};
