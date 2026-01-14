import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import logoC5I from "./recurs/c5i.jpg";
import './user_oper.css';

/* ===================== DUMP LUGARES TLAXCALA ===================== */
const LUGARES_TLAXCALA = [
  {
    id: 'CALPULALPAN',
    nombre: 'Calpulalpan',
    ip: '192.168.12.100',
    motor: 'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64)',
  },
  {
    id: 'SANCTORUM',
    nombre: 'Sanctórum',
    ip: '192.168.13.100',
    motor: 'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64)',
  },
  {
    id: 'SAN_MARTIN_TEXMELUCAN',
    nombre: 'San Martín Texmelucan',
    ip: '192.168.14.100',
    motor: 'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64)',
  },
];

function User_Oper() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

// ================== Perfil img ===========================
  const fileInputRef = useRef(null);
    const userLocal =JSON.parse(localStorage.getItem("user") || "{}");
    const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    const API = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;
const resolveImg = (p) => {
    if (!p) return null;
    if (p.startsWith("http")) return p;
    return `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`;
  };



  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState('');
  const profileMenuRef = useRef(null);

  // ===================== PERFIL (PLACEHOLDER) =====================
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
    const [profileImage, setProfileImage] = useState(
      resolveImg(user?.imagen || user?.imagen_usuario || null)
    );
  
  const renderSexo = (sexo) => {
    if (sexo === 1 || sexo === '1') return 'Femenino';
    if (sexo === 2 || sexo === '2') return 'Masculino';
    return 'No especificado';
  };

// ================== Perfil Img =================

const handlePickPhoto = () => {
  fileInputRef.current?.click();
};

