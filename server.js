// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const apiRoutes = require('./routes/api');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ==========================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  'https://gorrastienda.tiendabeisbolera.com',
  'https://tiendabeisboleraestilo.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
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
// 2. CONECTAR LAS RUTAS DEL BACKEND
// ==========================================
app.use('/api', apiRoutes);

app.get('/api-status', (req, res) => {
  res.status(200).json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// ==========================================
// 3. ARCHIVOS ESTÁTICOS (IMÁGENES EN PUBLIC)
// ==========================================
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ==========================================
// 4. RUTA RAÍZ DEL BACKEND (SIN INDEX.HTML)
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    servicio: 'API Tienda Beisbolera',
    frontend: 'https://tiendabeisboleraestilo.onrender.com'
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