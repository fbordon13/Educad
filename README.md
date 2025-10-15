# Bolsa de Trabajo Estudiantil

Una plataforma web que conecta estudiantes con negocios locales para oportunidades de trabajo de medio tiempo.

## Características

- **Página principal** con listado de vacantes y filtros de búsqueda
- **Sistema de usuarios dual**: Estudiantes y Negocios
- **Panel de control** para cada tipo de usuario
- **Sistema de aplicaciones** con un clic
- **Gestión completa de vacantes** (crear, editar, eliminar)
- **Subida de CV** y perfiles completos
- **Notificaciones** en tiempo real

## Tecnologías

### Frontend
- React 18
- TailwindCSS
- React Router
- Axios
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer (para archivos)

## Instalación

1. Clona el repositorio
```bash
git clone <repository-url>
cd bolsa-trabajo-estudiantil
```

2. Instala todas las dependencias
```bash
npm run install-all
```

3. Configura las variables de entorno
```bash
# En backend/.env
MONGODB_URI=mongodb://localhost:27017/bolsa-trabajo-estudiantil
JWT_SECRET=tu-jwt-secret-aqui
PORT=5000

# En frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Ejecuta el proyecto en modo desarrollo
```bash
npm run dev
```

Esto iniciará tanto el servidor backend (puerto 5000) como el frontend (puerto 3000).

## Estructura del Proyecto

```
bolsa-trabajo-estudiantil/
├── frontend/          # Aplicación React
├── backend/           # API Node.js/Express
├── package.json       # Scripts principales
└── README.md
```

## Funcionalidades

### Para Estudiantes
- Registro e inicio de sesión
- Completar perfil con CV
- Buscar y aplicar a vacantes
- Ver historial de aplicaciones
- Panel de control personal

### Para Negocios
- Registro e inicio de sesión
- Publicar vacantes de empleo
- Gestionar ofertas (editar/eliminar)
- Revisar aplicaciones recibidas
- Panel de control empresarial

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil actual

### Vacantes
- `GET /api/jobs` - Listar todas las vacantes
- `POST /api/jobs` - Crear nueva vacante (solo negocios)
- `GET /api/jobs/:id` - Obtener vacante específica
- `PUT /api/jobs/:id` - Actualizar vacante (solo propietario)
- `DELETE /api/jobs/:id` - Eliminar vacante (solo propietario)

### Aplicaciones
- `POST /api/applications` - Aplicar a vacante
- `GET /api/applications/job/:jobId` - Ver aplicaciones de una vacante
- `GET /api/applications/user` - Ver aplicaciones del usuario actual
