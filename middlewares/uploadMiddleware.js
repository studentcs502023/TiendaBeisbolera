const multer = require('multer');

// Guardar el archivo temporalmente en la memoria RAM del servidor como un Buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

module.exports = upload;