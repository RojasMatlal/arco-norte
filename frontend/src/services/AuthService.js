import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const AuthService = {
  async login(email, password) {
    try{
        const res = await axios.post(`${API_BASE_URL}/login`, { email, password });

        return res.data;
    }catch (error) {
      console.error('Error en AuthService.login:', error);
   
      // Si el backend respondió con error 4xx/5xx
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Error en autenticación',
        };
      }

      // Error de red, timeout, etc.
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  },
};