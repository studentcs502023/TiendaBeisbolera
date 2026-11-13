// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar únicamente el enrutador principal api.js (que ya contiene todas las rutas y el feed)
const apiRoutes = require('./routes/api');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  'https://tiendabeisbolera.com',
  'https://www.tiendabeisbolera.com',
  'https://tiendabeisbolera.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen, orígenes en la lista o cualquier subdominio de Render
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ==========================================
// 2. ARCHIVOS ESTÁTICOS (TUS 2 IMÁGENES EN PUBLIC)
// ==========================================
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONECTAR LAS RUTAS DEL BACKEND
// ==========================================
// Todas las rutas de la app (incluyendo /api/feeds/facebook.xml) cuelgan de '/api'
app.use('/api', apiRoutes);

// Ruta de estado para verificar que la API responde (ideal para el monitor)
app.get('/api-status', (req, res) => {
  res.status(200).json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// ==========================================
// 4. RUTA RAÍZ Y MANEJO DE RUTAS NO ENCONTRADAS
// ==========================================
// Responde JSON limpio en lugar de buscar un index.html inexistente
app.get('/', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    servicio: 'API Tienda Beisbolera',
    frontend: 'https://tiendabeisbolera.com'
  });
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