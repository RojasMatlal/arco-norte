import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goByRole = (user) => {
    const idRol = Number(user?.id_rol);
    const rolNombre = String(user?.rol || '').toLowerCase();

    const isAdmin = idRol === 745 || rolNombre === 'administrador';
    const isOper = idRol === 125 || rolNombre === 'operador';

    if (isAdmin) return navigate('/user_admin', { replace: true });
    if (isOper) return navigate('/user_oper', { replace: true });

    // fallback (si llega un rol distinto)
    return navigate('/login', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMsg('');
    setMsgType('');
    setLoading(true);

    try {
      const result = await AuthService.login(form.email, form.password);

      if (!result?.success) {
        setMsg(result?.message || 'Inicio de sesión incorrecto');
        setMsgType('error');
        return;
      }

      // ✅ AuthService ya guarda el usuario; lo leemos de ahí
      const savedUser = AuthService.getUser();

      if (!savedUser) {
        setMsg('Sesión no guardada. Reintenta el login.');
        setMsgType('error');
        return;
      }

      setMsg(`Bienvenido ${savedUser.nombre} (${savedUser.rol})`);
      setMsgType('success');

      // ✅ redirección por rol
      goByRole(savedUser);

    } catch (err) {
      console.error(err);
      setMsg('Error al conectar con el servidor');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="background-logo"></div>

      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          {msg && <div className={alertClass}>{msg}</div>}

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
