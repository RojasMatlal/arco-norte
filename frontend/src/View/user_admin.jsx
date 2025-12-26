import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './user_admin.css';

function User_Admin() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  // ESTADOS 
  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  
  const [profileImage, setProfileImage] = useState(
    user?.imagen || user?.imagen_usuario || null
  );
  
  //contador en tiempo real
useEffect(() => {
  let alive = true;

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const urls = [
    `${API_BASE}/apis/users/count`,
    `${API_BASE}/api/users/count`,
  ];

  const fetchCount = async () => {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        if (alive && data?.success) {
          setTotalUsuarios(Number(data.total || 0));
          return;
        }
      } catch (e) {}
    }
  };

  fetchCount();
  const interval = setInterval(fetchCount, 3000);

  return () => {
    alive = false;
    clearInterval(interval);
  };
}, []);

  // AUTH + ROLE GUARD
  useEffect(() => {
    const u = AuthService.getUser();
    if (!u) navigate('/login', { replace: true });

    const idRol = Number(u.id_rol);
    const rolNombre = String(u.rol || '').toLowerCase();
    const isAdmin = idRol === 745 || rolNombre === 'administrador';

    if (!isAdmin) navigate('/user_oper', { replace: true });
  }, [navigate]);



   // recargar imagen si cambia el user guardado
  useEffect(() => {
    const u =AuthService.getUser();
  setProfileImage(u?.imagen || u?.imagen_usuario || null);
}, []);

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
    const fullName = `${user?.nombre || ''} ${user?.apellidoPaterno || user?.ap_paterno ||''}`.trim();
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  // RENDER 
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
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" />
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

      <div className="dashboard-content">
        {activeView === 'dashboard' && (
          <>
             <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios Totales</h3>
                <p className="stat-number">{totalUsuarios || ' _ '}</p>
                <div className="stat-trend up">En tiempo real</div>
              </div>
              <button className="action-card admin-action">
                <div className="action-icon">🗓️</div>
                <h3>Transito</h3>
                <p>Fecha/Hora - ID Lugar</p>
              </button>
              <button className="action-card admin-action">
                <div className="action-icon">📹</div>
                <h3>OCR</h3>
                <p>OCR y Matriculas</p>
              </button>
            </div>

            <div className="actions-grid">
              <button className="action-card admin-action">
                <div className="action-icon">📑</div>
                <h3>Historiales</h3>
                <p>Reportes detallados de busquedas</p>
              </button>

              <button
                className="action-card admin-action"
                onClick={() => setActiveView('permisos')}
              >
                <div className="action-icon">🔐</div>
                <h3>Permisos</h3>
                <p>Gestionar roles, acceso y registros</p>
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
                <p><strong>Apellido Paterno:</strong> {user.apellidoPaterno}</p>
                <p><strong>Apellido Materno:</strong> {user.apellidoMaterno}</p>
                <p><strong>Sexo:</strong> {user.sexo}</p>
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
