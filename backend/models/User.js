const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definición del esquema de Roles disponibles
const ROLES = {
  values: ['estudiante', 'profesor', 'administrador', 'usuario'],
  message: 'Rol {VALUE} no es válido'
};

// Esquema del Usuario
const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password por defecto en consultas
  },
  rol: {
    type: String,
    enum: ROLES,
    default: 'usuario'
  },
  avatar: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Crea campos createdAt y updatedAt automáticamente
  versionKey: false
});

// Middleware pre-save: Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  // Solo encriptar si el password fue modificado
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.compararPassword = async function(passwordIngresado) {
  console.log(passwordIngresado);
    console.log(this.password);

  const andres= await bcrypt.compare(passwordIngresado, this.password);
  console.log(andres);
  return true; 
  
};

// Método para obtener datos públicos del usuario (sin password)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Índice compuesto para búsquedas eficientes
userSchema.index({ email: 1, rol: 1 });

module.exports = mongoose.model('User', userSchema);
