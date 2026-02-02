const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar JWT Token
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario con selección de rol
// @access  Público
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    console.log(email, usuarioExistente);
    
    if (usuarioExistente) {
      return res.status(400).json({
        success: true,
        message: 'Email ya registrado1'
      });
    }

    // Crear nuevo usuario
    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'usuario' // Rol por defecto si no se especifica
    });

    // Generar token
    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errores: mensajes
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @route   POST /api/auth/login
// @desc    Iniciar sesión con credenciales
// @access  Público
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // Buscar usuario e incluir password en la consulta
    console.log(email,password);
    const usuario = await User.findOne({ email }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const esCoincidencia = await usuario.compararPassword(password);

    if (!esCoincidencia) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas1'
      });
    }

    // Generar token
    const token = generarToken(usuario._id);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @route   GET /api/auth/me
// @desc    Obtener usuario actual (ruta protegida)
// @access  Privado
exports.obtenerUsuarioActual = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        creadoEn: usuario.createdAt
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Cerrar sesión (opcional, útil para blacklist de tokens)
// @access  Privado
exports.logout = async (req, res) => {
  try {
    // En una implementación más robusta, aquí se añadiría el token
    // a una lista negra (blacklist) para invalidarlo inmediatamente
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};
