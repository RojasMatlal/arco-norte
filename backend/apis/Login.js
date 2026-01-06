const db = require('../config/database');
const crypto = require('crypto');
const router = express.Router();
const express = require('express');



// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos (email y/o contraseña)',
      });
    }
      const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    const query = `
      SELECT 
        u.id_usuario,
        u.estatus_usuario,
        u.nombre_usuario,
        u.ap_usuario,
        u.am_usuario,
        u.sexo_usuario,
        u.email_usuario,
        u.imagen_usuario,
        u.id_rol,
        u.area_usuario,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.email_usuario = ?
        AND u.password_usuario = ?
        AND u.estatus_usuario = 1
      LIMIT 1
    `;

    const [rows] = await db.query(query, [email, hashedPassword]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas o usuario deshabilitado',
      });
    }

    const user = rows[0];
      return res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre_usuario,
        ap_paterno: user.ap_usuario,
        ap_materno: user.am_usuario,
        sexo: user.sexo_usuario,
        email: user.email_usuario,
        imagen: user.imagen_usuario,
        id_rol: user.id_rol,
        rol: user.nombre_rol,
        area: user.area_usuario,
      },
    });
  } catch (error) {
  console.error('Error en /login:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    debug: error?.sqlMessage || error?.message || String(error),
  });
}

});

module.exports = router;
