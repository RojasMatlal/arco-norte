// backend/apis/Users.js
const express = require('express');
const crypto = require('crypto');
const db = require('../config/database');
const router = express.Router();

const multer = require('multer');
const path = require('path');

// GET: lista de usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.ap_usuario,
        u.am_usuario,
        u.sexo_usuario,
        u.email_usuario,
        u.imagen_usuario,
        u.id_rol,
        u.area_usuario,
        u.estatus_usuario,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario DESC
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error GET /users:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      debug: err?.sqlMessage || err?.message || String(err),
    });
  }
});

// POST: registra los usuarios 
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      sexo,
      area,
      id_rol,
      email,
      password,
      imagen,
    } = req.body;

    // Validación de obligatorios
    if (!nombre || !apellidoPaterno || !area || !id_rol || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      });
    }

    //Normalización / validación numérica
    const sexoNum = Number(sexo || 0);
    const rolNum = Number(id_rol);

    if (!Number.isFinite(rolNum)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
      });
    }

    // Validación de correo duplicado
    const [exists] = await db.query(
      'SELECT 1 FROM usuarios WHERE email_usuario = ? LIMIT 1',
      [String(email).trim()]
    );

    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El correo ya está registrado',
      });
    }

    // Hash password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(String(password))
      .digest('hex');

    // Insert
    const [result] = await db.query(
      `
      INSERT INTO usuarios
      (nombre_usuario, ap_usuario, am_usuario, sexo_usuario, area_usuario, id_rol, email_usuario, password_usuario, imagen_usuario, estatus_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        String(nombre).trim(),
        String(apellidoPaterno).trim(),
        String(apellidoMaterno || '').trim(),
        Number.isFinite(sexoNum) ? sexoNum : 0,
        String(area).trim(),
        rolNum,
        String(email).trim(),
        hashedPassword,
        imagen || null,
      ]
    );

    // Regresa el id insertado
    return res.json({
      success: true,
      message: 'Usuario registrado',
      id_usuario: result.insertId,
    });
  } catch (err) {
    console.error('Error POST /users:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      debug: err?.sqlMessage || err?.message || String(err),
    });
  }
});

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      sexo,
      area,
      id_rol,
      email,
      password, 
    } = req.body;

    if (!nombre || !apellidoPaterno || !area || !id_rol || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      });
    }

    const [dup] = await db.query(
      'SELECT 1 FROM usuarios WHERE email_usuario = ? AND id_usuario <> ? LIMIT 1',
      [String(email).trim(), id]
    );
    if (dup.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El correo ya está registrado por otro usuario',
      });
    }

    const fields = [];
    const values = [];

    fields.push('nombre_usuario = ?'); values.push(String(nombre).trim());
    fields.push('ap_usuario = ?'); values.push(String(apellidoPaterno).trim());
    fields.push('am_usuario = ?'); values.push(String(apellidoMaterno || '').trim());
    fields.push('sexo_usuario = ?'); values.push(Number(sexo || 0));
    fields.push('area_usuario = ?'); values.push(String(area).trim());
    fields.push('id_rol = ?'); values.push(Number(id_rol));
    fields.push('email_usuario = ?'); values.push(String(email).trim());

    if (password && String(password).trim().length > 0) {
      const hashedPassword = crypto
        .createHash('sha256')
        .update(String(password))
        .digest('hex');
      fields.push('password_usuario = ?');
      values.push(hashedPassword);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) {
    console.error('Error PUT /users/:id:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      debug: err?.sqlMessage || err?.message || String(err),
    });
  }
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// PUT para cambios de foto/avatar
router.put('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !req.file) {
      return res.status(400).json({ success: false, message: 'Archivo/ID inválido' });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      'UPDATE usuarios SET imagen_usuario = ? WHERE id_usuario = ?',
      [relativePath, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, message: 'Avatar actualizado', path: relativePath });
  } catch (err) {
    console.error('Error PUT /users/:id/avatar:', err);
    return res.status(500).json({ success: false, message: 'Error al subir avatar' });
  }
});

//contador en tiempo real
router.get('/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    return res.json({ success: true, total: Number(rows[0]?.total || 0) });
  } catch (err) {
    console.error('Error GET /users/count:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al contar usuarios',
      debug: err?.sqlMessage || err?.message || String(err),
    });
  }
});

// PUT status
router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // 1 o -1

    if (!Number.isFinite(id) || (status !== 1 && status !== -1)) {
      return res.status(400).json({ success: false, message: 'Datos inválidos' });
    }

    const [result] = await db.query(
      'UPDATE usuarios SET estatus_usuario = ? WHERE id_usuario = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, message: 'Estatus actualizado' });
  } catch (err) {
    console.error('Error PUT /users/:id/status:', err);
    return res.status(500).json({ success: false, message: 'Error al cambiar estatus' });
  }
});

// Delete Users
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error DELETE /users/:id:', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

// GET para traer el perfil por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.ap_usuario,
        u.am_usuario,
        u.sexo_usuario,
        u.email_usuario,
        u.imagen_usuario,
        u.id_rol,
        u.area_usuario,
        u.estatus_usuario,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error GET /users/:id:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      debug: err?.sqlMessage || err?.message || String(err),
    });
  }
});




module.exports = router;
