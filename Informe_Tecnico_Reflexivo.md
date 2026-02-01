# Informe Técnico-Reflexivo: Implementación de Onboarding y Validaciones Complejas en Aplicación Móvil de Autenticación

## 1. Introducción

El presente informe documenta el desarrollo e implementación de un flujo de Onboarding y un sistema de registro con validaciones complejas para una aplicación móvil de autenticación, utilizando React Native con Expo como framework de desarrollo y Yup como librería de validación de esquemas. El objetivo principal de este trabajo fue garantizar la integridad de los datos ingresados por los usuarios mediante validaciones dinámicas que incluyen verificaciones por campo, validaciones cruzadas entre campos y validaciones asíncronas para verificar la disponibilidad del correo electrónico en tiempo real.

La importancia de un onboarding efectivo radica en su capacidad para introducir al usuario a la aplicación de manera progresiva, estableciendo expectativas claras sobre las funcionalidades y beneficios que encontrará. Por otro lado, las validaciones robustas en los formularios de registro son fundamentales para prevenir errores de datos, mejorar la experiencia del usuario y proteger la integridad de la información almacenada en la base de datos. Este proyecto se desarrolló como parte de la asignatura de Implementación de Interfaces de Usuario, enfocándose particularmente en las buenas prácticas de UX y accesibilidad según las pautas WCAG 2.2.

Las tecnologías principales utilizadas incluyen React Native 0.72 con Expo 49, React Navigation para la navegación entre pantallas, Yup para la definición de esquemas de validación, AsyncStorage para la persistencia de datos locales y Axios para las comunicaciones con el backend. La arquitectura del proyecto sigue el patrón de Context API para la gestión del estado global de autenticación, permitiendo una separación clara entre la lógica de negocio y la presentación de componentes de interfaz.

## 2. Desafíos Técnicos y Soluciones Implementadas

### 2.1 Gestión del Estado del Formulario

Uno de los primeros desafíos técnicos enfrentados fue la gestión del estado del formulario de registro. Inicialmente, se consideró utilizar múltiples estados individuales para cada campo mediante useState, pero esta aproximación presentó limitaciones significativas cuando se intentó implementar validaciones en tiempo real y la acumulación de errores de múltiples campos. La solución final consistió en mantener un objeto de estado único que contiene todos los datos del formulario, complementado con un objeto separado para almacenar los errores de validación y otro para rastrear qué campos han sido tocados por el usuario.

Esta estructura permite validar campos específicos de manera independiente cuando el usuario los modifica, mientras mantiene la capacidad de validar todo el formulario al momento del envío. Adicionalmente, el uso de referencias (useRef) para cada campo de entrada posibilita el movimiento automático del foco al primer campo con error cuando el usuario intenta enviar un formulario inválido, mejorando significativamente la experiencia de corrección de errores.

### 2.2 Implementación de Validaciones Asíncronas con Debounce

La validación asíncrona del correo electrónico presentó un desafío particular debido a la necesidad de consultar la disponibilidad del email en el servidor sin generar una sobrecarga de solicitudes. Cada vez que el usuario escribe un carácter, el sistema podría teoricamente realizar una solicitud al servidor, lo cual sería ineficiente y podría causar problemas de rendimiento tanto en el cliente como en el servidor. La solución implementada consistió en crear una función debounce que retrasa la ejecución de la validación hasta que el usuario deja de escribir durante 500 milisegundos.

La función debounce utiliza un mapa de timeouts para almacenar identificadores únicos de cada llamada, permitiendo limpiar timeouts pendientes cuando el componente se desmonta o cuando se genera una nueva llamada antes de que la anterior se ejecute. Esta implementación garantiza que solo se realice una verificación en el servidor cuando el usuario ha pausado su escritura, reduciendo significativamente el número de solicitudes de red y mejorando la responsividad de la interfaz.

```javascript
const debounce = (func, delay = 500) => {
  return (...args) => {
    const key = `${func.name}_${Date.now()}`;
    if (timeoutCache[key]) {
      clearTimeout(timeoutCache[key]);
    }
    timeoutCache[key] = setTimeout(() => {
      func.apply(this, args);
      delete timeoutCache[key];
    }, delay);
  };
};
```

### 2.3 Validaciones de Complejidad de Contraseña

Las validaciones de contraseña requeridas por el proyecto incluían verificar la presencia de al menos una letra mayúscula, una letra minúscula, un número y un carácter especial. Yup permite definir estas validaciones mediante expresiones regulares, pero la implementación inicial mostraba todos los errores simultáneamente cuando la contraseña estaba vacía, lo cual resultaba confuso para el usuario. La solución consistió en mostrar únicamente los requisitos que aún no se han cumplido, utilizando un componente visual de indicadores que se actualiza en tiempo real conforme el usuario escribe.

Este componente de indicadores de requisitos proporciona feedback inmediato y accionable, permitiendo al usuario comprender exactamente qué le falta a su contraseña para cumplir con los criterios de seguridad establecidos. La combinación de validación en tiempo real con feedback visual progresivo reduce significativamente la frustración del usuario al crear su contraseña.

### 2.4 Navegación y Persistencia del Onboarding

La implementación del flujo de onboarding requirió considerar la persistencia del estado para asegurar que el onboarding solo se muestre la primera vez que el usuario abre la aplicación. Utilizando AsyncStorage, el sistema guarda una bandera cuando el usuario completa o salta el onboarding, verificando este valor al inicio de la aplicación para determinar si debe mostrar las pantallas de bienvenida o redirig directamente a la pantalla de autenticación.

