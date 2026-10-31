// Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const path = require('path'); // 👈 1. Importamos path aquí arriba
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
  origin: ['http://localhost:5175', 'https://tiendabeisbolera.onrender.com'], // Permite tu local y tu propio dominio si es necesario
  credentials: true
}));
app.use(express.json()); // Permite leer datos en formato JSON desde el frontend
app.use(cookieParser()); // Habilita la lectura de req.cookies para la seguridad

// ==========================================
// 2. ARCHIVOS ESTÁTICOS DEL FRONTEND
// ==========================================
// 🟢 Indicarle a Express dónde están los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONECTAR LAS RUTAS DE LA API
// ==========================================
// Todas las rutas de api.js tendrán el prefijo '/api'
app.use('/api', apiRoutes);

// Ruta de bienvenida o prueba para la raíz (si entran a la raíz y no hay frontend o prefieres probar)
app.get('/api-status', (req, res) => {
  res.json({ mensaje: '¡El backend de la tienda de gorras está activo y funcionando!' });
});

// 🟢 Ruta comodín para que Vue Router (Quasar) maneje las rutas del frontend correctamente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 4. CONEXIÓN A MONGODB E INICIO DEL SERVIDOR
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado exitosamente a MongoDB');
    
    // Solo levantamos el servidor si la base de datos respondió bien
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('🔴 Error al conectar con MongoDB:', error);
  });