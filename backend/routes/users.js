const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/cvs/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `cv-${req.user._id}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir archivos PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  },
  fileFilter: fileFilter
});

// @route   POST /api/users/upload-cv
// @desc    Subir CV (solo estudiantes)
// @access  Private (Student)
router.post('/upload-cv', authenticateToken, requireRole('student'), upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Eliminar CV anterior si existe
    const user = await User.findById(req.user._id);
    if (user.studentInfo.cvPath && fs.existsSync(user.studentInfo.cvPath)) {
      fs.unlinkSync(user.studentInfo.cvPath);
    }

    // Actualizar ruta del CV en el usuario
    const cvPath = req.file.path;
    await User.findByIdAndUpdate(req.user._id, {
      'studentInfo.cvPath': cvPath
    });

    res.json({
      message: 'CV subido exitosamente',
      cvPath: cvPath,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Error subiendo CV:', error);
    
    // Eliminar archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/cv/:filename
// @desc    Descargar CV
// @access  Private
router.get('/cv/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const cvPath = path.join('uploads/cvs', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({
        message: 'Archivo no encontrado'
      });
    }

    // Verificar permisos de acceso al CV
    const user = await User.findById(req.user._id);
    
    // Solo el propietario del CV o un negocio puede acceder
    if (user.role === 'student') {
      // Verificar que es el CV del usuario actual
      if (!user.studentInfo.cvPath.includes(filename)) {
        return res.status(403).json({
          message: 'No tienes permisos para acceder a este archivo'
        });
      }
    } else if (user.role === 'business') {
      // Los negocios pueden acceder a CVs de aplicantes
      // Verificar que el usuario aplicó a una vacante de este negocio
      const Application = require('../models/Application');
      const hasApplication = await Application.findOne({
        company: req.user._id,
        applicant: { $exists: true }
      }).populate('applicant');

      if (!hasApplication) {
        return res.status(403).json({
          message: 'No tienes permisos para acceder a este archivo'
        });
      }
    }

    res.download(cvPath, filename);

  } catch (error) {
    console.error('Error descargando CV:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/users/cv
// @desc    Eliminar CV (solo estudiantes)
// @access  Private (Student)
router.delete('/cv', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.studentInfo.cvPath) {
      return res.status(404).json({
        message: 'No hay CV para eliminar'
      });
    }

    // Eliminar archivo físico
    if (fs.existsSync(user.studentInfo.cvPath)) {
      fs.unlinkSync(user.studentInfo.cvPath);
    }

    // Actualizar usuario
    await User.findByIdAndUpdate(req.user._id, {
      'studentInfo.cvPath': ''
    });

    res.json({
      message: 'CV eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando CV:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Obtener perfil público de usuario
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error obteniendo perfil público:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/settings
// @desc    Actualizar configuración de cuenta
// @access  Private
router.put('/settings', [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('Las notificaciones deben ser un valor booleano')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const updateData = {};
    
    // Solo permitir actualizar email si no existe otro usuario con ese email
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Ya existe una cuenta con este email'
        });
      }
      
      updateData.email = req.body.email;
    }

    if (req.body.notifications !== undefined) {
      updateData.notifications = req.body.notifications;
    }

    if (req.body.isActive !== undefined && req.user.role === 'business') {
      updateData.isActive = req.body.isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Configuración actualizada exitosamente',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/users/deactivate
// @desc    Desactivar cuenta
// @access  Private
router.post('/deactivate', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isActive: false
    });

    res.json({
      message: 'Cuenta desactivada exitosamente'
    });

  } catch (error) {
    console.error('Error desactivando cuenta:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/search
// @desc    Buscar usuarios (para negocios)
// @access  Private (Business)
router.get('/search', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { q, career, skills, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      role: 'student',
      isActive: true
    };

    // Búsqueda por texto
    if (q) {
      query.$or = [
        { 'studentInfo.firstName': new RegExp(q, 'i') },
        { 'studentInfo.lastName': new RegExp(q, 'i') },
        { 'studentInfo.career': new RegExp(q, 'i') },
        { 'studentInfo.university': new RegExp(q, 'i') }
      ];
    }

    // Filtro por carrera
    if (career) {
      query['studentInfo.career'] = new RegExp(career, 'i');
    }

    // Filtro por habilidades
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query['studentInfo.skills'] = { $in: skillsArray };
    }

    const users = await User.find(query)
      .select('studentInfo firstName lastName career university skills availability createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers
      }
    });

  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Obtener estadísticas para el dashboard
// @access  Private
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};
    
    if (req.user.role === 'student') {
      const Application = require('../models/Application');
      
      stats.applications = await Application.getStats(req.user._id, 'student');
      stats.profileComplete = isProfileComplete(req.user);
      
      // Trabajos recomendados basados en habilidades
      const Job = require('../models/Job');
      const userSkills = req.user.studentInfo.skills || [];
      
      if (userSkills.length > 0) {
        stats.recommendedJobs = await Job.find({
          status: 'active',
          allowApplications: true,
          $or: [
            { tags: { $in: userSkills } },
            { category: { $in: getRecommendedCategories(userSkills) } }
          ],
          $or: [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: { $gt: new Date() } }
          ]
        })
        .populate('company', 'businessInfo.companyName businessInfo.verified')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(5)
        .select('title location employmentType category salary createdAt isFeatured');
      }
      
    } else if (req.user.role === 'business') {
      const Job = require('../models/Job');
      const Application = require('../models/Application');
      
      stats.jobs = await Job.aggregate([
        { $match: { company: req.user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalViews: { $sum: '$views' }
          }
        }
      ]);
      
      stats.applications = await Application.getStats(req.user._id, 'business');
      stats.profileComplete = isProfileComplete(req.user);
      
      // Aplicaciones recientes
      stats.recentApplications = await Application.getRecentApplications(req.user._id, 'business', 5);
    }

    res.json({ stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// Funciones auxiliares
const isProfileComplete = (user) => {
  if (user.role === 'student') {
    return !!(user.studentInfo.firstName && 
              user.studentInfo.lastName && 
              user.studentInfo.age && 
              user.studentInfo.career);
  } else if (user.role === 'business') {
    return !!(user.businessInfo.companyName && 
              user.businessInfo.contactName && 
              user.businessInfo.phone && 
              user.businessInfo.address && 
              user.businessInfo.city);
  }
  return false;
};

const getRecommendedCategories = (skills) => {
  const categoryMapping = {
    'javascript': 'technology',
    'python': 'technology',
    'react': 'technology',
    'node': 'technology',
    'programming': 'technology',
    'design': 'marketing',
    'photoshop': 'marketing',
    'marketing': 'marketing',
    'sales': 'sales',
    'customer service': 'customer-service',
    'teaching': 'education',
    'tutoring': 'tutoring',
    'cooking': 'food-service',
    'food': 'food-service'
  };
  
  return skills
    .map(skill => categoryMapping[skill.toLowerCase()])
    .filter(category => category);
};

module.exports = router;
