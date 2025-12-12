// Importar módulo de base de datos
const db = require('./config/database');
const cors = require("cors");
require("dotenv").config();
const express = require("express");

const loginRoutes = require('./apis/Login');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true
})
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

// Endpoint de healthcheck para probar conexión a la BD
app.get('/config/health', async (req, res) => {
  try {
    // db.query viene de module.exports en database.js
    await db.query('SELECT 1');
    res.json({ status: 'ok', message: 'BD disponible' });
  } catch (err) {
    console.error('Error en health DB:', err);
    res.status(500).json({ status: 'error', message: 'BD no disponible' });
  }
});

app.post('/apis/login', async (req, res) => {
    
});


app.use('/apis/login', loginRoutes);

// app.listen(5000, () => console.log('Servidor en puerto 5000'));
//  Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Servidor de ArcoNorte corriendo en puerto: ${PORT}`);
  console.log(` Frontend: http://localhost:3000`);
  console.log(` Backend API: http://localhost:${PORT}/apis`);
  console.log(`  Health Check: http://localhost:${PORT}/config`);
  console.log(`  Health Check: http://localhost:${PORT}/apis/login`);
});
