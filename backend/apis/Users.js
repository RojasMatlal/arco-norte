// backend/apis/Users.js
const express = require('express');
const router = express.Router();

const pool = require('../config/database'); // o ../config/database.js

// GET: listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error GET /users:', err);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// POST: crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, id_rol } = req.body;

    if (!nombre || !email || !password || !id_rol) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    await pool.query(
      'INSERT INTO users (nombre, email, password, id_rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, id_rol]
    );

    res.json({ success: true, message: 'Usuario creado' });
  } catch (err) {
    console.error('Error POST /users:', err);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
});

module.exports = router;
