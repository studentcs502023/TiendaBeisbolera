const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // 2. Verificar la contraseña usando el método del modelo
    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // 3. Generar el JWT (válido por 24 horas)
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol }, // <-- Agregas el rol aquí
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Inyectar el token en una cookie HttpOnly
    res.cookie('token_catalogo_gorras', token, {
      httpOnly: true, // JavaScript no puede leerla (protección XSS)
      secure: process.env.NODE_ENV === 'production', // En producción exige HTTPS
      sameSite: 'lax', // Protege contra ataques CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24 horas de duración
    });

    // 5. Responder al frontend confirmando el éxito (sin enviar el token en el texto)
    res.json({ exito: true, mensaje: 'Login exitoso' });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Añade esto al final de authCtrl.js
exports.logout = (req, res) => {
  res.clearCookie('token_catalogo_gorras', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.json({ exito: true, mensaje: 'Sesión cerrada correctamente' });
};

exports.verificarSesion = (req, res) => {
  // Si llegó hasta aquí, el middleware 'protegerRuta' ya validó la cookie
  res.json({ 
    exito: true, 
    usuario: req.usuario // req.usuario fue inyectado por el middleware
  });
};