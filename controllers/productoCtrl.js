const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Producto = require('../models/Producto');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CAMPOS_EDITABLES = ['nombre', 'marca', 'tipo', 'color', 'descripcion', 'precio', 'stock', 'estado', 'es_diseno'];

// Extrae "carpeta/id" de una URL de Cloudinary para poder borrar la imagen de forma segura
const extraerIdCloudinary = (url) => {
  const partes = url.split('/');
  const nombreArchivo = partes.pop();
  const carpeta = partes.pop();
  const idSinExtension = nombreArchivo.split('.')[0];
  return `${carpeta}/${idSinExtension}`;
};

// Función auxiliar para subir a Cloudinary mediante streaming
const subirACloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'catalogo_gorras' },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// Generar slug único para SEO / URLs amigables
const generarSlugUnico = async (nombre) => {
  const base =
    nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'gorra';

  let slug = base;
  let n = 1;
  while (await Producto.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

// Manejador centralizado de errores de validación de Mongoose
const responderError = (res, error, mensajeGenerico) => {
  if (error.name === 'ValidationError') {
    const detalle = Object.values(error.errors).map((e) => e.message).join('. ');
    return res.status(400).json({ mensaje: detalle });
  }
  console.error(mensajeGenerico, error);
  return res.status(500).json({ mensaje: mensajeGenerico });
};

// ==========================================
// 1. CREAR GORRA O DISEÑO (Protegido)
// ==========================================
exports.crearGorra = async (req, res) => {
  let resultado;
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'Debes subir una imagen para la gorra o diseño' });
    }
    if (!req.body.nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    resultado = await subirACloudinary(req.file.buffer);

    const nuevaGorra = new Producto({
      nombre: req.body.nombre,
      slug: await generarSlugUnico(req.body.nombre),
      marca: req.body.marca,
      tipo: req.body.tipo,
      color: req.body.color,
      descripcion: req.body.descripcion,
      precio: req.body.precio || 0,
      stock: req.body.stock !== undefined ? req.body.stock : 1,
      estado: req.body.estado || 'activo',
      imagen_cloudinary_url: resultado.secure_url,
      es_diseno: req.body.es_diseno === 'true' || req.body.es_diseno === true
    });

    await nuevaGorra.save();

    res.status(201).json({ mensaje: 'Creado exitosamente', producto: nuevaGorra });
  } catch (error) {
    if (resultado) await cloudinary.uploader.destroy(resultado.public_id).catch(() => {});
    responderError(res, error, 'Error interno del servidor al crear el producto');
  }
};

// ==========================================
// 2a. OBTENER GORRAS ACTIVAS (Público: Tienda)
// ==========================================
exports.obtenerGorras = async (req, res) => {
  try {
    // Excluye los diseños y solo trae productos activos
    const gorras = await Producto.find({ estado: 'activo', es_diseno: { $ne: true } }).sort({ createdAt: -1 });
    res.json(gorras);
  } catch (error) {
    console.error('Error al obtener gorras:', error);
    res.status(500).json({ mensaje: 'Error al listar los productos' });
  }
};

// ==========================================
// 2b. OBTENER TODAS LAS GORRAS (Protegido: Admin)
// ==========================================
exports.obtenerGorrasAdmin = async (req, res) => {
  try {
    const gorras = await Producto.find({ es_diseno: { $ne: true } }).sort({ createdAt: -1 });
    res.json(gorras);
  } catch (error) {
    console.error('Error al obtener gorras (admin):', error);
    res.status(500).json({ mensaje: 'Error al listar los productos' });
  }
};

// ==========================================
// 2c. OBTENER DISEÑOS (Protegido: Admin) -> Soluciona el 404
// ==========================================
exports.obtenerDisenos = async (req, res) => {
  try {
    const disenos = await Producto.find({ es_diseno: true }).sort({ createdAt: -1 });
    res.json(disenos);
  } catch (error) {
    console.error('Error al obtener diseños:', error);
    res.status(500).json({ mensaje: 'Error al listar los diseños' });
  }
};

// ==========================================
// 3. EDITAR GORRA / DISEÑO (Protegido)
// ==========================================
exports.editarGorra = async (req, res) => {
  let nueva;
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Actualiza dinámicamente los campos permitidos permitiendo valores en 0 o booleanos
    CAMPOS_EDITABLES.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        if (campo === 'es_diseno') {
          producto[campo] = req.body[campo] === 'true' || req.body[campo] === true;
        } else {
          producto[campo] = req.body[campo];
        }
      }
    });

    const urlAnterior = producto.imagen_cloudinary_url;
    if (req.file) {
      nueva = await subirACloudinary(req.file.buffer);
      producto.imagen_cloudinary_url = nueva.secure_url;
    }

    await producto.save();

    // Borra la imagen vieja de Cloudinary solo si el guardado fue exitoso y se subió una nueva
    if (req.file && urlAnterior) {
      await cloudinary.uploader.destroy(extraerIdCloudinary(urlAnterior)).catch(() => {});
    }

    res.json({ mensaje: 'Actualizado correctamente', producto });
  } catch (error) {
    if (nueva) await cloudinary.uploader.destroy(nueva.public_id).catch(() => {});
    responderError(res, error, 'Error al actualizar el producto');
  }
};

// ==========================================
// 4. ELIMINAR GORRA / DISEÑO (Protegido)
// ==========================================
exports.eliminarGorra = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (producto.imagen_cloudinary_url) {
      await cloudinary.uploader.destroy(extraerIdCloudinary(producto.imagen_cloudinary_url)).catch(() => {});
    }
    
    await Producto.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Eliminado del catálogo y de la nube' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
};