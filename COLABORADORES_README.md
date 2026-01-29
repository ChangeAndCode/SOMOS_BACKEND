# Funcionalidad de Gestión de Colaboradores

> 📅 **Última actualización:** 29 de enero de 2026  
> 👤 **Desarrollador:** [Tu nombre]  
> 📋 **Estado:** Funcional (usando credenciales temporales de Cloudinary)

## ¿Qué se implementó?

Se creó un **sistema completo para administrar los logos de empresas y organizaciones colaboradoras** que aparecen en la sección "Orgullosos colaboradores de:" en la página principal del sitio web.

Antes, estos logos estaban fijos en el código (archivo `home.json`). Ahora se pueden **agregar, editar y eliminar** fácilmente desde el panel de administración, sin necesidad de tocar código.

## ¿Qué puede hacer el usuario?

### Desde el Panel de Administración (`/admin/colaboradores`):
1. **Ver todos los colaboradores** en una tabla con sus logos
2. **Agregar nuevos colaboradores** subiendo su logo y nombre
3. **Editar colaboradores existentes** (cambiar nombre, logo o posición)
4. **Eliminar colaboradores** que ya no apliquen
5. **Controlar el orden** en que aparecen (o dejar que el sistema lo asigne automáticamente)

### En la Página Principal:
- Los logos se cargan automáticamente desde la base de datos
- Si hay algún problema con el servidor, muestra los logos del archivo `home.json` como respaldo
- Mantiene la animación de marquee que ya existía

## Características Técnicas

- ✅ Sistema completo de administración (crear, leer, actualizar, eliminar)
- ✅ Subida de imágenes a Cloudinary (servicio de almacenamiento en la nube)
- ✅ Orden automático: si no eliges un número, el sistema asigna el siguiente disponible
- ✅ Integración con la página principal (carga automática desde la API)
- ✅ Sistema de respaldo: si falla la API, usa los datos del `home.json`
- ✅ Adaptación a tema claro/oscuro en el panel de administración
- ✅ Instrucciones claras para el usuario en cada campo del formulario
- ✅ Validación de formatos de imagen (solo acepta JPG, PNG, WEBP)

## Cómo Funciona (Detalles Técnicos)

### Backend (Servidor)
El backend es como el "cerebro" del sistema. Tiene:

**Base de datos (MongoDB):**
- Guarda la información de cada colaborador: nombre, logo, orden
- Estructura simple:
  ```javascript
  {
    name: "COPREV",
    logo: "https://cloudinary.com/...logo.png",
    order: 1
  }
  ```

**API REST (rutas para comunicarse):**
- `GET /api/collaborators` → Obtiene todos los colaboradores ordenados
- `POST /api/collaborators` → Crea un nuevo colaborador (requiere estar autenticado)
- `PUT /api/collaborators/:id` → Actualiza un colaborador existente
- `DELETE /api/collaborators/:id` → Elimina un colaborador

**Cloudinary (almacenamiento de imágenes):**
- Servicio en la nube donde se guardan los logos
- Cuando subes una imagen, se envía a Cloudinary y te devuelve una URL
- Esa URL es la que se guarda en la base de datos
- Al eliminar un colaborador, también se elimina su imagen de Cloudinary

### Frontend (Interfaz)

**Panel de Administración (`/admin/colaboradores`):**
- Página donde el administrador puede gestionar colaboradores
- Tiene un formulario con 3 campos:
  1. **Nombre**: Texto simple (ej: "COPREV")
  2. **Orden**: Número opcional (1, 2, 3...) - si no lo pones, el sistema asigna automáticamente
  3. **Imagen**: Sube el logo (JPG, PNG o WEBP)
- Muestra una tabla con todos los colaboradores y sus logos
- Botones para editar o eliminar

**Página Principal (Home):**
- Carga automáticamente los colaboradores desde el servidor
- Si el servidor no responde, usa los datos del archivo `home.json` como respaldo
- Muestra los logos en un carrusel animado
- Todo es automático, no requiere recargar la página

### ¿Qué pasa cuando agregas un colaborador?

1. **Completas el formulario** en el panel de administración
2. **Subes la imagen** → se envía a Cloudinary
3. **Cloudinary devuelve una URL** de la imagen guardada
4. **El servidor guarda en MongoDB**: nombre, URL de la imagen, orden
5. **La página principal se actualiza automáticamente** al recargar

### Sistema de Orden Automático

Si dejas el campo "Orden" vacío:
- El sistema busca el número más alto que existe (ej: 3)
- Le suma 1 (3 + 1 = 4)
- Asigna ese nuevo número (4) al colaborador
- **Resultado:** El nuevo colaborador aparece al final del carrusel

Esto significa que **no tienes que preocuparte por los números**, solo déjalo vacío y el sistema lo hace por ti.

## ¿Cómo Empezar a Usarlo?

### Paso 1: Migrar datos existentes (solo una vez)
Si ya tienes colaboradores en el archivo `home.json`, corre este comando para pasarlos a la base de datos:

```bash
cd SOMOS_BACKEND
node seedCollaborators.js
```

Esto toma todos los logos que ya estaban en el código y los guarda en MongoDB.

### Paso 2: Iniciar el sistema

**Backend (Servidor):**
```bash
cd SOMOS_BACKEND
node index.js
```
Esto inicia el servidor en `http://localhost:3000`

**Frontend (Página web):**
```bash
cd SOMOS_FRONTEND
npm run dev
```
Esto inicia la página en `http://localhost:5173`

### Paso 3: Usar el panel de administración

1. **Entrar al sistema:**
   - Ve a `http://localhost:5173/#/login`
   - Inicia sesión con tu usuario administrador

2. **Ir a Colaboradores:**
   - En el menú lateral izquierdo, haz clic en "Colaboradores"

