const express = require('express');
const router = express.Router();

// Importar el controlador que genera el XML
const feedController = require('../controllers/feedController');

// Definir la ruta GET (La URL que Facebook leerá)
router.get('/facebook', feedController.generarFeedFacebook);

module.exports = router;