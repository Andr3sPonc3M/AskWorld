# Arquitectura de Conexión a Base de Datos - AskWorld

## 📊 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO (Móvil/Web)                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTP Requests
                               │ (via Axios)
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React Native + Expo)                  │
│                                                                       │
│  • Puerto: 3000                                                       │
│  • URL: https://knowledge-bridge-32.preview.emergentagent.com        │
│  • Archivo de configuración: /app/frontend/.env                      │
│  • Variable clave: EXPO_PUBLIC_BACKEND_URL                           │
│                                                                       │
│  Archivos principales:                                                │
│  ├── utils/api.ts          → Configuración de Axios                  │
│  ├── contexts/AuthContext  → Gestión de autenticación                │
│  └── components/           → UI Components                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ API Calls
                               │ GET/POST/PUT/DELETE /api/*
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                       │
│                                                                       │
│  • Puerto: 8001                                                       │
│  • Host: 0.0.0.0 (interno)                                           │
│  • Archivo: /app/backend/server.py                                   │
│  • Configuración: /app/backend/.env                                  │
│                                                                       │
│  Endpoints principales:                                               │
│  ├── /api/auth/*           → Autenticación (JWT)                     │
│  ├── /api/questions/*      → CRUD de preguntas                       │
│  ├── /api/questions/{id}/answers → Respuestas                        │
│  ├── /api/votes            → Sistema de votación                     │
│  ├── /api/categories       → Categorías                              │
│  └── /api/translate        → Traducción (LibreTranslate)             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ MongoDB Driver (Motor - async)
                               │ Connection String
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS (MongoDB)                          │
│                                                                       │
│  • Puerto: 27017 (por defecto)                                       │
│  • Host: localhost                                                    │
│  • Database: test_database                                            │
│  • Connection: mongodb://localhost:27017                             │
│                                                                       │
│  Colecciones:                                                         │
│  ├── users           → Información de usuarios                       │
│  │   ├── _id (ObjectId)                                              │
│  │   ├── email (único)                                               │
│  │   ├── username (único)                                            │
│  │   ├── password_hash (bcrypt)                                      │
│  │   ├── native_language                                             │
│  │   └── created_at                                                  │
│  │                                                                    │
│  ├── questions       → Preguntas publicadas                          │
│  │   ├── _id (ObjectId)                                              │
│  │   ├── user_id (ref a users)                                       │
│  │   ├── username                                                    │
│  │   ├── title                                                       │
│  │   ├── content                                                     │
│  │   ├── category                                                    │
│  │   ├── original_language                                           │
│  │   ├── votes                                                       │
│  │   ├── views                                                       │
│  │   ├── answer_count                                                │
│  │   └── created_at                                                  │
│  │                                                                    │
│  ├── answers         → Respuestas a preguntas                        │
│  │   ├── _id (ObjectId)                                              │
│  │   ├── question_id (ref a questions)                               │
│  │   ├── user_id (ref a users)                                       │
│  │   ├── username                                                    │
│  │   ├── content                                                     │
│  │   ├── original_language                                           │
│  │   ├── votes                                                       │
│  │   └── created_at                                                  │
│  │                                                                    │
│  └── votes           → Sistema de votación                           │
│      ├── user_id (ref a users)                                       │
│      ├── target_id (ref a question o answer)                         │
│      ├── target_type ('question' o 'answer')                         │
│      ├── vote_type (1 o -1)                                          │
│      └── created_at                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔌 Configuración de Conexiones

### 1. Frontend → Backend

**Archivo:** `/app/frontend/utils/api.ts`
```typescript
import axios from 'axios';
import storage from './storage';

// Lee la URL del backend desde variables de entorno
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,  // https://knowledge-bridge-32.preview.emergentagent.com/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega JWT token automáticamente a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Variables de Entorno:** `/app/frontend/.env`
```
EXPO_PUBLIC_BACKEND_URL=https://knowledge-bridge-32.preview.emergentagent.com
```

### 2. Backend → MongoDB

**Archivo:** `/app/backend/server.py`
```python
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Lee la URL de MongoDB desde variables de entorno
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Ejemplo de query
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user
```

**Variables de Entorno:** `/app/backend/.env`
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET_KEY=askworld-secret-key-2025-change-in-production
```

## 🔐 Flujo de Autenticación

### Registro:
```
1. Usuario → POST /api/auth/register
   Body: { email, username, password, native_language }

2. Backend → MongoDB
   - Hash password con bcrypt
   - INSERT INTO users collection
   - Generar JWT token

3. Backend → Usuario
   Response: { access_token, token_type, user }

4. Frontend guarda token en AsyncStorage/localStorage
```

### Login:
```
1. Usuario → POST /api/auth/login
   Body: { email, password }

2. Backend → MongoDB
   - FIND user por email
   - Verificar password con bcrypt
   - Generar JWT token

3. Backend → Usuario
   Response: { access_token, token_type, user }
```

### Peticiones Autenticadas:
```
1. Usuario → GET /api/questions
   Headers: { Authorization: "Bearer <jwt_token>" }

2. Backend → Verificar JWT
   - Decodificar token
   - Extraer user_id
   - FIND user en MongoDB

3. Backend → Ejecutar query
   - db.questions.find({...})

4. Backend → Usuario
   Response: [lista de preguntas]
```

## 📝 Ejemplo de Flujo Completo: Crear Pregunta

```
PASO 1: Usuario escribe pregunta en el frontend
┌─────────────────────────────────────────┐
│  [Título]: ¿Cómo funciona React Native? │
│  [Contenido]: Quiero aprender...        │
│  [Categoría]: Tecnología y Programación │
│  [Botón]: Publicar                      │
└─────────────────────────────────────────┘

PASO 2: Frontend envía petición HTTP
POST https://knowledge-bridge-32.preview.emergentagent.com/api/questions
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIs...",
  Content-Type: "application/json"
}
Body: {
  title: "¿Cómo funciona React Native?",
  content: "Quiero aprender...",
  category: "Tecnología y Programación"
}

PASO 3: Backend recibe petición (Puerto 8001)
@api_router.post("/questions")
async def create_question(question_data, current_user):
  # Verifica JWT token
  # Extrae current_user desde token
  
PASO 4: Backend guarda en MongoDB
await db.questions.insert_one({
  "user_id": current_user["_id"],
  "username": current_user["username"],
  "title": "¿Cómo funciona React Native?",
  "content": "Quiero aprender...",
  "category": "Tecnología y Programación",
  "original_language": "es",
  "created_at": datetime.utcnow(),
  "votes": 0,
  "views": 0,
  "answer_count": 0
})

PASO 5: MongoDB confirma inserción
{
  "acknowledged": true,
  "inserted_id": ObjectId("69cdeb564803886f9ecceac9")
}

PASO 6: Backend responde al frontend
Response 200 OK
{
  "id": "69cdeb564803886f9ecceac9",
  "user_id": "69cde123...",
  "username": "testuser",
  "title": "¿Cómo funciona React Native?",
  "content": "Quiero aprender...",
  "category": "Tecnología y Programación",
  "original_language": "es",
  "votes": 0,
  "views": 0,
  "answer_count": 0,
  "created_at": "2025-04-02T04:30:15.123Z"
}

PASO 7: Frontend actualiza UI
- Redirige a la pantalla de Home
- La nueva pregunta aparece en el feed
```

## 🌐 Servicios Externos

### LibreTranslate (Traducción)
```
Frontend → Backend → LibreTranslate API
                      https://libretranslate.com/translate

POST /api/translate
Body: {
  text: "How does React Native work?",
  source_lang: "en",
  target_lang: "es"
}

Response: {
  translatedText: "¿Cómo funciona React Native?"
}
```

## ✅ Verificación de Conexiones

### Verificar Backend → MongoDB:
```bash
curl http://localhost:8001/api/categories
# Si responde con JSON de categorías, la conexión funciona
```

### Verificar Frontend → Backend:
1. Abrir app en navegador o móvil
2. Intentar login
3. Si el login funciona, la conexión es correcta

### Ver datos en MongoDB:
```bash
mongosh
use test_database
db.users.find()
db.questions.find()
db.answers.find()
db.votes.find()
```

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verificar que MongoDB esté corriendo: `sudo systemctl status mongod`
- Verificar MONGO_URL en /app/backend/.env

### Error: "Cannot reach backend"
- Verificar que backend esté corriendo: `sudo supervisorctl status backend`
- Verificar EXPO_PUBLIC_BACKEND_URL en /app/frontend/.env

### Error: "Unauthorized"
- Token JWT expiró o es inválido
- Usuario debe hacer login nuevamente
- Verificar JWT_SECRET_KEY en backend/.env

---

**Resumen:** La app usa una arquitectura de 3 capas:
1. **Frontend** (React Native) → Interfaz de usuario
2. **Backend** (FastAPI) → Lógica de negocio y APIs
3. **MongoDB** → Almacenamiento de datos

Todos los datos de usuarios, preguntas, respuestas y votos se guardan en MongoDB.
