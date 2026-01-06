// backend/apis/Users.js
const express = require('express');
const crypto = require('crypto');
const db = require('../config/database');
const router = express.Router();

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

    if (!nombre || !apellidoPaterno || !area || !id_rol || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      });
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(String(password))
      .digest('hex');

    // tabla de usuarios
    await db.query(
      `
      INSERT INTO usuarios
      (nombre_usuario, ap_usuario, am_usuario, sexo_usuario, area_usuario, id_rol, email_usuario, password_usuario, imagen_usuario, estatus_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        nombre,
        apellidoPaterno,
        apellidoMaterno || '',
        Number(sexo || 0),
        area,
        Number(id_rol),
        email,
        hashedPassword,
        imagen || null,
      ]
    );

    return res.json({ success: true, message: 'Usuario registrado' });
  } catch (err) {
    console.error('Error POST /users:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      debug: err?.sqlMessage || err?.message || String(err),
    });
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

module.exports = router;
