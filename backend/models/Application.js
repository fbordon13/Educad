const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Referencias
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'La vacante es requerida']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El candidato es requerido']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La empresa es requerida']
  },
  
  // Estado de la aplicación
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Información adicional de la aplicación
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [1000, 'La carta de presentación no puede exceder 1000 caracteres']
  },
  
  // Notas del empleador
  employerNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  
  // Fechas importantes
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  interviewScheduledAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },
  
  // Configuración de notificaciones
  notifications: {
    applicantNotified: {
      type: Boolean,
      default: false
    },
    employerNotified: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadatos
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'mobile', 'api']
  },
  ipAddress: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Un usuario solo puede aplicar una vez por trabajo
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ company: 1, status: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

// Middleware para validar que el usuario no haya aplicado previamente
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingApplication = await this.constructor.findOne({
      job: this.job,
      applicant: this.applicant
    });
    
    if (existingApplication) {
      const error = new Error('Ya has aplicado a esta vacante');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Middleware para actualizar contadores en el trabajo
applicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    // Incrementar contador de aplicaciones en el trabajo
    await mongoose.model('Job').findByIdAndUpdate(
      doc.job,
      { $inc: { applicationsCount: 1 } }
    );
  }
});

// Middleware para decrementar contadores cuando se elimina
applicationSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  await mongoose.model('Job').findByIdAndUpdate(
    doc.job,
    { $inc: { applicationsCount: -1 } }
  );
});

// Método para obtener información completa de la aplicación
applicationSchema.methods.getFullInfo = async function() {
  await this.populate([
    {
      path: 'job',
      select: 'title description location employmentType category salary company createdAt'
    },
    {
      path: 'applicant',
      select: 'studentInfo firstName lastName career university skills experience'
    },
    {
      path: 'company',
      select: 'businessInfo companyName contactName phone email'
    }
  ]);
  
  return this;
};

// Método para actualizar estado con timestamp
applicationSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  this.respondedAt = new Date();
  
  if (notes) {
    this.employerNotes = notes;
  }
  
  // Actualizar timestamp específico según el estado
  switch (newStatus) {
    case 'reviewing':
      this.reviewedAt = new Date();
      break;
    case 'interview':
      this.interviewScheduledAt = new Date();
      break;
  }
  
  return this.save();
};

// Método estático para obtener estadísticas
applicationSchema.statics.getStats = async function(userId, role) {
  const pipeline = [];
  
  if (role === 'student') {
    pipeline.push({
      $match: { applicant: mongoose.Types.ObjectId(userId) }
    });
  } else if (role === 'business') {
    pipeline.push({
      $match: { company: mongoose.Types.ObjectId(userId) }
    });
  }
  
  pipeline.push({
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  });
  
  const stats = await this.aggregate(pipeline);
  
  // Formatear estadísticas
  const formattedStats = {
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  };
  
  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });
  
  return formattedStats;
};

// Método estático para obtener aplicaciones recientes
applicationSchema.statics.getRecentApplications = function(userId, role, limit = 10) {
  const matchQuery = role === 'student' 
    ? { applicant: userId }
    : { company: userId };
    
  return this.find(matchQuery)
    .populate('job', 'title location employmentType category')
    .populate('applicant', 'studentInfo firstName lastName career')
    .populate('company', 'businessInfo companyName')
    .sort({ appliedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Application', applicationSchema);
