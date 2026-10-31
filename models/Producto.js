const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la gorra es obligatorio'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder los 150 caracteres']
  },
 slug: {
  type: String,
  required: false, // 👈 Cambiar a false para que no sea estrictamente requerido por validación manual
  unique: true,
  lowercase: true,
  trim: true
},
  marca: {
    type: String,
    required: [true, 'La marca es obligatoria'],
    index: true // Acelera las búsquedas por marca en la base de datos
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de gorra es obligatorio (ej. Plana, Trucker)'],
    index: true
  },
  color: {
    type: String,
    required: [true, 'El color principal es obligatorio'],
    index: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'El stock no puede ser negativo']
  },
  imagen_cloudinary_url: {
    type: String,
    required: [true, 'La URL de la imagen de Cloudinary es obligatoria']
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo',
    index: true // Ayuda a filtrar rápido solo las gorras activas para el catálogo
  }
}, {
  // Configuración extra de Mongoose
  timestamps: true, // Crea automáticamente los campos 'createdAt' y 'updatedAt'
  versionKey: false // Evita que Mongoose agregue el campo oculto '__v' al JSON
});


// Quita el parámetro 'next' y usa async/await de forma limpia
productoSchema.pre('save', async function() {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});
// Exportamos el modelo para usarlo en los controladores
module.exports = mongoose.model('Producto', productoSchema);