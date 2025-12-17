import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './users.css';

export default function Users() {
  const navigate = useNavigate();
  const user = AuthService.getUser();//obtiene usuarios de AuthService

 useEffect(() => {
  if (!user) navigate('/login', { replace: true });
}, [user, navigate]);


  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Cargando sesión…</h2>
      </div>
    );
  }

  // Normaliza el rol
  const idRol = Number(user.id_rol);
  const rolNombre = String(user.rol || '').toLowerCase();

  const isAdmin = idRol === 745 || rolNombre === 'administrador';
  const isOper = idRol === 125 || rolNombre === 'operador';

  if (isAdmin) return <AdminView user={user} onLogout={() => doLogout(navigate)} />;
  if (isOper) return <OperView user={user} onLogout={() => doLogout(navigate)} />;

  // Rol no permitido / desconocido
  return (
    <div style={{ padding: 24 }}>
      <h2>Acceso restringido</h2>
      <p>
        Tu rol no tiene una vista asignada. (id_rol: <strong>{String(user.id_rol)}</strong>)
      </p>

      <button
        onClick={() => {
          AuthService.logout();
          navigate('/login', { replace: true });
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
function doLogout(navigate) {
  AuthService.logout();
  navigate('/login', { replace: true });
}

// ---------- Vista ADMIN (solo admin) ----------
function AdminView({ user, onLogout }) {
  return (
    <div className="users-shell">
      <header className="users-header">
        <div>
          <h2>Panel Administrador</h2>
          <p className="users-subtitle">
            {user.nombre} — {user.rol} — {user.area}
          </p>
        </div>
        <button className="users-logout" onClick={onLogout}>Salir</button>
      </header>

      <main className="users-main">
        {/* ✅ Aquí va tu UI/funcionalidad de admin */}
        <section className="card">
          <h3>Gestión de usuarios</h3>
          <p>Crear/editar usuarios, asignar roles, ver lista completa, etc.</p>
          {/* aquí puedes poner tu tabla de usuarios, botones, etc */}
        </section>

        <section className="card">
          <h3>Permisos y Roles</h3>
          <p>Administrar roles (745/125), permisos por módulo, etc.</p>
        </section>

        <section className="card">
          <h3>Reportes</h3>
          <p>Reportes globales, exportación, auditoría.</p>
        </section>
      </main>
    </div>
  );
}

// ---------- Vista OPERADOR (solo operador) ----------
function OperView({ user, onLogout }) {
  return (
    <div className="users-shell">
      <header className="users-header">
        <div>
          <h2>Panel Operador</h2>
          <p className="users-subtitle">
            {user.nombre} — {user.rol} — {user.area}
          </p>
        </div>
        <button className="users-logout" onClick={onLogout}>Salir</button>
      </header>

      <main className="users-main">
        {/* ✅ Aquí va tu UI/funcionalidad de operador */}
        <section className="card">
          <h3>Mis tareas</h3>
          <p>Ver y actualizar tareas asignadas (sin administración global).</p>
        </section>

        <section className="card">
          <h3>Historial</h3>
          <p>Ver mis movimientos/acciones (solo del operador).</p>
        </section>

        <section className="card">
          <h3>Perfil</h3>
          <p>Actualizar datos personales y ver información.</p>
        </section>
      </main>
    </div>
  );
}