La navegación entre las pantallas del onboarding se implementó utilizando un FlatList con paginación horizontal, permitiendo deslizar entre las diferentes diapositivas de manera fluida. El indicador de puntos en la parte inferior proporciona contexto visual sobre la posición actual dentro del flujo, mientras que los botones de navegación permiten avanzar manualmente o saltar el proceso completo.

## 3. Reflexión sobre UX, Feedback y Accesibilidad

### 3.1 Diseño de Feedback Accesible

El diseño del sistema de feedback se fundamenta en el principio de que la información de error no debe depender exclusivamente del color, considerando usuarios con daltonismo o deficiencias en la percepción del color. Por esta razón, cada mensaje de error está acompañado de un icono de advertencia (⚠️) y el campo de entrada cambia no solo su borde a color rojo, sino que también modifica su fondo a un tono rojizo claro, proporcionando múltiples indicadores visuales del estado de error.

Los mensajes de error fueron redactados siguiendo el principio de accionabilidad, indicando no solo qué salió mal sino también cómo corregirlo. Por ejemplo, en lugar de mostrar "Contraseña inválida", el sistema muestra mensajes específicos como "Debe contener al menos una mayúscula" o "La contraseña debe tener al menos 8 caracteres". Esta aproximación reduce la carga cognitiva del usuario y facilita la corrección de errores de manera autónoma.

### 3.2 Gestión del Foco para Reducción de Fricción

La implementación de movimiento automático del foco al primer campo con error cuando el usuario intenta enviar un formulario inválido representa una mejora significativa en la experiencia de usuario. En lugar de obligar al usuario a buscar visualmente dónde están los errores, el sistema lo lleva directamente al primer problema, reduciendo el tiempo y esfuerzo necesarios para corregir el formulario.

Esta funcionalidad se implementa utilizando las referencias de los campos de entrada y el método focus() de React Native. Cuando la validación del formulario detecta errores, el esquema Yup proporciona el path del primer campo inválido, permitiendo dirigir el foco a la referencia correspondiente. Adicionalmente, se configuraron las acciones del teclado (returnKeyType) para permitir la navegación entre campos mediante la tecla "siguiente", manteniendo un flujo de entrada de datos fluido y eficiente.

### 3.3 Consideraciones de Accesibilidad

Las implementación de accesibilidad siguió las pautas WCAG 2.2, incorporando etiquetas de accesibilidad (accessibilityLabel) en todos los elementos interactivos, roles semánticos apropiados (button, header, alert) y estados de accesibilidad que indican campos inválidos. Los mensajes de error utilizan accessibilityRole="alert" con accessibilityLiveRegion="polite" para que los lectores de pantalla anuncien los errores automáticamente cuando aparecen.

El contraste de color del texto de error fue verificado para cumplir con el ratio mínimo de 4.5:1 exigido por las pautas WCAG nivel AA. Los indicadores de requisitos de contraseña utilizan tanto iconos (círculos vacíos que se llenan con marcas de verificación) como texto y colores, proporcionando múltiples vías de comprensión para usuarios con diferentes necesidades.

## 4. Conclusiones y Lecciones Aprendidas

La implementación de este proyecto permitió comprender la importancia de una arquitectura bien estructurada para el manejo de formularios complejos en aplicaciones móviles. La separación entre la definición de esquemas de validación, la lógica dedebounce para validaciones asíncronas y los componentes de presentación facilita el mantenimiento y la escalabilidad del código. La utilización de Yup como librería de validación centralizada permite definir reglas complejas de manera declarativa, mejorando la legibilidad del código y reduciendo la probabilidad de errores.

El desarrollo del onboarding demostró que la primera impresión del usuario es crucial para la retención y el engagement. Un onboarding bien diseñado que comunica claramente el valor de la aplicación mientras solicita los permisos necesarios de manera progresiva tiene mayor probabilidad de conversión que uno que solicita todo simultáneamente al inicio. La persistencia del estado del onboarding mediante AsyncStorage asegura que esta experiencia positiva solo se proporcione una vez, evitando la repetición innecesaria en usos posteriores de la aplicación.

Las validaciones asíncronas con debounce representan una técnica fundamental para aplicaciones que requieren verificación de datos uniqueness contra un servidor. El patrón de debounce no solo mejora el rendimiento de la aplicación, sino que también reduce la carga en el servidor backend al evitar solicitudes innecesarias durante la escritura del usuario. Esta técnica es aplicable a múltiples escenarios más allá de la validación de emails, incluyendo búsqueda en tiempo real, autocompletado y sincronización de datos.

Como mejoras futuras, se propone la implementación de animaciones más fluidas utilizando React Native Reanimated para las transiciones entre pantallas del onboarding, la adición de validación biométrica (huella dactilar o reconocimiento facial) como método alternativo de registro, y la internacionalización de los mensajes de error para soportar múltiples idiomas. Asimismo, sería beneficioso implementar pruebas unitarias y de integración para asegurar la correcta funcionamiento de las validaciones ante cambios futuros en los requisitos.

---

**Fecha de elaboración:** Febrero 2024  
**Curso:** Implementación de Interfaces de Usuario  
**Universidad:** Universidad Estatal Amazónica
