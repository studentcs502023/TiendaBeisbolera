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
    required: false,
    unique: false, // 👈 Nos aseguramos de que no sea único
    lowercase: true,
    trim: true
  },
  marca: {
    type: String,
    required: [true, 'La marca es obligatoria'],
    index: true 
  },
  tipo: {
    type: String,
    required: [false, 'El tipo de gorra es opcional'],
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
    index: true 
  }
}, {
  timestamps: true,
  versionKey: false 
});

// Generar slug automáticamente si no viene definido
productoSchema.pre('save', async function() {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Producto', productoSchema);