3. **Agregar un colaborador:**
   - Haz clic en el botón "+ Agregar"
   - Escribe el nombre de la empresa
   - Sube su logo
   - (Opcional) Indica el orden, o déjalo vacío para agregarlo al final
   - Guarda

4. **Ver cambios:**
   - Ve a la página principal
   - Los logos aparecerán en el carrusel automáticamente

## Problemas Comunes y Soluciones

### ❌ No aparecen los colaboradores en la página principal

**Posibles causas:**
- El servidor (backend) no está corriendo
- No hay colaboradores en la base de datos
- Hay un error de conexión

**Soluciones:**
1. Verifica que el backend esté corriendo (debe decir "✅ Servidor en http://localhost:3000")
2. Ve al panel de administración y verifica que existan colaboradores
3. Revisa la consola del navegador (F12) para ver errores
4. **Tranquilo:** Si hay error, el sistema mostrará automáticamente los logos del archivo `home.json`

### ❌ No puedo subir imágenes (Error de Cloudinary)

**Posibles causas:**
- Las credenciales de Cloudinary están mal configuradas
- La cuenta de Cloudinary está deshabilitada
- El formato de imagen no es compatible

**Soluciones:**
1. **Verifica las credenciales** en el archivo `.env` del backend:
   ```
   CLOUDINARY_CLOUD_NAME=tu_cloud_name_real
   CLOUDINARY_API_KEY=tu_api_key_real
   CLOUDINARY_API_SECRET=tu_api_secret_real
   ```
2. Si no tienes cuenta de Cloudinary, crea una gratis en https://cloudinary.com
3. Reinicia el backend después de cambiar las credenciales
4. Solo usa imágenes JPG, PNG o WEBP

### ❌ No veo el menú "Colaboradores" en el panel

**Soluciones:**
1. Asegúrate de haber iniciado sesión como administrador
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Reinicia el servidor frontend (`npm run dev`)

### ❌ El orden de los colaboradores no es el correcto

**Cómo funciona el orden:**
- **Número más bajo = aparece primero** (1, 2, 3...)
- Si dejas el campo vacío, se agrega al final automáticamente

**Para reorganizar:**
1. Edita cada colaborador
2. Asigna nuevos números de orden
3. Guarda los cambios
4. Refresca la página principal

**Consejo:** Usa números con espacio entre ellos (10, 20, 30...) para facilitar futuras inserciones

## Archivos Importantes del Sistema

### Backend (SOMOS_BACKEND)

**Nuevos archivos creados:**
- `models/Collaborator.js` - Define cómo se guarda un colaborador en la base de datos
- `controllers/collaborator.js` - Lógica para crear, editar, eliminar colaboradores + asignación automática de orden
- `routes/collaborator.js` - Rutas de la API para que el frontend pueda comunicarse
- `seedCollaborators.js` - Script para migrar datos del `home.json` a MongoDB (usar solo una vez)
- `cleanCollaborators.js` - Script para limpiar la base de datos si es necesario

**Archivos modificados:**
- `index.js` - Se agregó la ruta `/api/collaborators`
- `utils/validation.js` - Configuración de validación para el campo de orden

### Frontend (SOMOS_FRONTEND)

**Nuevos archivos creados:**
- `src/pages/Admin/Collaborators.jsx` - Panel de administración completo con formulario y tabla

**Archivos modificados:**
- `src/pages/Home/components/colaboration.jsx` - Ahora carga desde la API con respaldo al JSON
- `src/app.jsx` - Se agregó la ruta `/admin/colaboradores`
- `src/components/sidebar/Sidebar.jsx` - Se agregó el enlace "Colaboradores" con icono
- `src/components/DataGridTable/DataGridTable.jsx` - Soporte para mostrar imágenes
- `src/components/Form/Form.jsx` - Soporte para texto de ayuda personalizado en imágenes

## Configuración Necesaria (Variables de Entorno)

El archivo `.env` del backend debe tener:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/somos_db
# O para MongoDB Atlas: mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/TU_DATABASE

# Cloudinary (almacenamiento de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Autenticación
JWT_SECRET=tu_clave_secreta

# Email (opcional, para notificaciones)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_app_password

# Supabase (para documentos PDF)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_supabase_key
```

**Importante:** Si cambias algo en el `.env`, debes **reiniciar el backend** para que tome los cambios.

## Estado del Sistema

### ✅ Sistema Completamente Funcional

**Todas las funcionalidades están operativas:**
- ✅ Sistema completo de administración de colaboradores
- ✅ Integración con Cloudinary para imágenes
- ✅ Subida y gestión de imágenes funcionando correctamente
- ✅ Panel de administración funcional
- ✅ Carga dinámica en la página principal
- ✅ Sistema de respaldo (fallback) al JSON
- ✅ Asignación automática de orden
- ✅ Textos de ayuda para el usuario
- ✅ Validación de formatos de imagen
- ✅ Scripts de migración de datos
- ✅ Documentación completa

### ⚠️ Nota Importante sobre Cloudinary

**Estado actual:** El sistema funciona correctamente usando credenciales temporales de Cloudinary (cuenta personal).

**Para producción:**
- Las credenciales originales del proyecto están deshabilitadas (`cloud_name is disabled`)
- Se necesita obtener credenciales definitivas de Cloudinary para el proyecto
- Opciones:
  1. Contactar al dueño de la cuenta original para reactivarla
  2. Crear una nueva cuenta de Cloudinary para el proyecto (plan gratuito disponible en https://cloudinary.com)
  3. Actualizar el `.env` con las nuevas credenciales
  4. Reiniciar el backend después del cambio

**Mientras tanto:** El sistema funciona completamente con las credenciales temporales.
