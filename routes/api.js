const express = require('express');
const router = express.Router();

// Importación de Controladores
const authCtrl = require('../controllers/authCtrl');
const usuarioCtrl = require('../controllers/usuarioCtrl');
const productoCtrl = require('../controllers/productoCtrl');
const metaFeedCtrl = require('../controllers/metaFeedCtrl');

// Middleware de seguridad
const { protegerRuta, soloAdmin } = require('../middlewares/authMiddleware');

// Configuración de Multer (Imágenes en memoria / Cloudinary)
const { upload } = require('../config/cloudinary');

// ==========================================
// 1. RUTAS DE AUTENTICACIÓN
// ==========================================
router.post('/login', usuarioCtrl.login); // Usamos el controlador principal de login que creamos
router.post('/logout', authCtrl.logout);
router.get('/me', protegerRuta, usuarioCtrl.obtenerPerfil); // Obtiene los datos del admin en sesión

// ==========================================
// 2. RUTAS DE ADMINISTRADORES (Protegidas)
// ==========================================
router.post('/usuarios', protegerRuta, soloAdmin, usuarioCtrl.crearUsuario);
router.get('/usuarios', protegerRuta, soloAdmin, usuarioCtrl.obtenerUsuarios);
router.put('/usuarios/:id', protegerRuta, soloAdmin, usuarioCtrl.editarUsuario);
router.delete('/usuarios/:id', protegerRuta, soloAdmin, usuarioCtrl.eliminarUsuario);

// ==========================================
// 3. RUTAS DE GORRAS (Catálogo)
// ==========================================

// GET público: Para que la tienda en Vue pueda listar las gorras sin iniciar sesión
router.get('/gorras', productoCtrl.obtenerGorras); 

// POST, PUT, DELETE protegidos: Solo el administrador puede modificar el catálogo
router.post('/gorras', protegerRuta, soloAdmin, upload.single('imagen'), productoCtrl.crearGorra);
router.put('/gorras/:id', protegerRuta, soloAdmin, upload.single('imagen'), productoCtrl.editarGorra);
router.delete('/gorras/:id', protegerRuta, soloAdmin, productoCtrl.eliminarGorra);

// ==========================================
// 4. RUTAS DE INTEGRACIÓN (Meta / Facebook)
// ==========================================
// Ruta pública para que Meta Commerce Manager lea el catálogo en XML
router.get('/feed/facebook.xml', metaFeedCtrl.generarFeedFacebook);

module.exports = router;