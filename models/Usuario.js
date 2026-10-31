const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  rol: {
    type: String,
    enum: ['admin', 'usuario'], // Solo permite estos dos valores exactos
    default: 'usuario' // Todo el que se registre por defecto será usuario normal
  }
}, {
  timestamps: true,
  versionKey: false
});

// Encriptar la contraseña ANTES de guardar en la base de datos
// (Quitamos 'next' de los parámetros porque es una función async)
usuarioSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar la contraseña
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);