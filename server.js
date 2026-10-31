// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar el mapa de rutas que acabas de crear
const apiRoutes = require('./routes/api');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
app.use(cors({
  origin: 'http://localhost:5175', // <-- Asegúrate de que sea 5175
  credentials: true
}));
app.use(express.json()); // Permite leer datos en formato JSON desde el frontend
app.use(cookieParser()); // Habilita la lectura de req.cookies para la seguridad

// ==========================================
// 2. CONECTAR LAS RUTAS
// ==========================================
// Todas las rutas de api.js tendrán el prefijo '/api'
app.use('/api', apiRoutes);

// ==========================================
// 3. CONEXIÓN A MONGODB E INICIO DEL SERVIDOR
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado exitosamente a MongoDB');
    
    // Solo levantamos el servidor si la base de datos respondió bien
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Error al conectar con MongoDB:', error);
  });