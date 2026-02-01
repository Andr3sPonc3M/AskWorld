require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Inicializar aplicación Express
const app = express();

// Conectar a base de datos
connectDB();

// Middleware global para parsing JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para logs de requests (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
  });
}

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Error de MongoDB: duplicado
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `El valor de ${campo} ya existe`
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errores: mensajes
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar servidor
const servidor = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Servidor Backend Auth System                          ║
║                                                            ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                               ║
║   Puerto: ${PORT}                                           ║
║   API:    http://localhost:${PORT}/api                      ║
║                                                            ║
║   Endpoints principales:                                   ║
║   • POST   /api/auth/register                              ║
║   • POST   /api/auth/login                                 ║
║   • GET    /api/auth/me (protegido)                        ║
║   • POST   /api/auth/logout                                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (err) => {
  console.error('Promesa rechazada:', err);
  servidor.close(() => {
    process.exit(1);
  });
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

module.exports = app;
