const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { proteger, autorizarRoles } = require('../middleware/authMiddleware');

// Validaciones para registro
const validacionesRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail().withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
  body('rol')
    .optional()
    .isIn(['estudiante', 'profesor', 'administrador', 'usuario']).withMessage('Rol no válido')
];

// Validaciones para login
const validacionesLogin = [
  body('email')
    .isEmail().withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Público
router.post('/register', validacionesRegistro, (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      errores: errores.array().map(err => err.msg)
    });
  }
  authController.registrar(req, res, next);
});

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Público
router.post('/login', validacionesLogin, (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      errores: errores.array().map(err => err.msg)
    });
  }
  authController.login(req, res, next);
});

// @route   GET /api/auth/me
// @desc    Obtener perfil del usuario actual
// @access  Privado (requiere token)
router.get('/me', proteger, authController.obtenerUsuarioActual);

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Privado
router.post('/logout', proteger, authController.logout);

// @route   GET /api/auth/verify
// @desc    Verificar token válido
// @access  Público
router.get('/verify', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido'
  });
});

module.exports = router;
