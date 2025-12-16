import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
   const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');  //alertas
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
       setMsgType('');
    setLoading(true);

    try {
      const result = await AuthService.login(form.email, form.password);

      if (result.success) {
        const user = result.user;
        setMsg(`Bienvenido ${user.nombre} (${user.rol})`);
        setMsgType('success');

        // Guardar usuario 
        localStorage.setItem('user', JSON.stringify(user));

        // Redirección según rol (ajusta IDs a los de tu BD)
        setTimeout(() => {
        if (user.id_rol === 745) {
          console.log('LOGIN RESULT:', result);
          navigate('/users');      // ruta panel administrador
        } else if (user.id_rol === 125) {
          console.log('LOGIN RESULT:', result);
          navigate('/users');   // ruta panel operador
        } else {
          navigate('/');           // ruta por defecto
        }
    },800);
      } else {
        setMsg(result.message || 'Inicio de sesión incorrecto');
        setMsgType('error');
      }
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
      <div className="background-logo" ></div>
      
    <div className="login-container">
       <form className="login-form" onSubmit={handleSubmit}>

        <h2>Iniciar sesión</h2>

           {msg && (
            <div className={alertClass}>
              {msg}
            </div>
          )}


        <div className="form-group">
        <label>Usuario</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="user"
          required
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
        />
        </div>

        <button type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}>
                 {loading ? 'Entrando...' : 'Entrar'}
        </button>

    </form>
      </div>
    </div>
  );
}

export default Login;
