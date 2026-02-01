const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas (requiere token válido)
exports.proteger = async (req, res, next) => {
  let token;

  // Verificar si viene el token en el header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Por favor inicia sesión para acceder.'
    });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario del token no encontrado'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Adjuntar usuario al request
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicia sesión nuevamente.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }
};

// Middleware para verificar roles específicos
exports.autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.usuario.rol}' no tiene acceso a este recurso`
      });
    }
    next();
  };
};

// Middleware opcional: solo verifica token si existe (para rutas semi-protegidas)
exports.opcionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await User.findById(decoded.id);
      if (usuario && usuario.activo) {
        req.usuario = usuario;
      }
    } catch (error) {
      // Token inválido pero continuamos sin usuario
      console.warn('Token opcional inválido:', error.message);
    }
  }

  next();
};
