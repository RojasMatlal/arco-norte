import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import logoC5I from "./recurs/c5i.jpg";
import eyeOn from "./recurs/icons-visible.png";
import eyeOff from "./recurs/icons-ciego.png";

import './user_admin.css';

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

function User_Admin() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

  // ESTADOS 

  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [ocrImage, setOcrImage] = useState(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState('');
  const profileMenuRef = useRef(null);
  
  
  const [profileImage, setProfileImage] = useState(
    user?.imagen || user?.imagen_usuario || null
  );

// ===================== PERMISOS / USUARIOS (ESTADOS) =====================
const [permisosTab, setPermisosTab] = useState('registro');
const [editingUserId, setEditingUserId] = useState(null);
const [showPassword, setShowPassword] = useState(false);


const [formUsuario, setFormUsuario] = useState({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  sexo: '0',
  area: '',
  id_rol: '',
  email: '',
  password: '',
  imagenFile: null,
});

const [loadingUsuarios, setLoadingUsuarios] = useState(false);
const [listaUsuariosTabla, setListaUsuariosTabla] = useState([]);

// ===================== PERFIL (PLACEHOLDER) =====================
const [loadingPerfil, setLoadingPerfil] = useState(false);

const renderSexo = (sexo) => {
  if (sexo === 1 || sexo === '1') return 'Femenino';
  if (sexo === 2 || sexo === '2') return 'Masculino';
  return 'No especificado';
};

// ===================== FORM HANDLERS =====================
const handleFormChange = (e) => {
  const { name, value } = e.target;
  setFormUsuario((prev) => ({ ...prev, [name]: value }));
};

const sexoLabel = (s) => (Number(s) === 1 ? "Masculino" : Number(s) === 2 ? "Femenino" : "No especificado");

const handleAvatarFile = (e) => {
  const file = e.target.files?.[0] || null;
  setFormUsuario((prev) => ({ ...prev, imagenFile: file }));
};

const limpiarFormulario = () => {
  setEditingUserId(null);
  setFormUsuario({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    sexo: '0',
    area: '',
    id_rol: '',
    email: '',
    password: '',
    imagenFile: null,
  });
};

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



// ===================== CARGAR USUARIOS (para pestaña Gestión) =====================

// Carga de gestion/carga tabla en permisos 
useEffect(() => {
  if (activeView !== "permisos" || permisosTab !== "gestion") {
    refreshUsuarios();
  }

}, [activeView, permisosTab]);

useEffect(() => {
  if (activeView === "perfil") {
    fetchPerfil();
  }
}, [activeView]);



const refreshCount = async () => {
  try {
    const res = await fetch(`${API}/users/count`);
    const data = await res.json();
    if (res.ok && data?.success) {
      setTotalUsuarios(Number(data.total || 0));
    }
  } catch (e) {
    // no rompas UI
  }
};

const refreshUsuarios = async () => {
  setLoadingUsuarios(true);
  try {
    const [resList, resCount] = await Promise.all([
      fetch(`${API}/users`),
      fetch(`${API}/users/count`),
    ]);

    const list = await resList.json();
    const count = await resCount.json();

    if (resList.ok && list?.success && Array.isArray(list.data)) {
      setListaUsuariosTabla(list.data);
    } else {
      setListaUsuariosTabla([]);
    }

    if (resCount.ok && count?.success) {
      setTotalUsuarios(Number(count.total || 0));
    }
  } catch (e) {
    console.error(e);
    setListaUsuariosTabla([]);
    setTotalUsuarios(0);
  } finally {
    setLoadingUsuarios(false);
  }
};

// ===================== CRUD =====================

const handleRegistrarOActualizar = async (e) => {
 e.preventDefault();

  const required = [
    ["nombre", formUsuario.nombre],
    ["apellidoPaterno", formUsuario.apellidoPaterno],
    ["apellidoMaterno", formUsuario.apellidoMaterno],
    ["area", formUsuario.area],
    ["id_rol", formUsuario.id_rol],
    ["email", formUsuario.email],
    ...(editingUserId ? [] : [["pasword",formUsuario.password]]),
  ];

  const missing = required.find(([, v]) => !String(v || "").trim());
  if (missing) {
    alert(`Falta el campo obligatorio: ${missing[0]}`);
    return;
  }

  const payload = {
    nombre: formUsuario.nombre.trim(),
    apellidoPaterno: formUsuario.apellidoPaterno.trim(),
    apellidoMaterno: (formUsuario.apellidoMaterno || "").trim(),
    sexo: Number(formUsuario.sexo || 0),   
    area: formUsuario.area.trim(),
    id_rol: Number(formUsuario.id_rol),    
    email: formUsuario.email.trim(),
    ...(formUsuario.password?.trim() ? { password: String(formUsuario.password) } : {}),
    imagen: null, 
  };

  try {
    const isEdit = Boolean(editingUserId);
const url = isEdit ? `${API}/users/${editingUserId}` : `${API}/users`;
const method = isEdit ? "PUT" : "POST";

const res = await fetch(url, {
  method,

      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { success: false, message: raw };
    }

    if (!res.ok || !data?.success) {
      console.error("POST /api/users ->", res.status, data);
      const msg =
        data?.message ||
        data?.debug ||
        `Error HTTP ${res.status} en /api/users`;
      alert(msg);
      return;
    }

    alert(editingUserId ? "Usuario actualizado correctamente" : "Usuario registrado correctamente");

    limpiarFormulario();
    setPermisosTab("gestion");
    await refreshUsuarios();
  } catch (err) {
    console.error("Error fetch POST /api/users:", err);
    alert(`No se pudo registrar (conexión/back): ${err?.message || err}`);
  }
};




const handleEditarUsuario = (u) => {
  setPermisosTab('registro');
  setEditingUserId(u.id_usuario);

  setFormUsuario((prev) => ({
    ...prev,
    nombre: u.nombre_usuario || '',
    apellidoPaterno: u.ap_usuario || '',
    apellidoMaterno: u.am_usuario || '',
    sexo: String(u.sexo_usuario ?? '0'),
    area: u.area_usuario || '',
    id_rol: String(u.id_rol ?? ''),
    email: u.email_usuario || '',
    password: '',
    imagenFile: null,
  }));
};

const handleCambiarEstatus = async (u, nuevoEstatus) => {
  try {
    const res = await fetch(`${API}/users/${u.id_usuario}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nuevoEstatus }),
    });
    const data = await res.json();

    if (!res.ok || !data?.success) {
      alert(data?.message || 'No se pudo cambiar el estatus');
      return;
    }

    await refreshUsuarios();
  } catch (e) {
    console.error(e);
    alert('Error al cambiar estatus');
  }
};


const handleEliminarUsuario = async (u) => {
  if (!window.confirm(`¿Eliminar al usuario ${u.nombre_usuario} ${u.ap_usuario}?`)) return;

  try {
    const res = await fetch(`${API}/users/${u.id_usuario}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (!res.ok || !data?.success) {
      alert(data?.message || 'No se pudo eliminar');
      return;
    }

    await refreshUsuarios();
  } catch (e) {
    console.error(e);
    alert('Error al eliminar usuario');
  }
};


// ===================== FOTO PERFIL (PLACEHOLDER) =====================
const handleChangePhoto = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const form = new FormData();
    form.append('avatar', file);

    const res = await fetch(`${API}/users/${user.id_usuario}/avatar`, {
      method: 'PUT',
      body: form,
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      alert(data?.message || 'No se pudo subir la foto');
      return;
    }

    // muestra la foto nueva (URL completa)
    setProfileImage(`${API}${data.path}`);
  } catch (err) {
    console.error(err);
    alert('Error al subir foto');
  } finally {
    e.target.value = '';
  }
};

  
  //contador en tiempo real
useEffect(() => {
  let alive = true;

  const tick = async () => {
    if (!alive) return;
    await refreshCount();
  };

  tick();
  const interval = setInterval(tick, 3000);

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

  const fakeLoad = (cb) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      cb && cb();
    }, 1200);
  };

  // RENDER 
  return (
    <div className="dashboard-container admin-dashboard">
      {/* ===== HEADER ===== */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title-group">
            <img src={logoC5I} alt="C5I" className="header-logo"/>
          <h1>Panel de Administración</h1>
          </div>

          <div className="user-info">
            <span>
              Bienvenido{' '} 
                <strong>
                {user.nombre} {user.apellidoPaterno || user.ap_paterno || ''}
              </strong>
            </span>

            <div className="profile-menu-container" ref={profileMenuRef}>
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
                    <strong>{user.nombre}</strong>
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
        {activeView === 'dashboard' && (
          
          <>
             <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios Totales</h3>
               <p className="stat-number">{Number.isFinite(totalUsuarios) ? totalUsuarios : '—'}</p>
                <div className="stat-trend up">En tiempo real</div>
              </div>

              <button className="action-card admin-action" onClick={() => setActiveView('historialAdmin')} >
                <div className="action-icon">📑</div>
                <h3>Historiales</h3>
                <p>Reportes detallados de busquedas</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('fechaAdmin')}>
                <div className="action-icon">🗓️</div>
                <h3>Fecha y Hora</h3>
                <p>Fecha/Hora</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('lugarAdmin')}>
                <div className="action-icon">📍</div>
                <h3>Lugar</h3>
                <p>ID Lugar</p>
              </button>
            </div>

            <div className="actions-grid">
              <button className="action-card admin-action" onClick={() => setActiveView('ocrAdmin')}>
                <div className="action-icon">📷</div>
                <h3>OCR</h3>
                <p>OCR</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('matriculasAdmin')}>
                <div className="action-icon">🪪</div>
                <h3>Matrículas</h3>
                <p>Matrículas</p>
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

        {/* ===================== HISTORIAL ===================== */}
        {activeView === 'historialAdmin' && (
          <div className="permisos-view">
            <h2>Historiales</h2>
             <p>Cargando…</p>
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== FECHA ===================== */}
        {activeView === 'fechaAdmin' && (
          <div className="permisos-view">
            <h2>Fecha y Hora</h2>
            <input type="datetime-local" />
            <button className="btn-primary" onClick={() => fakeLoad()}>Buscar</button>
            {loading && <p>Cargando…</p>}
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* ===================== LUGAR ===================== */}
        {activeView === 'lugarAdmin' && (
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
        {activeView === 'ocrAdmin' && (
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
        {activeView === 'matriculasAdmin' && (
          <div className="permisos-view">
            <h2>Matrículas</h2>
            <input type="text" placeholder="AAA-0000" />
            <button className="btn-primary" onClick={() => fakeLoad()}>Buscar</button>
            {loading && <p>Consultando servidor…</p>}
         
            <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>← Volver</button>
          </div>
        )}

        {/* -------- PERMISOS / USUARIOS -------- */}
        {activeView === 'permisos' && (
          <div className="permisos-card">
            <div className="permisos-header">
              <h2>Gestión de usuarios y permisos</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
              >
                ← Volver al panel
              </button>
            </div>

            <div className="permisos-tabs">
              <button
                className={`permisos-tab ${
                  permisosTab === 'registro' ? 'active' : ''
                }`}
                onClick={() => setPermisosTab('registro')}
              >
                Registro
              </button>
              <button
                className={`permisos-tab ${
                  permisosTab === 'gestion' ? 'active' : ''
                }`}
                onClick={() => setPermisosTab('gestion')}
              >
                Gestión de usuarios
              </button>
            </div>

            {permisosTab === 'registro' && (
              <form
                className="registro-usuario-form"
                onSubmit={handleRegistrarOActualizar}
              >
                <h3>
                  {editingUserId ? 'Editar usuario' : 'Registrar nuevo usuario'}
                </h3>

                <div className="form-grid-2">
                  <div className="form-row">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formUsuario.nombre}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Apellido paterno *</label>
                    <input
                      type="text"
                      name="apellidoPaterno"
                      value={formUsuario.apellidoPaterno}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Apellido materno</label>
                    <input
                      type="text"
                      name="apellidoMaterno"
                      value={formUsuario.apellidoMaterno}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-row">
                    <label>Sexo</label>
                    <select
                      name="sexo"
                      value={formUsuario.sexo}
                      onChange={handleFormChange}
                    >
                      <option value="0">No especificado</option>
                      <option value="1">Femenino</option>
                      <option value="2">Masculino</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <label>Área *</label>
                    <input
                      type="text"
                      name="area"
                      value={formUsuario.area}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Rol *</label>
                    <select
                      name="id_rol"
                      value={formUsuario.id_rol}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <option value="745">Administrador</option>
                      <option value="125">Operador</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <label>Usuario (correo) *</label>
                    <input
                      type="email"
                      name="email"
                      value={formUsuario.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>
                      Contraseña{editingUserId
                        ? '(dejar en blanco para no cambiar)'
                        : '*'}
                    </label>

                     <div className="password-container">
                       <input
                       className="form-input password-input"
                       type={showPassword ? "text" : "password"}
                       name="password"
                       value={formUsuario.password}
                       onChange={handleFormChange}
                       placeholder="Contraseña"
                        />
                          <img src={showPassword ? eyeOff :eyeOn} 
                          className="password-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          alt="toggle" 
                          />
                     </div>
                  </div>

                  {/* FOTO OPCIONAL */}
                  <div className="form-row form-row-full">
                    <label>Foto</label>
                    <label className="btn-primary perfil-change-photo">
                      Seleccionar foto
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFile}
                      />
                    </label>
                    {formUsuario.imagenFile && (
                      <p style={{ marginTop: 8, fontSize: '0.9rem' }}>
                        📁 Archivo seleccionado:{' '}
                        <strong>{formUsuario.imagenFile.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="permisos-actions">
                  <button type="submit" className="btn-primary">
                    {editingUserId ? 'Guardar cambios' : 'Registrar usuario'}
                  </button>
                  {editingUserId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={limpiarFormulario}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            )}

            {permisosTab === 'gestion' && (
              <div className="usuarios-table-wrapper">
                <h3>Usuarios registrados</h3>
                {loadingUsuarios && <p style={{ margin: "8px 0", opacity: 0.75 }}>Actualizando…</p>}
                  <table className="usuarios-tabla">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Sexo</th>
                        <th>Usuario</th>
                        <th>Área</th>
                        <th>Rol</th>
                        <th>Estatus</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaUsuariosTabla.map((u) => (
                        <tr key={u.id_usuario}>
                          <td>{u.id_usuario}</td>
                          <td className="col-nombre">
                            {u.nombre_usuario} {u.ap_usuario} {u.am_usuario}
                          </td>
                          <td> {u.sexo_usuario === 1 ? "Masculino" : u.sexo_usuario === 2 ? "Femenino" : "No especificado"}</td>
                          <td>{u.email_usuario}</td>
                          <td>{u.area_usuario}</td>
                          <td>{u.nombre_rol}</td>
                          <td >
                            {u.estatus_usuario === 1
                              ? 'Habilitado'
                              : 'Deshabilitado'}
                          </td>

                          <td className="actions-cell">
                            <div className="actions-wrap">
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => handleEditarUsuario(u)}
                              >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="btn-small"
                              onClick={() =>
                                handleCambiarEstatus(
                                  u,
                                  u.estatus_usuario === 1 ? -1 : 1
                                )
                              }
                            >
                              {u.estatus_usuario === 1
                                ? 'Deshabilitar'
                                : 'Habilitar'}
                            </button>

                            <button
                              type="button"
                              className="btn-small danger"
                              onClick={() => handleEliminarUsuario(u)}
                            >
                              Eliminar
                            </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {listaUsuariosTabla.length === 0 && (
                        <tr>
                          <td colSpan="7">No hay usuarios registrados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
            )}
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
                          <img src={profileImage} alt="Avatar" />
                        ) : (
                          <span>
                            {(user.nombre?.[0] || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="perfil-main-info">
                        <div className="perfil-username-row">
                          <h2 className="perfil-username">{username}</h2>
                        </div>

                        <span className="perfil-fullname">
                          {u.nombre_usuario} {u.ap_usuario} {u.am_usuario}
                        </span>

                        <div className="perfil-buttons-row">
                          <label className="btn-primary perfil-change-photo">
                            Cambiar foto
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleChangePhoto}
                            />
                          </label>
                        </div>
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
                          <strong>Sexo:</strong> {sexoLabel(u?.sexo_usuario)}
                        </p>
                        <p>
                          <strong>Usuario :</strong> {u.email_usuario}
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

        {/* -------- Historial -------- */}
        {activeView === 'historial' && (
          <div className="historial-view">
            <div className="perfil-header">
              <h2>Historial</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
              >
                ← Volver al panel
              </button>
            </div>
            <p>Vista de historial en construcción…</p>
          </div>
        )}
     </div>
    </div>
  );
}

export default User_Admin;
