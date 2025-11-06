const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticateToken, requireRole, requireCompleteProfile } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Obtener todas las vacantes con filtros
// @access  Public
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().isIn([
    'technology', 'customer-service', 'retail', 'food-service',
    'marketing', 'sales', 'administration', 'education', 'healthcare',
    'tutoring', 'delivery', 'cleaning', 'security', 'other'
  ]),
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('employmentType').optional().isIn(['part-time', 'full-time', 'internship', 'contract', 'temporary']),
  query('remote').optional().isBoolean(),
  query('minSalary').optional().isNumeric(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parámetros de búsqueda inválidos',
        errors: errors.array()
      });
    }

    const {
      search,
      category,
      city,
      state,
      employmentType,
      remote,
      minSalary,
      page = 1,
      limit = 12
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (employmentType) filters.employmentType = employmentType;
    if (remote !== undefined) filters.remote = remote;
    if (minSalary) filters.minSalary = minSalary;

    // Búsqueda con paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.searchJobs(filters)
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total para paginación
    const totalJobs = await Job.countDocuments({
      status: 'active',
      allowApplications: true,
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: new Date() } }
      ]
    });

    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      jobs: jobs.map(job => job.getPublicInfo()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo trabajos:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/jobs/featured
// @desc    Obtener trabajos destacados
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({
      status: 'active',
      isFeatured: true,
      allowApplications: true,
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: new Date() } }
      ]
    })
    .populate('company', 'businessInfo.companyName businessInfo.verified')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({
      jobs: featuredJobs.map(job => job.getPublicInfo())
    });

  } catch (error) {
    console.error('Error obteniendo trabajos destacados:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/jobs/categories
// @desc    Obtener categorías disponibles con conteos
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.aggregate([
      {
        $match: {
          status: 'active',
          allowApplications: true,
          $or: [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: { $gt: new Date() } }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const categoryLabels = {
      'technology': 'Tecnología',
      'customer-service': 'Atención al Cliente',
      'retail': 'Ventas/Retail',
      'food-service': 'Servicios de Alimentación',
      'marketing': 'Marketing',
      'sales': 'Ventas',
      'administration': 'Administración',
      'education': 'Educación',
      'healthcare': 'Salud',
      'tutoring': 'Tutorías',
      'delivery': 'Reparto/Entrega',
      'cleaning': 'Limpieza',
      'security': 'Seguridad',
      'other': 'Otros'
    };

    const formattedCategories = categories.map(cat => ({
      value: cat._id,
      label: categoryLabels[cat._id] || cat._id,
      count: cat.count
    }));

    res.json({ categories: formattedCategories });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Obtener trabajo específico
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'businessInfo.companyName businessInfo.contactName businessInfo.phone businessInfo.email businessInfo.verified businessInfo.description businessInfo.website');

    if (!job) {
      return res.status(404).json({
        message: 'Trabajo no encontrado'
      });
    }

    // Incrementar vistas
    await job.incrementViews();

    // Verificar si el usuario actual ya aplicó (si está autenticado)
    let hasApplied = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const existingApplication = await Application.findOne({
          job: job._id,
          applicant: decoded.userId
        });
        
        hasApplied = !!existingApplication;
      } catch (error) {
        // Token inválido, continuar sin verificar aplicación
      }
    }

    res.json({
      job: job.getPublicInfo(),
      company: job.company,
      hasApplied
    });

  } catch (error) {
    console.error('Error obteniendo trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/jobs
// @desc    Crear nuevo trabajo (solo negocios)
// @access  Private (Business)
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('El título debe tener entre 5 y 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('La descripción debe tener entre 50 y 2000 caracteres'),
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un requerimiento'),
  body('category')
    .isIn([
      'technology', 'customer-service', 'retail', 'food-service',
      'marketing', 'sales', 'administration', 'education', 'healthcare',
      'tutoring', 'delivery', 'cleaning', 'security', 'other'
    ])
    .withMessage('Categoría inválida'),
  body('employmentType')
    .isIn(['part-time', 'full-time', 'internship', 'contract', 'temporary'])
    .withMessage('Tipo de empleo inválido'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('El estado es requerido')
], authenticateToken, requireRole('business'), requireCompleteProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      company: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    await job.populate('company', 'businessInfo.companyName businessInfo.verified');

    res.status(201).json({
      message: 'Trabajo creado exitosamente',
      job: job.getPublicInfo()
    });

  } catch (error) {
    console.error('Error creando trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Actualizar trabajo (solo el propietario)
// @access  Private (Business - Owner)
router.put('/:id', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: 'Trabajo no encontrado'
      });
    }

    // Verificar que el usuario es el propietario
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'No tienes permisos para editar este trabajo'
      });
    }

    // Actualizar trabajo
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'businessInfo.companyName businessInfo.verified');

    res.json({
      message: 'Trabajo actualizado exitosamente',
      job: updatedJob.getPublicInfo()
    });

  } catch (error) {
    console.error('Error actualizando trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Eliminar trabajo (solo el propietario)
// @access  Private (Business - Owner)
router.delete('/:id', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: 'Trabajo no encontrado'
      });
    }

    // Verificar que el usuario es el propietario
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar este trabajo'
      });
    }

    // Eliminar trabajo y todas sus aplicaciones
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({
      message: 'Trabajo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/jobs/my-jobs
// @desc    Obtener trabajos del negocio actual
// @access  Private (Business)
router.get('/my-jobs', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { company: req.user._id };
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('company', 'businessInfo.companyName businessInfo.verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(query);

    res.json({
      jobs: jobs.map(job => job.getPublicInfo()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs
      }
    });

  } catch (error) {
    console.error('Error obteniendo mis trabajos:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
