// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar el mapa de rutas y la ruta del feed corregida (sin la "s")
const apiRoutes = require('./routes/api');
const feedRoutes = require('./routes/feeds'); // 👈 Corregido aquí (feed en singular)

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
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONECTAR LAS RUTAS DEL BACKEND
// ==========================================
app.use('/api', apiRoutes);
app.use('/api', feedRoutes); // 👈 Habilita la ruta: https://tiendabeisbolera.onrender.com/api/facebook

// Ruta de estado para verificar que la API responde
app.get('/api-status', (req, res) => {
  res.json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// ==========================================
// 4. RUTA COMODÍN PARA EL FRONTEND (SPA)
// ==========================================
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