import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import './user_admin.css';

function User_Admin() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // ===================== ESTADOS =====================
  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [profileImage, setProfileImage] = useState(
    user?.imagen || user?.imagen_usuario || null
  );

  // ===================== PERMISOS / USUARIOS =====================
  const [permisosTab, setPermisosTab] = useState('registro');
  const [editingUserId, setEditingUserId] = useState(null);

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

  // ===================== PERFIL =====================
  const [perfilDB, setPerfilDB] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  // ===================== UTILIDADES =====================
  const renderSexo = (sexo) => {
    if (sexo === 1 || sexo === '1') return 'Femenino';
    if (sexo === 2 || sexo === '2') return 'Masculino';
    return 'No especificado';
  };

  const getInitials = () => {
    const fullName = `${user?.nombre || ''} ${user?.apellidoPaterno || user?.ap_paterno || ''}`.trim();
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
  };

  // ===================== FORM HANDLERS =====================
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0] || null;
    setFormUsuario(prev => ({ ...prev, imagenFile: file }));
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

  // ===================== USUARIOS =====================
  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(`${API_BASE}/apis/users`);
      const data = await res.json();
      if (res.ok && data?.success) {
        setListaUsuariosTabla(data.data);
      } else {
        setListaUsuariosTabla([]);
      }
    } catch {
      setListaUsuariosTabla([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (activeView === 'permisos' && permisosTab === 'gestion') {
      fetchUsuarios();
    }
  }, [activeView, permisosTab]);

  const handleRegistrarOActualizar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/apis/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUsuario),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.message || 'No se pudo guardar el usuario');
        return;
      }

      alert(editingUserId ? 'Guardado (modo básico)' : 'Usuario registrado');
      limpiarFormulario();
      fetchUsuarios();
    } catch {
      alert('Error al guardar usuario');
    }
  };

  const handleEditarUsuario = (u) => {
    setPermisosTab('registro');
    setEditingUserId(u.id_usuario);

    setFormUsuario({
      nombre: u.nombre_usuario || '',
      apellidoPaterno: u.ap_usuario || '',
      apellidoMaterno: u.am_usuario || '',
      sexo: String(u.sexo_usuario ?? '0'),
      area: u.area_usuario || '',
      id_rol: String(u.id_rol ?? ''),
      email: u.email_usuario || '',
      password: '',
      imagenFile: null,
    });
  };

  const handleCambiarEstatus = (u, estatus) => {
    alert(`Aquí va el endpoint para cambiar estatus de ${u.id_usuario} a ${estatus}`);
  };

  const handleEliminarUsuario = (u) => {
    alert(`Aquí va el endpoint para eliminar usuario ${u.id_usuario}`);
  };

  const handleChangePhoto = () => {
    alert('Aquí conectas la subida/cambio de foto');
  };

  // ===================== CONTADOR =====================
  useEffect(() => {
    let alive = true;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/count`);
        const data = await res.json();
        if (alive) {
          setTotalUsuarios(res.ok && data?.success ? Number(data.total || 0) : 0);
        }
      } catch {
        if (alive) setTotalUsuarios(0);
      }
    };

    fetchCount();
    const i = setInterval(fetchCount, 3000);
    return () => { alive = false; clearInterval(i); };
  }, []);

  // ===================== AUTH =====================
  useEffect(() => {
    const u = AuthService.getUser();
    if (!u) navigate('/login', { replace: true });

    const isAdmin =
      Number(u.id_rol) === 745 ||
      String(u.rol || '').toLowerCase() === 'administrador';

    if (!isAdmin) navigate('/user_oper', { replace: true });
  }, [navigate]);

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // ===================== RENDER =====================
  return (
    <div className="dashboard-container admin-dashboard">

      {/* ===== HEADER ===== */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>

          <div className="user-info">
            <span>
              Bienvenido <strong>{user.nombre} {user.apellidoPaterno || user.ap_paterno || ''}</strong>
            </span>

            <div className="profile-menu-container">
              <button
                type="button"
                className="header-avatar-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {profileImage ? <img src={profileImage} alt="Avatar" /> : <span>{getInitials()}</span>}
              </button>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-user-info">
                    <strong>{user.nombre}</strong>
                    <span>{user.email}</span>
                    <span>{user.rol} · {user.area || 'Sin área'}</span>
                  </div>

                  <button
                    className="profile-dropdown-item"
                    onClick={() => {
                      setActiveView('perfil');
                      setMenuOpen(false);
                    }}
                  >
                    Perfil del usuario
                  </button>

                  <button
                    className="profile-dropdown-item logout"
                    onClick={() => {
                      AuthService.logout();
                      navigate('/login', { replace: true });
                    }}
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

        {/* ===== DASHBOARD ===== */}
        {activeView === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios Totales</h3>
                <p className="stat-number">{totalUsuarios}</p>
                <div className="stat-trend up">En tiempo real</div>
              </div>

              <button className="action-card admin-action" onClick={() => setActiveView('transito')}>
                <div className="action-icon">🗓️</div>
                <h3>Transito</h3>
                <p>Fecha/Hora - ID Lugar</p>
              </button>

              <button className="action-card admin-action" onClick={() => setActiveView('ocr')}>
                <div className="action-icon">📹</div>
                <h3>OCR</h3>
                <p>OCR y Matriculas</p>
              </button>
            </div>

            <div className="actions-grid">
              <button className="action-card admin-action" onClick={() => setActiveView('historial')}>
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

        {/* ===== TRANSITO ===== */}
        {activeView === 'transito' && (
          <div className="permisos-view">
            <div className="permisos-header">
              <h2>Tránsito</h2>
              <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>
                ← Volver al panel
              </button>
            </div>

            <form className="registro-usuario-form">
              <h3>Búsqueda de tránsito</h3>
              <div className="form-grid-2">
                <div className="form-row">
                  <label>Fecha</label>
                  <input type="date" />
                </div>
                <div className="form-row">
                  <label>Hora</label>
                  <input type="time" />
                </div>
                <div className="form-row">
                  <label>ID Lugar</label>
                  <input type="text" />
                </div>
              </div>
              <div className="permisos-actions">
                <button type="button" className="btn-primary">Buscar</button>
              </div>
            </form>
          </div>
        )}

        {/* ===== OCR ===== */}
        {activeView === 'ocr' && (
          <div className="permisos-view">
            <div className="permisos-header">
              <h2>OCR</h2>
              <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>
                ← Volver al panel
              </button>
            </div>

            <div className="registro-usuario-form">
              <h3>Procesar imagen</h3>
              <label className="btn-primary perfil-change-photo">
                Seleccionar imagen
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        {/* ===== HISTORIAL ===== */}
        {activeView === 'historial' && (
          <div className="historial-view">
            <div className="perfil-header">
              <h2>Historial</h2>
              <button className="btn-secondary" onClick={() => setActiveView('dashboard')}>
                ← Volver al panel
              </button>
            </div>
            <p>Vista de historial en construcción…</p>
          </div>
        )}

        {/* -------- PERMISOS / USUARIOS -------- */}
        {activeView === 'permisos' && (
          <div className="permisos-view">
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
                      Contraseña{' '}
                      {editingUserId
                        ? '(dejar en blanco para no cambiar)'
                        : '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formUsuario.password}
                      onChange={handleFormChange}
                    />
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
              <div className="usuarios-tabla-wrapper">
                <h3>Usuarios registrados</h3>
                {loadingUsuarios ? (
                  <p>Cargando usuarios...</p>
                ) : (
                  <table className="usuarios-tabla">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
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
                          <td>
                            {u.nombre_usuario} {u.ap_usuario}
                          </td>
                          <td>{u.email_usuario}</td>
                          <td>{u.area_usuario}</td>
                          <td>{u.nombre_rol}</td>
                          <td>
                            {u.estatus_usuario === 1
                              ? 'Habilitado'
                              : 'Deshabilitado'}
                          </td>
                          <td>
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
                )}
              </div>
            )}
          </div>
        )}

        {/* -------- PERFIL (DATOS DESDE BD) -------- */}
        {activeView === 'perfil' && (
          <div className="perfil-instagram">
            <div className="perfil-header">
              <h2>Perfil del usuario</h2>
              <button
                className="btn-secondary"
                onClick={() => setActiveView('dashboard')}
              >
                ← Volver al panel
              </button>
            </div>

            {loadingPerfil ? (
              <p>Cargando datos del usuario...</p>
            ) : (
              (() => {
                const u = perfilDB || {};
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
                        <p>
                          <strong>Avatar BD:</strong>{' '}
                          {u.imagen_usuario || 'Sin avatar registrado'}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </div>
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




