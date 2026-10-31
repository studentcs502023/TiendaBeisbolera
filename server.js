// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar el mapa de rutas
const apiRoutes = require('./routes/api');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
app.use(cors({
  origin: ['http://localhost:5175', 'https://tiendabeisbolera.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 2. ARCHIVOS ESTÁTICOS DEL FRONTEND
// ==========================================
// 🟢 Aquí SÍ va el comando para servir los archivos estáticos (JS, CSS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONECTAR LAS RUTAS DE LA API
// ==========================================
// Todas las rutas de api.js tendrán el prefijo '/api'
app.use('/api', apiRoutes);

// Ruta de bienvenida o prueba para la API
app.get('/api-status', (req, res) => {
  res.json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// ==========================================
// 4. RUTA COMODÍN PARA EL FRONTEND (SPA)
// ==========================================
// 🟢 Esta va AL FINAL (después de /api) para que Vue/Quasar maneje las rutas del frontend
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 5. CONEXIÓN A MONGODB E INICIO DEL SERVIDOR
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado exitosamente a MongoDB');
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Error al conectar con MongoDB:', error);
  });