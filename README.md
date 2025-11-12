# ServiEduca - Pasantías y Prácticas Profesionales en Panamá

Una plataforma web que conecta estudiantes panameños con oportunidades de pasantías y prácticas profesionales en empresas y organizaciones.

## Características

- **Página principal** con información sobre pasantías en Panamá
- **Sistema de usuarios dual**: Estudiantes y Empresas
- **Panel de control** para cada tipo de usuario
- **Sistema de aplicaciones** con un clic
- **Gestión completa de pasantías** (crear, editar, eliminar)
- **Subida de CV** y perfiles completos
- **Información sobre requisitos y beneficios** de las pasantías

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
git clone https://github.com/fbordon13/Educad.git
cd ServiEduca
```

2. Instala todas las dependencias
```bash
npm run install-all
```

3. Configura las variables de entorno
```bash
# En backend/.env
MONGODB_URI=mongodb://localhost:27017/servieduca
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
ServiEduca/
├── frontend/          # Aplicación React
├── backend/           # API Node.js/Express
├── package.json       # Scripts principales
└── README.md
```

## Funcionalidades

### Para Estudiantes
- Registro e inicio de sesión
- Completar perfil con CV
- Buscar y aplicar a pasantías
- Ver historial de aplicaciones
- Panel de control personal
- Información sobre requisitos y beneficios

### Para Empresas
- Registro e inicio de sesión
- Publicar oportunidades de pasantías
- Gestionar ofertas (editar/eliminar)
- Revisar aplicaciones recibidas
- Panel de control empresarial

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil actual

### Pasantías
- `GET /api/jobs` - Listar todas las pasantías
- `POST /api/jobs` - Crear nueva pasantía (solo empresas)
- `GET /api/jobs/:id` - Obtener pasantía específica
- `PUT /api/jobs/:id` - Actualizar pasantía (solo propietario)
- `DELETE /api/jobs/:id` - Eliminar pasantía (solo propietario)

### Aplicaciones
- `POST /api/applications` - Aplicar a pasantía
- `GET /api/applications/job/:jobId` - Ver aplicaciones de una pasantía
- `GET /api/applications/user` - Ver aplicaciones del usuario actual
