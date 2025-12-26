// backend/apis/Users.js
const express = require('express');
const router = express.Router();

//  bien: desde /backend/apis -> /backend/config/database.js
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

//  GET /users/count -> contador
router.get('/count', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM usuarios');
    return res.json({ success: true, total: rows[0].total });
  } catch (err) {
    console.error('Error GET /users/count:', err);
    return res.status(500).json({ success: false, message: 'Error al contar usuarios' });
  }
});
//  listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error GET /users:', err);
    return res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

module.exports = router;
