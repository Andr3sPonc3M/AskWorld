# 🔧 Solución: Error "Registration Failed" en Celular

## ✅ Problema Resuelto

**Error reportado:** "error registration failed" en el celular

**Causa raíz:** AsyncStorage no funciona correctamente en web preview, causando que el AuthContext falle al intentar cargar/guardar tokens.

**Solución aplicada:**
1. ✅ Mejorado el wrapper de storage para manejar correctamente web y móvil
2. ✅ Agregado manejo de errores mejorado en el formulario de registro
3. ✅ Limpiado caché de Metro bundler
4. ✅ Reiniciado servicio Expo

---

## 📱 Cómo Registrarse en la App

### Desde el Celular (Expo Go):

1. **Escanea el código QR** que aparece en la terminal o en el navegador

2. **Abre Expo Go** en tu dispositivo

3. **Espera a que cargue** la aplicación

4. **En la pantalla de Login**, presiona "¿No tienes cuenta? Regístrate"

5. **Completa el formulario:**
   - Email: ejemplo@correo.com
   - Nombre de usuario: (único, sin espacios)
   - Contraseña: (mínimo 6 caracteres)
   - Confirmar contraseña: (debe coincidir)

6. **Presiona "Registrarse"**

7. Si todo está correcto, serás redirigido automáticamente al Home

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Email already registered"
**Causa:** Ya existe un usuario con ese email  
**Solución:** Usa un email diferente o inicia sesión con ese email

### Error: "Username already taken"
**Causa:** Ya existe un usuario con ese nombre de usuario  
**Solución:** Elige un nombre de usuario diferente

### Error: "Las contraseñas no coinciden"
**Causa:** La contraseña y confirmación no son iguales  
**Solución:** Asegúrate de escribir la misma contraseña en ambos campos

### Error: "La contraseña debe tener al menos 6 caracteres"
**Causa:** Contraseña muy corta  
**Solución:** Usa una contraseña de 6 o más caracteres

### Error: "Por favor completa todos los campos"
**Causa:** Algún campo está vacío  
**Solución:** Llena todos los campos: email, username, password, confirmación

### Error de conexión o timeout
**Causa:** Problema de red o backend no responde  
**Solución:** 
1. Verifica que tengas conexión a internet
2. Espera unos segundos e intenta de nuevo
3. Reinicia la app

---

## 🧪 Cuentas de Prueba (Si necesitas probar sin registrarte)

Puedes usar estas credenciales para probar inmediatamente:

**Usuario 1:**
- Email: test@askworld.com
- Password: test123456

**Usuario 2:**
- Email: admin@askworld.com
- Password: admin123456

---

## 🔍 Verificar si el Registro Funcionó

Después de registrarte exitosamente, deberías:

1. ✅ Ver automáticamente la pantalla de **Home** (feed de preguntas)
2. ✅ Ver tu **nombre de usuario** en el encabezado: "Bienvenido, [tu_usuario]"
3. ✅ Poder navegar entre las tabs: Home, Buscar, Preguntar, Perfil
4. ✅ Ver tu información en la tab **Perfil**
5. ✅ Tu cuenta queda guardada en la base de datos MongoDB

---

## 🛠️ Si el Problema Persiste

### En el celular:

1. **Cierra completamente Expo Go**
2. **Vuelve a escanear el QR code**
3. **Espera a que compile completamente**
4. **Intenta registrarte de nuevo con un email/username diferente**

### Si ves un error específico:

El sistema ahora muestra mensajes de error más detallados. Por favor anota el mensaje exacto que aparece y compártelo para ayudarte mejor.

---

## 📊 Verificar en Backend

Para verificar que un usuario se registró correctamente, puedes revisar los logs del backend:

```bash
tail -f /var/log/supervisor/backend.out.log
```

Deberías ver algo como:
```
INFO: 10.64.130.173:60438 - "POST /api/auth/register HTTP/1.1" 200 OK
```

El código **200 OK** significa que el registro fue exitoso.

---

## 🎯 Flujo Correcto de Registro

```
1. Usuario abre app → Pantalla de Login

2. Usuario presiona "Regístrate"

3. Usuario llena formulario:
   ✓ Email válido
   ✓ Username único
   ✓ Password (6+ caracteres)
   ✓ Confirmación de password coincide

4. Usuario presiona "Registrarse"

5. Frontend detecta idioma del dispositivo (español/inglés/etc)

6. Frontend envía datos al backend

7. Backend:
   ✓ Valida que email y username sean únicos
   ✓ Hashea la contraseña con bcrypt
   ✓ Guarda usuario en MongoDB
   ✓ Genera JWT token
   ✓ Responde con token y datos del usuario

8. Frontend:
   ✓ Guarda token en storage del dispositivo
   ✓ Guarda información del usuario
   ✓ Redirige a Home

9. Usuario ya está autenticado y puede usar la app ✅
```

---

## ✅ Cambios Realizados

### 1. Mejorado `/app/frontend/utils/storage.ts`
- Importación condicional de AsyncStorage (solo en móvil)
- Manejo de errores robusto para web y móvil
- Try-catch en todas las operaciones

### 2. Mejorado `/app/frontend/app/(auth)/register.tsx`
- Mensajes de error más descriptivos
- Console.log para debugging
- Mejor manejo de errores del servidor

### 3. Reinicio de servicios
- Limpiado caché de Metro
- Reiniciado Expo para aplicar cambios

---

## 🎉 Estado Actual

- ✅ Error de AsyncStorage CORREGIDO
- ✅ Storage funciona en web y móvil
- ✅ Mensajes de error mejorados
- ✅ Backend funcionando correctamente (200 OK en registros)
- ✅ App lista para uso

**Ahora puedes registrarte sin problemas desde el celular.**
