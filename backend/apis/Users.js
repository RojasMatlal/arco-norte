// backend/apis/Users.js
const express = require('express');
const router = express.Router();

// ✅ bien: desde /backend/apis -> /backend/config/database.js
const db = require('../config/database');

// ✅ GET /users -> listar usuarios (tu tabla real: usuarios)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error GET /users:', err);
    return res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// ✅ POST /users -> crear usuario (opcional, básico)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, id_rol } = req.body;

    if (!nombre || !email || !password || !id_rol) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    await db.query(
      'INSERT INTO usuarios (nombre_usuario, email_usuario, password_usuario, id_rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, id_rol]
    );

    return res.json({ success: true, message: 'Usuario creado' });
  } catch (err) {
    console.error('Error POST /users:', err);
    return res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
});

// ✅ GET /users/count -> contador
router.get('/count', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM usuarios');
    return res.json({ success: true, total: rows[0].total });
  } catch (err) {
    console.error('Error GET /users/count:', err);
    return res.status(500).json({ success: false, message: 'Error al contar usuarios' });
  }
});

module.exports = router;
