# ServiEduca - Internships and Professional Practices in Panama

A web platform that connects Panamanian students with internship and professional practice opportunities in companies and organizations.

## Features

- **Home page** with information about internships in Panama
- **Dual user system**: Students and Businesses
- **Dashboard** for each user type
- **One-click application system**
- **Complete internship management** (create, edit, delete)
- **CV upload** and complete profiles
- **Information about requirements and benefits** of internships

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

## Installation

1. Clone the repository
```bash
git clone https://github.com/fbordon13/Educad.git
cd ServiEduca
```

2. Install all dependencies
```bash
npm run install-all
```

3. Configure environment variables
```bash
# In backend/.env
MONGODB_URI=mongodb://localhost:27017/servieduca
JWT_SECRET=your-jwt-secret-here
PORT=5000

# In frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Run the project in development mode
```bash
npm run dev
```

This will start both the backend server (port 5000) and the frontend (port 3000).

## Estructura del Proyecto

```
ServiEduca/
├── frontend/          # Aplicación React
├── backend/           # API Node.js/Express
├── package.json       # Scripts principales
└── README.md
```

## Features

### For Students
- Registration and login
- Complete profile with CV
- Search and apply for internships
- View application history
- Personal dashboard
- Information about requirements and benefits

### For Businesses
- Registration and login
- Post internship opportunities
- Manage offers (edit/delete)
- Review received applications
- Business dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current profile

### Internships
- `GET /api/jobs` - List all internships
- `POST /api/jobs` - Create new internship (businesses only)
- `GET /api/jobs/:id` - Get specific internship
- `PUT /api/jobs/:id` - Update internship (owner only)
- `DELETE /api/jobs/:id` - Delete internship (owner only)

### Applications
- `POST /api/applications` - Apply for internship
- `GET /api/applications/job/:jobId` - View applications for an internship
- `GET /api/applications/user` - View current user's applications
