# AskWorld - Foro Global de Preguntas y Respuestas

<div align="center">
  <h3>🌍 Pregunta sin barreras de idioma 🌍</h3>
  <p>Plataforma móvil que conecta personas de todo el mundo a través de preguntas y respuestas, eliminando las barreras del idioma.</p>
</div>

## 📱 Características Principales

### ✅ Autenticación Completa
- Registro de nuevos usuarios con detección automática de idioma nativo
- Inicio de sesión seguro con JWT
- Gestión de perfil de usuario

### 💬 Sistema de Preguntas y Respuestas
- **Crear preguntas** con título, descripción y categoría
- **Responder preguntas** de la comunidad global
- **Votar** preguntas y respuestas (upvote/downvote)
- **Buscar** preguntas por texto o categoría
- **Filtrar** por categorías temáticas
- **Ordenar** por reciente, popular o más votadas

### 🗂️ 10 Categorías Temáticas
1. 💻 Tecnología y Programación
2. 🔬 Ciencia y Matemáticas
3. 📚 Educación y Aprendizaje
4. 💊 Salud y Bienestar
5. 🎨 Arte y Cultura
6. 💼 Negocios y Emprendimiento
7. ✈️ Viajes y Geografía
8. 🗣️ Idiomas
9. ⚽ Deportes y Fitness
10. 🏠 Vida Cotidiana

### 🌐 Traducción Automática
- Integración con **LibreTranslate** para traducción de contenido
- Detección automática del idioma del dispositivo
- Botón "Traducir" en cada pregunta y respuesta
- Toggle entre contenido original y traducido
- Caché de traducciones para mejor performance
- Indicadores visuales de idioma original

### 🎨 Diseño Mobile-First
- Interfaz oscura moderna
- Navegación por tabs intuitiva
- Componentes nativos para mejor rendimiento
- Gestos táctiles optimizados

## 🏗️ Arquitectura Técnica

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py          # API endpoints y lógica de negocio
├── requirements.txt   # Dependencias Python
└── .env              # Configuración (MongoDB, JWT secret)
```

**Endpoints principales:**
- `/api/auth/*` - Autenticación (register, login, me)
- `/api/questions/*` - CRUD de preguntas
- `/api/questions/{id}/answers/*` - Gestión de respuestas
- `/api/votes` - Sistema de votación
- `/api/categories` - Categorías con contador
- `/api/translate` - Servicio de traducción

### Frontend (React Native + Expo)
```
/app/frontend/
├── app/
│   ├── (auth)/        # Pantallas de autenticación
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/        # Navegación principal
│   │   ├── home.tsx   # Lista de preguntas
│   │   ├── search.tsx # Búsqueda avanzada
│   │   ├── ask.tsx    # Crear pregunta
│   │   └── profile.tsx
│   ├── question/
│   │   └── [id].tsx   # Detalles + respuestas
│   └── _layout.tsx
├── contexts/
│   └── AuthContext.tsx
├── utils/
│   ├── api.ts
│   ├── storage.ts
│   └── categories.ts
└── components/
```

### Base de Datos (MongoDB)
**Colecciones:**
- `users` - Información de usuarios
- `questions` - Preguntas publicadas
- `answers` - Respuestas a preguntas
- `votes` - Votos de usuarios

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+
- Python 3.11+
- MongoDB
- Expo CLI

### Configuración Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Configuración Frontend
```bash
cd /app/frontend
yarn install
expo start --tunnel
```

### Variables de Entorno

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET_KEY=your-secret-key-here
```

**Frontend (.env):**
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

## 📖 Guía de Uso

### Para Usuarios

1. **Registro**: Abre la app y crea una cuenta con email, nombre de usuario y contraseña
2. **Explora**: Navega por preguntas recientes en la pantalla de inicio
3. **Busca**: Usa la búsqueda para encontrar preguntas por texto o categoría
4. **Pregunta**: Toca el botón "+" para hacer una nueva pregunta
5. **Responde**: Abre cualquier pregunta y comparte tu conocimiento
6. **Vota**: Usa ↑ y ↓ para votar contenido útil

### Flujo de Ejemplo
```
Usuario 1 (España, español) 
└── Pregunta: "¿Cómo funciona React Native?"
    └── Categoría: Tecnología y Programación
    
Usuario 2 (Japón, japonés)
└── Ve la pregunta (traducida automáticamente)
└── Responde: "React Native usa componentes nativos..."
    
Usuario 1
└── Ve la respuesta (traducida al español)
└── Vota ↑ porque fue útil
```

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt**
- Tokens JWT con expiración de 7 días
- Validación de entrada con Pydantic
- Autorización para operaciones de eliminación (solo propietario)
- CORS configurado para producción

## 🧪 Testing

### Backend
El backend ha sido testeado completamente:
- ✅ Autenticación (registro, login, JWT)
- ✅ CRUD de preguntas
- ✅ Sistema de respuestas
- ✅ Sistema de votación
- ✅ Búsqueda y filtros
- ✅ Traducción

**Credenciales de prueba:** Ver `/app/memory/test_credentials.md`

## 🔮 Roadmap Futuro

### Próximas Características (No implementadas)
- [ ] **Notificaciones Push** cuando recibas respuestas
- [ ] **Sugerencias de preguntas similares con IA**
- [ ] **Traducción en tiempo real** al leer contenido
- [ ] **Sistema de badges y reputación**
- [ ] **Compartir preguntas en redes sociales**
- [ ] **Modo offline** con sincronización
- [ ] **Imágenes en preguntas/respuestas**
- [ ] **Markdown en respuestas**

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Frontend** | React Native, Expo Router, TypeScript |
| **Backend** | FastAPI, Python 3.11 |
| **Base de Datos** | MongoDB con Motor (async) |
| **Autenticación** | JWT, bcrypt |
| **Traducción** | LibreTranslate (API pública) |
| **Estado** | React Context API |
| **HTTP Client** | Axios |
| **Navegación** | Expo Router (file-based) |
| **UI Components** | React Native built-in |
| **Icons** | Expo Vector Icons (Ionicons) |

## 👨‍💻 Estructura del Código

### Patrones de Diseño
- **Repository Pattern** para acceso a datos (MongoDB)
- **Context API** para estado global de autenticación
- **File-based routing** con Expo Router
- **Modular components** reutilizables

### Convenciones
- TypeScript para type safety
- Componentes funcionales con hooks
- Estilos usando StyleSheet.create()
- Async/await para operaciones asíncronas
- RESTful API design

## 📄 Licencia

Este proyecto es un MVP educativo desarrollado para demostrar las capacidades de una plataforma Q&A global sin barreras de idioma.

## 🤝 Contribuciones

Este es un proyecto MVP. Para mejoras futuras:
1. Implementar pruebas unitarias y de integración
2. Mejorar la UI/UX con animaciones
3. Optimizar queries de MongoDB con índices
4. Implementar rate limiting en API
5. Agregar caché con Redis
6. Implementar CI/CD pipeline

---

<div align="center">
  <p>Hecho con ❤️ para conectar el mundo sin barreras de idioma</p>
  <p><strong>AskWorld</strong> - Pregunta. Responde. Conecta.</p>
</div>
