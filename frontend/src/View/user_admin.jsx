import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './user_admin.css';

function User_Admin() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  // ======= ESTADOS =======
  const [activeView, setActiveView] = useState('dashboard'); // dashboard | perfil
  const [menuOpen, setMenuOpen] = useState(false);
 const [setProfileImage] = useState(
  user?.imagen || user?.imagen_usuario || null
);


  // ======= AUTH + ROLE GUARD =======
  useEffect(() => {
    const u = AuthService.getUser();

    if (!u) {
      navigate('/login', { replace: true });
      return;
    }

    const idRol = Number(u.id_rol);
    const rolNombre = String(u.rol || '').toLowerCase();

    const isAdmin = idRol === 745 || rolNombre === 'administrador';

    if (!isAdmin) {
      navigate('/user_oper', { replace: true });
    }
  }, [navigate]);

   // recargar imagen si cambia el user guardado
  useEffect(() => {
  setProfileImage(user?.imagen || user?.imagen_usuario || null);
}, [user]);



  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // ======= UTILIDADES =======
  const getInitials = () => {
    const fullName = `${user?.nombre || ''} ${user?.apellidoPaterno || ''}`.trim();
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  // ======= RENDER =======
  return (
    <div className="dashboard-container admin-dashboard">
      {/* ===== HEADER ===== */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>

          <div className="user-info">
            <span>
              Bienvenido{' '}
              <strong>
                {user.nombre} {user.apellidoPaterno || user.ap_paterno || ''}
              </strong>
            </span>

            <div className="profile-menu-container">
              <button
                type="button"
                className="header-avatar-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {setProfileImage ? (
                  <img src={setProfileImage} alt="Avatar" />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </button>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-user-info">
                    <strong>
                      {user.nombre} {user.apellidoPaterno || user.ap_paterno || ''}
                    </strong>
                    <span>{user.email}</span>
                    <span>
                      {user.rol} · {user.area || 'Sin área'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setActiveView('perfil');
                      setMenuOpen(false);
                    }}
                  >
                    Perfil del usuario
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== CONTENIDO ===== */}
      <div className="dashboard-content">
        {/* ===== DASHBOARD ===== */}
        {activeView === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios Totales</h3>
                <p className="stat-number">—</p>
                <div className="stat-trend up">En tiempo real</div>
              </div>

              <button className="action-card admin-action">
                <div className="action-icon">📹</div>
                <h3>OCR</h3>
                <p>Lectura de matrículas</p>
              </button>

              <button className="action-card admin-action">
                <div className="action-icon">📑</div>
                <h3>Reportes</h3>
                <p>Historiales y búsquedas</p>
              </button>
            </div>
          </>
        )}

        {/* ===== PERFIL ===== */}
        {activeView === 'perfil' && (
          <div className="perfil-instagram">
            <div className="perfil-header">
              <h2>Perfil del usuario</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
              >
                ← Volver
              </button>
            </div>

            <div className="perfil-detail-card">
              <h3>Información de la cuenta</h3>
              <div className="perfil-detail-grid">
                <p><strong>Nombre:</strong> {user.nombre}</p>
                <p><strong>Apellido:</strong> {user.apellidoPaterno}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rol:</strong> {user.rol}</p>
                <p><strong>Área:</strong> {user.area}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default User_Admin;
