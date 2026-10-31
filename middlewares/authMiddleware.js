const jwt = require('jsonwebtoken');

exports.protegerRuta = (req, res, next) => {
  // 🔍 Buscamos la cookie con el nombre exacto que tiene el navegador (o 'token' por si acaso)
  let token = req.cookies.token_catalogo_gorras || req.cookies.token;

  if (!token) {
    let authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7, authHeader.length).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No hay token.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro');
    req.usuario = decodificado;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

exports.soloAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
};