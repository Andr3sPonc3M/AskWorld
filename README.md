# Sistema de Autenticación con Roles

## Descripción del Proyecto

Este es un sistema completo de autenticación para aplicaciones móviles que incluye registro de usuarios con selección de roles, inicio de sesión seguro mediante tokens JWT, control de acceso a rutas protegidas y gestión de sesiones persistentes.

El proyecto está desarrollado con arquitectura cliente-servidor, utilizando **Node.js/Express** para el backend con base de datos **MongoDB**, y **React Native con Expo** para el frontend móvil. La aplicación demuestra los conceptos fundamentales de manejo de estado, sincronización de datos y control de flujo de información en sistemas móviles modernos.

## Estructura del Proyecto

```
proyecto-auth-completo/
├── backend/                    # Servidor API REST
│   ├── config/
│   │   └── db.js              # Configuración de conexión a MongoDB
│   ├── controllers/
│   │   └── authController.js  # Lógica de autenticación
│   ├── middleware/
│   │   └── authMiddleware.js  # Middleware de protección JWT
│   ├── models/
│   │   └── User.js            # Modelo de datos del usuario
│   ├── routes/
│   │   └── authRoutes.js      # Rutas del API
│   ├── .env.example           # Variables de entorno (plantilla)
│   ├── package.json           # Dependencias del backend
│   └── server.js              # Punto de entrada del servidor
│
├── frontend-mobile/            # Aplicación React Native
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Configuración de Axios
│   │   ├── components/
│   │   │   ├── InputText.js   # Componente de entrada de texto
│   │   │   └── PrimaryButton.js # Componente de botón
│   │   ├── context/
│   │   │   └── AuthContext.js # Gestión del estado de autenticación
│   │   ├── navigation/
│   │   │   └── AppNavigator.js # Configuración de navegación
│   │   └── screens/
│   │       ├── HomeScreen.js  # Pantalla protegida (inicio)
│   │       ├── LoginScreen.js # Pantalla de inicio de sesión
│   │       └── RegisterScreen.js # Pantalla de registro
│   ├── App.js                 # Componente principal
│   ├── app.json               # Configuración de Expo
│   └── package.json           # Dependencias del frontend
│
└── README.md                   # Documentación del proyecto
```

## Roles Disponibles

El sistema soporta los siguientes roles de usuario:

| Rol | Descripción |
|-----|-------------|
| `estudiante` | Usuario con acceso a material académico y entregas |
| `profesor` | Usuario con capacidad de gestionar cursos y evaluar |
| `administrador` | Usuario con acceso completo al sistema |
| `usuario` | Usuario genérico con acceso básico |

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **MongoDB** (local o MongoDB Atlas)
- **Expo CLI** (para el frontend móvil)
- **Git** (opcional, para control de versiones)

## Instalación y Configuración

### 1. Clonar o crear el proyecto

Si tienes el código fuente, navega a la carpeta del proyecto:

```bash
cd proyecto-auth-completo
```

### 2. Configurar el Backend

2.1. Navega a la carpeta del backend:

```bash
cd backend
```

2.2. Instala las dependencias:

```bash
npm install
```

2.3. Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

2.4. Edita el archivo `.env` con tus configuraciones:

```env
# Puerto del servidor
PORT=5000

# Entorno de ejecución
NODE_ENV=development

# Conexión a MongoDB (local o Atlas)
MONGODB_URI=mongodb://localhost:27017/auth_system_db

# Clave secreta para JWT (cambiar en producción)
JWT_SECRET=tu_secreto_seguro_aqui_12345

# Tiempo de expiración del token
JWT_EXPIRE=7d

# Origen para CORS
CORS_ORIGIN=http://localhost:3000
```

2.5. Inicia el servidor:

```bash
npm run dev
```

Deberías ver un mensaje similar a:

```
🚀 Servidor Backend Auth System
Entorno: development
Puerto: 5000
API:    http://localhost:5000/api
✅ MongoDB conectado exitosamente: localhost
```

### 3. Configurar el Frontend

3.1. Abre una nueva terminal y navega a la carpeta del frontend:

```bash
cd frontend-mobile
```

3.2. Instala las dependencias:

```bash
npm install
```

3.3. Inicia la aplicación con Expo:

```bash
npm start
```

O alternativamente:

```bash
npx expo start
```

3.4. Escanea el código QR con la aplicación **Expo Go** en tu dispositivo móvil, o presiona:
- `a` para abrir en Android Emulator
- `i` para abrir en iOS Simulator
- `w` para abrir en navegador web

## Endpoints del API

### Rutas Públicas

| Método | Endpoint | Descripción | Cuerpo de Solicitud |
|--------|----------|-------------|---------------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | `{nombre, email, password, rol}` |
| POST | `/api/auth/login` | Iniciar sesión | `{email, password}` |
| GET | `/api/auth/verify` | Verificar token válido | N/A |

