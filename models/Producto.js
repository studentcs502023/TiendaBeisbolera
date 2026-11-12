const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  marca: {
    type: String,
    default: 'Genérica'
  },
  tipo: {
    type: String,
    default: 'Plana'
  },
  color: {
    type: String,
    default: 'Único'
  },
  descripcion: {
    type: String,
    default: ''
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: 0,
    default: 1
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  imagen_cloudinary_url: {
    type: String,
    required: [true, 'La imagen es obligatoria']
  },
  // 👈 AQUÍ AGREGAMOS EL CAMPO es_diseno
  es_diseno: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('Producto', productoSchema);