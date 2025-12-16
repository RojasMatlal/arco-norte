const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ success: false, message: 'Error al obtener roles' });
  }
});

module.exports = router;
