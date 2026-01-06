import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './login.css';

import c5iImg from "./recurs/c5i.jpg";

// Si usas Material UI:
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from '@mui/material';




function Login({ title = 'Iniciar sesión', subtitle = null, subtext = null }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ===== helpers =====
  const setAlert = (type, message) => {
    setMsgType(type);
    setMsg(message);
  };

  const goByRole = (user) => {
    const idRol = Number(user?.id_rol ?? user?.rol_id ?? user?.idRol ?? user?.id_role);
    const rolNombre = String(user?.rol ?? user?.role ?? user?.nombre_rol ?? "").toLowerCase();

    // ✅ tus rutas
   if (idRol === 745 || rolNombre.includes("admin")) {
      navigate("/user_admin", { replace: true });
      return;
    }

    if (idRol === 125 || rolNombre.includes("oper")) {
      navigate("/user_oper", { replace: true });
      return;
    }

    setAlert("warning", "Usuario no autorizado.");
    navigate("/login", { replace: true });
  };

  const classifyError = (message) => {
    const raw = String(message || '').trim();
    const low = raw.toLowerCase();

    if (
      low.includes('deshabilitado') ||
      low.includes('contraseña') ||
      low.includes('credenciales') ||
      low.includes('incorrect') ||
      low.includes('no existe') ||
      low.includes('no encontrado')
    ) {
      return { type: 'warning', text: raw || 'Inicio de sesión incorrecto' };
    }

    return { type: 'error', text: raw || 'No se pudo iniciar sesión' };
  };

  // ===== handlers =====
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMsg('');
    setMsgType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMsg('');
    setMsgType('');

    try {
    const result = await AuthService.login(form.email, form.password);
      if (!result?.success) {
        const { type, text } = classifyError(result?.message);
        setAlert(type, text);
        return;
      }

      const savedUser = AuthService.getUser();
      if (!savedUser) {
        setAlert('error', 'Sesión no guardada. Reintenta el login.');
        return;
      }

      //  success
      
      setAlert("success", `Bienvenido ${savedUser?.nombre || ""} (${savedUser?.rol || "usuario"})`);

      if (remember) localStorage.setItem("remember", "1");
      else localStorage.removeItem("remember");

      goByRole(savedUser);
    } catch (err) {
      console.error(err);
      setAlert("error", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  const alertClass =
    msgType === 'success'
      ? 'alert alert-success'
      : msgType === 'warning'
      ? 'alert alert-warning'
      : msgType === 'error'
      ? 'alert alert-error'
      : '';

  return (
    <div className="login-page">
    <div className="background-logo" />

      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          {/* ===== LogoC5i ===== */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {<img
              src={c5iImg}
              alt="c5i"
              style={{ height: 72, objectFit: 'contain' }}
            />}
          </Box>

          {/* ===== Title / Subtext ===== */}
          {title ? (
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {title}
            </Typography>
          ) : null}

          {subtext ? <Box sx={{ mb: 2 }}>{subtext}</Box> : null}

          {/* ===== Alertas ===== */}
          {msg && <div className={alertClass}>{msg}</div>}

          {/* ===== Inputs ===== */}
          <Stack>
            <Box>
              <Typography
                variant="subtitle1"
                component="label"
                htmlFor="email"
                sx={{ fontWeight: 600, mb: '5px', display: 'block' }}
              >
                Usuario
              </Typography>

              <input
                id="email"
                className="mui-like-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@gmail.com"
                required
                disabled={loading}
              />
            </Box>

            <Box sx={{ mt: '25px' }}>
              <Typography
                variant="subtitle1"
                component="label"
                htmlFor="password"
                sx={{ fontWeight: 600, mb: '5px', display: 'block' }}
              >
                Contraseña
              </Typography>

              <input
                id="password"
                className="mui-like-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                required
                disabled={loading}
              />
            </Box>

            {/* ===== Remember / Forgot ===== */}
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', my: 2 }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                  }
                  label="Recordar este dispositivo"
                />
              </FormGroup>

              {/* Ajusta esta ruta si tienes una vista real */}
              <Typography
                component={RouterLink}
                to="/login"
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'primary.main',
                }}
              >
              </Typography>
            </Stack>
          </Stack>

          {/* ===== Submit ===== */}
          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          {subtitle ? <Box sx={{ mt: 2 }}>{subtitle}</Box> : null}
        </form>
      </div>
    </div>
  );
}

export default Login;
