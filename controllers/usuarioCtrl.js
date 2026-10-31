const Usuario = require('../models/Usuario');

const jwt = require('jsonwebtoken');

// ==========================================
// 1. CREAR NUEVO ADMINISTRADOR
// ==========================================
exports.crearUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el correo ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
    }

    // Crear y guardar (el modelo Usuario.js se encargará de encriptar el password automáticamente)
    const nuevoUsuario = new Usuario({ email, password });
    await nuevoUsuario.save();

    res.status(201).json({ 
      mensaje: 'Administrador creado exitosamente',
      usuario: { id: nuevoUsuario._id, email: nuevoUsuario.email }
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
    // Usamos .select('-password') para NUNCA enviar las contraseñas al frontend
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al listar los administradores' });
  }
};

// ==========================================
// 3. EDITAR UN ADMINISTRADOR (Email o Password)
// ==========================================
exports.editarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const usuario = await Usuario.findById(idUsuario);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizamos los campos que el frontend haya enviado
    usuario.email = req.body.email || usuario.email;
    
    // Si envían un nuevo password, lo asignamos (el modelo lo encriptará antes de guardar)
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    await usuario.save();

    res.json({ 
      mensaje: 'Administrador actualizado correctamente',
      usuario: { id: usuario._id, email: usuario.email }
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
    
    // Opcional: Evitar que el admin en sesión se borre a sí mismo
    if (req.usuario.id === idUsuario) {
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

    // 1. Buscar el usuario por correo
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // 2. Verificar la contraseña usando el método del modelo
    const esCorrecta = await usuario.compararPassword(password);
    if (!esCorrecta) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // 3. Crear el Token JWT (asegúrate de usar tu variable de entorno o una clave secreta)
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '1d' }
    );

    // 4. Guardar el token en una cookie httpOnly segura
  res.cookie('token', token, {
      httpOnly: true,
      secure: false,       // 👈 Debe estar en false para HTTP local
      sameSite: 'lax',     // O prueba con 'none' si tu navegador es muy estricto
      path: '/'            // 👈 Asegura que aplique a toda la API
    });

    // 5. Responder al frontend con éxito
    res.json({ 
      mensaje: 'Login exitoso',
      usuario: { id: usuario._id, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión' });
  }
};

// ==========================================
// 6. OBTENER PERFIL DEL USUARIO EN SESIÓN (/me)
// ==========================================
exports.obtenerPerfil = async (req, res) => {
  try {
    // req.usuario viene del middleware 'protegerRuta' que descodificó el JWT
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};