const handleChangePhoto = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const id = u?.id_usuario;

    if (!id) {
      alert("No se encontró el id del usuario.");
      return;
    }

    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch(`${API}/users/${id}/avatar`, {
      method: "PUT",
      body: form,
    });

    const data = await res.json();

    if (!res.ok || !data?.success) {
      alert(data?.message || "No se pudo subir la foto");
      return;
    }

    const newPath = data.path;
    const newUrl = resolveImg(newPath);

    setProfileImage(newUrl);

    const updated = { ...u, imagen_usuario: newPath };
    localStorage.setItem("user", JSON.stringify(updated));

  } catch (err) {
    console.error(err);
    alert("Error al subir foto");
  } finally {
    e.target.value = "";
  }
};

  /* ===================== AUTH ===================== */
  
  useEffect(() => {
  if (activeView === "perfil") {
    fetchPerfil();
  }
}, [activeView]);

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [navigate, user]);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  };

  if (menuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuOpen]);


  const getInitials = () => {
    const n = `${user?.nombre || ''} ${user?.apellidoPaterno || ''}`.trim();
    return n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() || 'U';
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  /* ===================== SIMULACIÓN CARGA ===================== */
  const fakeLoad = (cb) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      cb && cb();
    }, 1200);
  };

  /*======== Perfil ==========*/

  const fetchPerfil = async () => {
  try {
    setLoadingPerfil(true);

    const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
    const id = userLocal?.id_usuario;

    if (!id) {
      setLoadingPerfil(false);
      return;
    }

    const res = await fetch(`${API}/users/${id}`);
    const json = await res.json();

    if (res.ok && json?.success) {
      setPerfilUsuario(json.data);  
    } else {
      console.warn("Perfil error:", json);
    }
  } catch (e) {
    console.error("Error fetchPerfil:", e);
  } finally {
    setLoadingPerfil(false);
  }
};


  return (
    <div className="dashboard-container admin-dashboard">

      {/* ===== HEADER ===== */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title-group">
                      <img src={logoC5I} alt="C5I" className="header-logo"/>
                    <h1>Panel de Operaciones</h1>
                    </div>
          <div className="user-info">
            <span>
              Bienvenido <strong>{user?.nombre} {user.apellidoPaterno || user.ap_paterno || ''}</strong>
            </span>

            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
              type="buton"
                className="header-avatar-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="header-avatar-img" />
                ) : (
                  <span className="header-avatar">{getInitials()}</span>
                )}
              </button>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-user-info">
                    <strong>{user?.nombre}</strong>
                    <span>{user?.email}</span>
                  </div>

                  <button
                    className="btn-secondary"
                    onClick={() => setActiveView('perfil')}
                    onDoubleClick={() => setActiveView('dashboard')}
                  >
                    Perfil del Usuario
                  </button>

                  <p>
                  <button
                    className="btn-secondary"
                    onClick={handleLogout}
                    >
                    Cerrar sesión
                  </button>
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">

        {/* ===================== DASHBOARD ===================== */}
        {activeView === 'dashboard' && (
          <>
            <div className="stats-grid">
              <button className="action-card admin-action" onClick={() => setActiveView('historial')}>
                <div className="action-icon">📄</div>
                <h3>Mi Historial</h3>
                <p>Historial de búsquedas</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('fecha')}>
                <div className="action-icon">🗓️</div>
                <h3>Fecha y Hora</h3>
                <p>Fecha/Hora</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('lugar')}>
                <div className="action-icon">📍</div>
                <h3>Lugar</h3>
                <p>ID Lugar</p>
              </button>
            </div>

            <div className="actions-grid">
              <button className="action-card admin-action" onClick={() => setActiveView('ocr')}>
                <div className="action-icon">📷</div>
                <h3>OCR</h3>
                <p>OCR</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('matriculas')}>
                <div className="action-icon">🪪</div>
                <h3>Matrículas</h3>
                <p>Matrículas</p>
              </button>
            </div>
          </>
        )}

        {/* ===================== HISTORIAL ===================== */}
        {activeView === 'historial' && (
          <div className="permisos-view">
            <h2>Mi Historial</h2>
             <p>Cargando…</p>
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== FECHA ===================== */}
        {activeView === 'fecha' && (
          <div className="permisos-view">
            <h2>Fecha y Hora</h2>
            <input type="datetime-local" />
            <button className="btn-primary" onClick={() => fakeLoad()}>Buscar</button>
            {loading && <p>Cargando…</p>}
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== LUGAR ===================== */}
        {activeView === 'lugar' && (
          <div className="permisos-view">
            <h2>Lugar</h2>

            <select value={lugarSeleccionado} onChange={e => setLugarSeleccionado(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {LUGARES_TLAXCALA.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>

            {lugarSeleccionado && (
              <div style={{ marginTop: 20 }}>
                {LUGARES_TLAXCALA.filter(l => l.id === lugarSeleccionado).map(l => (
                  <div key={l.id}>
                    <p><strong>IP:</strong> {l.ip}</p>
                    <p><strong>Motor:</strong> {l.motor}</p>
                 
                  </div>
                ))}
              </div>
            )}

            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== OCR ===================== */}
        {activeView === 'ocr' && (
          <div className="permisos-view">
            <h2>OCR</h2>

            <label className="btn-primary">
              Seleccionar imagen
              <input type="file" accept="image/*" hidden onChange={e => setOcrImage(e.target.files[0])} />
            </label>

            {ocrImage && <p>Imagen cargada: {ocrImage.name}</p>}
            {loading && <p>Procesando OCR…</p>}

            <button className="btn-primary" onClick={() => fakeLoad()}>Procesar</button>
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== MATRÍCULAS ===================== */}
        {activeView === 'matriculas' && (
          <div className="permisos-view">
            <h2>Matrículas</h2>
            <input type="text" placeholder="AAA-0000" />
            <button className="btn-primary" onClick={() => fakeLoad()}>Buscar</button>
            {loading && <p>Consultando servidor…</p>}
         
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ============= PERFIL ============= */}
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

            {loadingPerfil ? (
              <p>Cargando datos del usuario...</p>
            ) : (
              (() => {
                const u = perfilUsuario || {};
                const username =
                  u.usuario ||
                  (u.email_usuario
                    ? u.email_usuario.split('@')[0]
                    : user.email.split('@')[0]);

                return (
                  <>
                    <div className="perfil-hero">
                      <div className="perfil-photo-large">
                        {profileImage ? (
                          <img src={profileImage} alt="Avatar" className="profile-avatar-img" />
                        ) : (
                          <span className="profile-avatar-text">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      <div className="profile-actions">
                        
                        <button type="button" className="btn-primary" onClick={handlePickPhoto}>
                          Cambiar foto
                        </button>
                      </div>
                    </div>

                    <div className="perfil-detail-card">
                      <h3>Información de la cuenta</h3>
                      <div className="perfil-detail-grid">
                        <p>
                          <strong>ID usuario:</strong> {u.id_usuario}
                        </p>
                        <p>
                          <strong>Nombre completo:</strong>{' '}
                          {u.nombre_usuario} {u.ap_usuario} {u.am_usuario}
                        </p>
                        <p>
                          <strong>Sexo:</strong> {renderSexo(u.sexo_usuario)}
                        </p>
                        <p>
                          <strong>Usuario (correo):</strong> {u.email_usuario}
                        </p>
                        <p>
                          <strong>Área:</strong> {u.area_usuario}
                        </p>
                        <p>
                          <strong>Rol:</strong> {u.nombre_rol || user.rol}
                        </p>
                        <p>
                          <strong>Estatus:</strong>{' '}
                          {u.estatus_usuario === 1
                            ? 'Habilitado'
                            : 'Deshabilitado'}
                        </p>
                     </div>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default User_Oper;