import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './user_oper.css';

function User_Oper() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [activeView, setActiveView] = useState('dashboard'); // dashboard | perfil | historial
  const [profileImage, setProfileImage] = useState(
  user?.imagen || user?.imagen_usuario || null
);

  const [menuOpen, setMenuOpen] = useState(false);

  // (Opcional) perfil detallado si luego conectas endpoint real
  const [perfilDB, setPerfilDB] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  // ================= AUTH + ROLE GUARD =================
  useEffect(() => {
    const u = AuthService.getUser();

    if (!u) {
      navigate('/login', { replace: true });
      return;
    }

    const idRol = Number(u.id_rol);
    const rolNombre = String(u.rol || '').toLowerCase();

    const isOper = idRol === 125 || rolNombre === 'operador';

    if (!isOper) {
      navigate('/user_admin', { replace: true });
    }
  }, [navigate]);

  // recargar imagen si cambia el user guardado
 useEffect(() => {
  setProfileImage(user?.imagen || user?.imagen_usuario || null);
}, [user]);


  // ======= PERFIL DESDE BD (placeholder listo) =======
  useEffect(() => {
    const loadPerfil = async () => {
      if (activeView !== 'perfil') return;

      // Si luego agregas endpoint real, aquí lo conectas:
      // if (!user?.id_usuario) return;
      // setLoadingPerfil(true);
      // const data = await UsuariosService.getById(user.id_usuario);
      // setPerfilDB(data);
      // setLoadingPerfil(false);

      // Por ahora no hacemos nada para no romper
      setPerfilDB(null);
      setLoadingPerfil(false);
    };

    loadPerfil();
  }, [activeView]);

  // ===================== UI SAFE =====================
  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  const getInitials = () => {
    const fullName = `${user?.nombre || ''} ${user?.apellidoPaterno || ''}`.trim();
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'U';
  };

  const handlePerfil = () => {
    setMenuOpen(false);
    setActiveView('perfil');
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  const renderSexo = (sexo) => {
    if (sexo === 1 || sexo === '1') return 'Femenino';
    if (sexo === 2 || sexo === '2') return 'Masculino';
    return 'No especificado';
  };

  // ======================= RENDER =======================
  return (
    <div className="dashboard-container operador-dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Operador</h1>

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
                  <img src={profileImage} alt="Foto de perfil" />
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
                    onClick={handlePerfil}
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

      {/* CONTENIDO */}
      <div className="dashboard-content">
        {/* -------- DASHBOARD -------- */}
        {activeView === 'dashboard' && (
          <div className="actions-grid">
            <button
              className="action-card oper-action"
              onClick={() => setActiveView('historial')}
              type="button"
            >
              <div className="action-icon">📑</div>
              <h3>Mi Historial</h3>
              <p>Historial de búsquedas</p>
            </button>

            <button className="action-card operador-action" type="button">
              <div className="action-icon">🗓️</div>
              <h3>Tránsito</h3>
              <p>Fecha/Hora - ID Lugar</p>
            </button>

            <button className="action-card admin-action" type="button">
              <div className="action-icon">📹</div>
              <h3>OCR</h3>
              <p>OCR y Matrículas</p>
            </button>
          </div>
        )}

        {/* -------- PERFIL -------- */}
        {activeView === 'perfil' && (
          <div className="perfil-instagram">
            <div className="perfil-header">
              <h2>Perfil del usuario</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
                type="button"
              >
                ← Volver
              </button>
            </div>

            {loadingPerfil ? (
              <p>Cargando datos del usuario...</p>
            ) : (
              (() => {
                // Si luego conectas BD, usa perfilDB; si no, usa user
                const u = perfilDB || {};
                const emailBase = (user.email || '').split('@')[0] || 'usuario';
                const username =
                  u.usuario ||
                  (u.email_usuario ? u.email_usuario.split('@')[0] : emailBase);

                return (
                  <>
                    <div className="perfil-hero">
                      <div className="perfil-photo-large">
                        {profileImage ? (
                          <img src={profileImage} alt="Avatar" />
                        ) : (
                          <span>{(user.nombre?.[0] || 'U').toUpperCase()}</span>
                        )}
                      </div>

                      <div className="perfil-main-info">
                        <div className="perfil-username-row">
                          <h2 className="perfil-username">{username}</h2>
                        </div>

                        <span className="perfil-fullname">
                          {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno} {user.ap_paterno}
                        </span>

                        <div className="perfil-extra-line">
                          <strong>{user.rol}</strong> · {user.area || 'Sin área'} 
                        </div>

                        {/* Si luego conectas avatar, aquí quedará listo */}
                        <div className="perfil-buttons-row">
                          <button
                            type="button"
                            className="btn-primary perfil-change-photo"
                            onClick={() => alert('Conecta AvatarService para cambiar foto')}
                          >
                            Cambiar foto
                          </button>
                        </div>
                      </div>
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

                        {/* Si después conectas BD, estas líneas se pueden sustituir por u.* */}
                        {'sexo_usuario' in u && (
                          <p><strong>Sexo:</strong> {renderSexo(u.sexo_usuario)}</p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        )}

        {/* -------- HISTORIAL -------- */}
        {activeView === 'historial' && (
          <div className="historial-view">
            <div className="perfil-header">
              <h2>Mi historial</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
                type="button"
              >
                ← Volver al panel
              </button>
            </div>
            <p>Vista de historial del operador en construcción…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default User_Oper;
