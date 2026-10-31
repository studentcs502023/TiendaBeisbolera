// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar el mapa de rutas y las rutas de los feeds para Facebook
const apiRoutes = require('./routes/api');
const feedRoutes = require('./routes/feeds');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
app.use(cors({
  origin: ['http://localhost:5175', 'https://tiendabeisbolera.onrender.com'], // 👈 Soporta local y producción en Render
  credentials: true
}));
app.use(express.json()); // Permite leer datos en formato JSON desde el frontend
app.use(cookieParser()); // Habilita la lectura de cookies

// ==========================================
// 2. ARCHIVOS ESTÁTICOS DEL FRONTEND
// ==========================================
// Sirve los archivos compilados de Quasar desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONECTAR LAS RUTAS DEL BACKEND
// ==========================================
// Todas las rutas principales y el feed XML tendrán el prefijo '/api'
app.use('/api', apiRoutes);
app.use('/api', feedRoutes); // 👈 Habilita la ruta: https://tiendabeisbolera.onrender.com/api/facebook

// Ruta de estado para verificar que la API responde
app.get('/api-status', (req, res) => {
  res.json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// ==========================================
// 4. RUTA COMODÍN PARA EL FRONTEND (SPA)
// ==========================================
// Permite que Vue/Quasar gestione las rutas internas de la web (va al final)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 5. CONEXIÓN A MONGODB E INICIO DEL SERVIDOR
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado exitosamente a MongoDB');
    
    // Render asigna un puerto dinámico mediante process.env.PORT
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Error al conectar con MongoDB:', error);
  });