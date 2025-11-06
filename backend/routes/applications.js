const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { authenticateToken, requireRole, requireCompleteProfile } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/applications
// @desc    Aplicar a un trabajo
// @access  Private (Student)
router.post('/', [
  body('jobId')
    .isMongoId()
    .withMessage('ID de trabajo inválido'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La carta de presentación no puede exceder 1000 caracteres')
], authenticateToken, requireRole('student'), requireCompleteProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { jobId, coverLetter } = req.body;

    // Verificar que el trabajo existe y está activo
    const job = await Job.findById(jobId).populate('company');
    
    if (!job) {
      return res.status(404).json({
        message: 'Trabajo no encontrado'
      });
    }

    if (!job.isActive()) {
      return res.status(400).json({
        message: 'Este trabajo ya no está disponible para aplicaciones'
      });
    }

    // Verificar que no es el mismo usuario que publicó el trabajo
    if (job.company._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'No puedes aplicar a tu propio trabajo'
      });
    }

    // Verificar si ya aplicó
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'Ya has aplicado a este trabajo'
      });
    }

    // Crear aplicación
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      company: job.company._id,
      coverLetter: coverLetter || '',
      ipAddress: req.ip
    });

    await application.save();

    // Incrementar contador de aplicaciones en el trabajo
    await job.incrementApplications();

    // Poblar datos para respuesta
    await application.populate([
      {
        path: 'job',
        select: 'title location employmentType category'
      },
      {
        path: 'applicant',
        select: 'studentInfo firstName lastName career university'
      },
      {
        path: 'company',
        select: 'businessInfo companyName contactName email'
      }
    ]);

    res.status(201).json({
      message: 'Aplicación enviada exitosamente',
      application: {
        _id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
        job: {
          _id: application.job._id,
          title: application.job.title,
          location: application.job.location,
          employmentType: application.job.employmentType,
          category: application.job.category
        },
        company: {
          _id: application.company._id,
          companyName: application.company.businessInfo.companyName,
          contactName: application.company.businessInfo.contactName
        }
      }
    });

  } catch (error) {
    console.error('Error aplicando al trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Obtener aplicaciones del estudiante actual
// @access  Private (Student)
router.get('/my-applications', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { applicant: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title location employmentType category salary createdAt')
      .populate('company', 'businessInfo.companyName businessInfo.verified businessInfo.contactName businessInfo.phone')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(query);

    res.json({
      applications: applications.map(app => ({
        _id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        interviewScheduledAt: app.interviewScheduledAt,
        employerNotes: app.employerNotes,
        job: app.job,
        company: app.company
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalApplications
      }
    });

  } catch (error) {
    console.error('Error obteniendo mis aplicaciones:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Obtener aplicaciones de un trabajo específico (solo el propietario)
// @access  Private (Business - Owner)
router.get('/job/:jobId', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verificar que el trabajo pertenece al usuario
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: 'Trabajo no encontrado'
      });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'No tienes permisos para ver las aplicaciones de este trabajo'
      });
    }

    const query = { job: jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('applicant', 'studentInfo firstName lastName career university skills experience cvPath email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(query);

    res.json({
      job: {
        _id: job._id,
        title: job.title,
        location: job.location,
        employmentType: job.employmentType
      },
      applications: applications.map(app => ({
        _id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        interviewScheduledAt: app.interviewScheduledAt,
        coverLetter: app.coverLetter,
        employerNotes: app.employerNotes,
        applicant: app.applicant
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalApplications
      }
    });

  } catch (error) {
    console.error('Error obteniendo aplicaciones del trabajo:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/applications/all
// @desc    Obtener todas las aplicaciones del negocio
// @access  Private (Business)
router.get('/all', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { company: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title location employmentType category')
      .populate('applicant', 'studentInfo firstName lastName career university email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(query);

    res.json({
      applications: applications.map(app => ({
        _id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        interviewScheduledAt: app.interviewScheduledAt,
        employerNotes: app.employerNotes,
        job: app.job,
        applicant: app.applicant
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalApplications
      }
    });

  } catch (error) {
    console.error('Error obteniendo todas las aplicaciones:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Actualizar estado de aplicación (solo el empleador)
// @access  Private (Business - Owner)
router.put('/:id/status', [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Estado inválido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
], authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('job')
      .populate('applicant', 'studentInfo firstName lastName email');

    if (!application) {
      return res.status(404).json({
        message: 'Aplicación no encontrada'
      });
    }

    // Verificar que el trabajo pertenece al usuario
    if (application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar esta aplicación'
      });
    }

    // Actualizar estado
    await application.updateStatus(status, notes);

    res.json({
      message: 'Estado de aplicación actualizado exitosamente',
      application: {
        _id: application._id,
        status: application.status,
        employerNotes: application.employerNotes,
        reviewedAt: application.reviewedAt,
        interviewScheduledAt: application.interviewScheduledAt,
        respondedAt: application.respondedAt
      }
    });

  } catch (error) {
    console.error('Error actualizando estado de aplicación:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Retirar aplicación (solo el aplicante)
// @access  Private (Student - Owner)
router.delete('/:id', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: 'Aplicación no encontrada'
      });
    }

    // Verificar que el usuario es el aplicante
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar esta aplicación'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Aplicación retirada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando aplicación:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/applications/stats
// @desc    Obtener estadísticas de aplicaciones
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Application.getStats(req.user._id, req.user.role);
    
    // Estadísticas adicionales por rol
    if (req.user.role === 'business') {
      const jobStats = await Job.aggregate([
        { $match: { company: req.user._id } },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            activeJobs: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalViews: { $sum: '$views' }
          }
        }
      ]);

      stats.jobs = jobStats[0] || { totalJobs: 0, activeJobs: 0, totalViews: 0 };
    }

    res.json({ stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
