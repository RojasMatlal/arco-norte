const express = require("express");
const cors = require("cors");
require("dotenv").config();

const loginRoutes = require('./apis/Login');
const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.get("/api/saludo", (req, res) => {
  res.json({ mensaje: "Hola desde el backend con Node.js" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

// Módulo Login en la ruta /api/login
app.use('/api/login', loginRoutes);

app.listen(PORT, () => {
  console.log(`Backend ArcoNorte corriendo en puerto ${PORT}`);
});