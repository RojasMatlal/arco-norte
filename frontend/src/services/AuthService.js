import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL; // || 'http://localhost:5000';

export const AuthService = {
  async login(email, password) {
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password },{timeout: 10000});
      const data = res.data;
      // normaliza el objeto user para que SIEMPRE tenga id_rol
if (data.user) {
  const u = data.user;
  const normalized = {
    ...u,
    id_rol: Number(u.id_rol ?? u.rol_id ?? u.idRol ?? u.id_role),
    rol: u.rol ?? u.role ?? u.nombre_rol,
  };
  localStorage.setItem("user", JSON.stringify(normalized));
}

      if (!data?.success) return data;

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const status =err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      const urlMsg = `API_BASE_URL=${API_BASE_URL}`;
    if (status) {
        return { success: false, message: `HTTP ${status}: ${serverMsg || "Respuesta sin message"} | ${urlMsg}` };
      }

      // CORS / servidor apagado / URL mal
      return { success: false, message: `Sin respuesta del servidor (CORS/URL/Servidor apagado). ${urlMsg}` };
    }
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};