### Rutas Protegidas (requieren token)

| Método | Endpoint | Descripción | Headers |
|--------|----------|-------------|---------|
| GET | `/api/auth/me` | Obtener perfil del usuario | `Authorization: Bearer <token>` |
| POST | `/api/auth/logout` | Cerrar sesión | `Authorization: Bearer <token>` |

### Ejemplos de Uso con cURL

**Registrar un usuario:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "password": "password123",
    "rol": "estudiante"
  }'
```

**Iniciar sesión:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@email.com",
    "password": "password123"
  }'
```

**Obtener perfil (protegido):**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Flujo de la Aplicación

### Pantalla de Login

La pantalla de inicio de sesión permite a los usuarios autenticarse con su email y contraseña. Incluye validación de campos y manejo de errores. Los usuarios que no tienen cuenta pueden navegar a la pantalla de registro.

### Pantalla de Registro

El formulario de registro solicita al usuario su nombre completo, email, contraseña y rol. Los roles disponibles se presentan en un selector desplegable. La validación asegura que los datos cumplan con los requisitos antes de enviar la solicitud al servidor.

### Pantalla de Inicio (Protegida)

Una vez autenticado, el usuario accede a esta pantalla que muestra su información personal incluyendo nombre, email, rol asignado y estado de la cuenta. También presenta los privilegios correspondientes al rol del usuario y un botón para cerrar sesión de manera segura.

## Persistencia de Sesión

La aplicación utiliza **AsyncStorage** para persistir el token de autenticación en el dispositivo móvil. Esto permite que el usuario permanezca autenticado incluso después de cerrar y reopenir la aplicación. El flujo de persistencia funciona de la siguiente manera:

Al iniciar sesión exitosamente, el servidor devuelve un token JWT que el cliente almacena localmente. Cada vez que la aplicación se abre, se verifica la existencia del token y se valida con de permitir el acceso a las rutas protegidas. Al cerrar sesión, el el servidor antes token se elimina del almacenamiento local.

## Características de Seguridad

El sistema implementa múltiples capas de seguridad para proteger la información de los usuarios. La contraseña se almacena en la base de datos utilizando el algoritmo de hash bcrypt con un salt de 10 rounds. Los tokens JWT tienen una expiración configurable y se verifican en cada solicitud a rutas protegidas.

El middleware de autenticación valida la integridad del token y verifica que el usuario asociado esté activo. Las rutas sensibles requieren autenticación y, opcionalmente, pueden verificar roles específicos del usuario. El CORS está configurado para permitir solicitudes solo desde orígenes autorizados.

## Solución de Problemas

### Error de conexión a MongoDB

Si el servidor no puede conectar con MongoDB, verifica que el servicio de MongoDB esté ejecutándose y que la URL de conexión en el archivo `.env` sea correcta. Si usas MongoDB Atlas, asegúrate de que la dirección IP de tu red esté whitelist en la configuración del cluster.

### Error de red en el dispositivo móvil

Para conectar el dispositivo físico con el servidor local, ambos deben estar en la misma red WiFi. Además, usa la IP de tu computadora en lugar de `localhost` en la configuración del API. Para desarrollo, cambia `http://localhost:5000` a `http://TU_IP:5000` en `frontend-mobile/src/api/api.js`.

### Token expirado

Si recibes un error de token expirado, cierra sesión y vuelve a iniciar sesión para obtener un nuevo token. Los tokens tienen una expiración configurable en la variable de entorno `JWT_EXPIRE`.

## Tecnologías Utilizadas

### Backend

El backend está construido sobre Node.js utilizando Express como framework de servidor. La base de datos MongoDB se comunica mediante Mongoose para el modelado de datos. La autenticación se implementa con JSON Web Tokens (JWT) y la seguridad de contraseñas utiliza bcryptjs.

### Frontend

La aplicación móvil se desarrolla con React Native utilizando Expo como plataforma de desarrollo. La navegación se gestiona con React Navigation y el estado de autenticación se maneja mediante Context API. Las solicitudes HTTP se realizan con Axios con interceptores para manejo automático de tokens.

## Demostración en Clase

Para presentar el proyecto en la clase encuentro, sigue estos pasos:

1. Ejecuta el backend con `npm run dev` en la carpeta `backend`
2. Inicia la aplicación móvil con `npm start` en la carpeta `frontend-mobile`
3. Realiza una demostración completa del flujo de registro e inicio de sesión
4. Muestra la persistencia de sesión cerrando y reopeniendo la aplicación
5. Presenta el código fuente destacando la estructura de carpetas y la arquitectura

## Licencia

Este proyecto fue desarrollado con fines educativos para la Universidad Estatal Amazónica (UEA) como parte de la materia de Implementación de Interfaces de Usuario.

---

**Desarrollado por:** [Tu Nombre]  
**Universidad:** Universidad Estatal Amazónica  
**Fecha:** 2024
