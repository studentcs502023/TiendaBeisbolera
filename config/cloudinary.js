const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// 1. Configurar tus credenciales de Cloudinary (si no lo haces en el controlador)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configurar Multer para guardar los archivos temporalmente en la memoria RAM (Buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por imagen
});

module.exports = { cloudinary, upload };