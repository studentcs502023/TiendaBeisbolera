const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. CREAR NUEVO ADMINISTRADOR
// ==========================================
exports.crearUsuario = async (req, res) => {
  try {
    const { email, password, rol } = req.body;

    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
    }

    const nuevoUsuario = new Usuario({ 
      email, 
      password,
      rol: rol || 'admin'
    });
    await nuevoUsuario.save();

    res.status(201).json({ 
      mensaje: 'Administrador creado exitosamente',
      usuario: { id: nuevoUsuario._id, email: nuevoUsuario.email, rol: nuevoUsuario.rol }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear el administrador' });
  }
};

// ==========================================
// 2. LISTAR TODOS LOS ADMINISTRADORES
// ==========================================
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al listar los administradores' });
  }
};

// ==========================================
// 3. EDITAR UN ADMINISTRADOR
// ==========================================
exports.editarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const usuario = await Usuario.findById(idUsuario);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuario.email = req.body.email || usuario.email;
    if (req.body.rol) usuario.rol = req.body.rol;
    
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    await usuario.save();

    res.json({ 
      mensaje: 'Administrador actualizado correctamente',
      usuario: { id: usuario._id, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el administrador' });
  }
};

// ==========================================
// 4. ELIMINAR UN ADMINISTRADOR
// ==========================================
exports.eliminarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    
    if (req.usuario && req.usuario.id === idUsuario) {
      return res.status(403).json({ mensaje: 'No puedes eliminar tu propia cuenta mientras estás conectado' });
    }

    const usuarioEliminado = await Usuario.findByIdAndDelete(idUsuario);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Administrador eliminado del sistema' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el administrador' });
  }
};

// ==========================================
// 5. INICIAR SESIÓN (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const esCorrecta = await usuario.compararPassword(password);
    if (!esCorrecta) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '1d' }
    );

    // Cookie nombrada 'token_catalogo_gorras' para coincidir exactamente con authMiddleware.js
    res.cookie('token_catalogo_gorras', token, {
      httpOnly: true,
      secure: true,      // Obligatorio en Render (HTTPS)
      sameSite: 'none',  // Obligatorio para peticiones entre dominios (Hostinger/Localhost -> Render)
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({ 
      mensaje: 'Login exitoso',
      token, // Fallback por si el frontend guarda en localStorage
      usuario: { id: usuario._id, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión' });
  }
};

// ==========================================
// 6. CERRAR SESIÓN (LOGOUT)
// ==========================================
exports.logout = (req, res) => {
  res.clearCookie('token_catalogo_gorras', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  res.json({ mensaje: 'Sesión cerrada correctamente' });
};

// ==========================================
// 7. OBTENER PERFIL EN SESIÓN (/me)
// ==========================================
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Homologado con la respuesta del Login
    res.json({
      exito: true,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error en el servidor al consultar perfil' });
  }
};