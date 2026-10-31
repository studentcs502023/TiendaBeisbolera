const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Producto = require('../models/Producto');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función auxiliar para extraer el ID de la imagen en Cloudinary
const extraerIdCloudinary = (url) => {
  const partes = url.split('/');
  const nombreArchivo = partes.pop();
  const carpeta = partes.pop();
  const idSinExtension = nombreArchivo.split('.')[0];
  return `${carpeta}/${idSinExtension}`;
};

// ==========================================
// 1. CREAR GORRA (Protegido)
// ==========================================

// Ejemplo dentro de tu función crearGorra:
exports.crearGorra = async (req, res) => {
  try {
    let imagenUrl = '';

    // Si el usuario subió una imagen con multer
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'gorras_catalogo' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

      const resultadoCloudinary = await uploadPromise;
      imagenUrl = resultadoCloudinary.secure_url;
    }

    // Guardar en la base de datos junto con el campo de la URL de Cloudinary
    const nuevaGorra = new Producto({
      ...req.body,
      imagen_cloudinary_url: imagenUrl
    });

    await nuevaGorra.save();
    res.status(201).json({ mensaje: 'Gorra creada con éxito', gorra: nuevaGorra });

  } catch (error) {
    console.error('Error al crear gorra:', error);
    res.status(500).json({ mensaje: 'Error al procesar la imagen o guardar el producto' });
  }
};

// ==========================================
// 2. OBTENER TODAS LAS GORRAS (Público)
// ==========================================
exports.obtenerGorras = async (req, res) => {
  try {
    // Retorna todos los productos ordenados del más nuevo al más antiguo
    const gorras = await Producto.find().sort({ createdAt: -1 });
    res.json(gorras);
  } catch (error) {
    console.error('Error al obtener gorras:', error);
    res.status(500).json({ mensaje: 'Error al listar los productos' });
  }
};

// ==========================================
// 3. EDITAR GORRA (Protegido)
// ==========================================
exports.editarGorra = async (req, res) => {
  try {
    const idProducto = req.params.id;
    let producto = await Producto.findById(idProducto);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Gorra no encontrada' });
    }

    let nuevaUrlImagen = producto.imagen_cloudinary_url;

    if (req.file) {
      const idViejo = extraerIdCloudinary(producto.imagen_cloudinary_url);
      await cloudinary.uploader.destroy(idViejo);

      const subirACloudinary = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'catalogo_gorras' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
      
      const resultado = await subirACloudinary(req.file.buffer);
      nuevaUrlImagen = resultado.secure_url;
    }

    producto.nombre = req.body.nombre || producto.nombre;
    producto.marca = req.body.marca || producto.marca;
    producto.tipo = req.body.tipo || producto.tipo;
    producto.color = req.body.color || producto.color;
    producto.precio = req.body.precio || producto.precio;
    producto.stock = req.body.stock || producto.stock;
    producto.estado = req.body.estado || producto.estado;
    producto.imagen_cloudinary_url = nuevaUrlImagen;

    await producto.save();

    res.json({ mensaje: 'Gorra actualizada correctamente', producto });
  } catch (error) {
    console.error('Error al editar:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la gorra' });
  }
};

// ==========================================
// 4. ELIMINAR GORRA (Protegido)
// ==========================================
exports.eliminarGorra = async (req, res) => {
  try {
    const idProducto = req.params.id;
    const producto = await Producto.findById(idProducto);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Gorra no encontrada' });
    }

    const idCloudinary = extraerIdCloudinary(producto.imagen_cloudinary_url);
    await cloudinary.uploader.destroy(idCloudinary);

    await Producto.findByIdAndDelete(idProducto);

    res.json({ mensaje: 'Gorra eliminada del catálogo y de la nube' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la gorra' });
  }
};