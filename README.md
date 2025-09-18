# SOMOS Backend - API REST

API backend en Node.js y Express para la gestión de proyectos, programas, eventos, testimonios, notas, transparencia y voluntariado de la organización SOMOS.

## 🚀 Demo en Vivo

**URL del Backend:** _Configura tu propio despliegue en Vercel, Railway, Render, etc._

## Características

- **Autenticación JWT**: Usuarios y administradores con roles diferenciados
- **Gestión de entidades**: Proyectos, programas, eventos, notas, testimonios, transparencia y voluntarios
- **Carga de archivos**: Imágenes (Cloudinary) y documentos (Supabase Storage)
- **Sistema de roles**: Acceso restringido para usuarios y admins
- **API RESTful**: Endpoints organizados por entidad
- **Validación y normalización**: Datos limpios y consistentes en todos los endpoints
- **Protección CORS**: Permite solo orígenes autorizados
- **Envío de emails**: Notificaciones automáticas para formularios de voluntariado

## Sistema de Roles

- **Usuario**: Acceso
- **Administrador**: Acceso total a todas las entidades y acciones

## Instalación Local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/SOMOS_BACKEND.git
   cd SOMOS_BACKEND
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Configura el archivo .env (usa .env.example como referencia).

4. Ejecuta en modo desarrollo:
   ```bash
   node index.js
   ```

## Estructura del proyecto

controllers/ # Lógica de negocio por entidad
middlewares/ # Autenticación, autorización, manejo de archivos
models/ # Esquemas de Mongoose para MongoDB
routes/ # Endpoints organizados por entidad
services/ # Integraciones externas (Cloudinary, Supabase)
utils/ # Utilidades de validación y normalización
db.js # Conexión a MongoDB
index.js # Punto de entrada principal
Dockerfile # Configuración para despliegue en Docker
.env.example # Variables de entorno requeridas

## Entidades y Enpoints principales

- Usuarios: /api/users
- Proyectos: /api/projects
- Programas: /api/programs
- Eventos: /api/events
- Notas: /api/notes
- Testimonios: /api/testimonies
- Transparencia: /api/transparency
- Voluntariado (Súmate): /api/sumate
- Autenticación: /api/auth

## Tecnologías

- Node.js 20
- Express 5
- MongoDB + Mongoose
- JWT para autenticación
- Cloudinary: Imágenes
- Supabase Storage: Documentos
- Multer: Manejo de archivos
- Nodemailer: Envío de emails
