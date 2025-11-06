const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del puesto es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  
  // Información de la empresa
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Ubicación y horarios
  location: {
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'El estado es requerido'],
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    isHybrid: {
      type: Boolean,
      default: false
    }
  },
  
  // Detalles del empleo
  employmentType: {
    type: String,
    enum: ['part-time', 'full-time', 'internship', 'contract', 'temporary'],
    required: [true, 'El tipo de empleo es requerido']
  },
  schedule: {
    startTime: {
      type: String,
      trim: true
    },
    endTime: {
      type: String,
      trim: true
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    flexible: {
      type: Boolean,
      default: false
    }
  },
  
  // Compensación
  salary: {
    min: {
      type: Number,
      min: [0, 'El salario mínimo no puede ser negativo']
    },
    max: {
      type: Number,
      min: [0, 'El salario máximo no puede ser negativo']
    },
    currency: {
      type: String,
      default: 'MXN',
      enum: ['MXN', 'USD']
    },
    period: {
      type: String,
      enum: ['hourly', 'weekly', 'monthly', 'yearly'],
      default: 'hourly'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  
  // Categorización
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: [
      'technology', 'customer-service', 'retail', 'food-service',
      'marketing', 'sales', 'administration', 'education', 'healthcare',
      'tutoring', 'delivery', 'cleaning', 'security', 'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Estado y fechas
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  
  // Métricas
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Configuración
  allowApplications: {
    type: Boolean,
    default: true
  },
  maxApplications: {
    type: Number,
    default: 100
  },
  requiresCoverLetter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
jobSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ 'location.state': 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isFeatured: -1, createdAt: -1 });

// Índice compuesto para búsquedas complejas
jobSchema.index({ 
  status: 1, 
  category: 1, 
  'location.city': 1, 
  employmentType: 1 
});

// Middleware para actualizar contadores
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

jobSchema.methods.incrementApplications = function() {
  this.applicationsCount += 1;
  return this.save();
};

// Método para verificar si la vacante está activa
jobSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.allowApplications && 
         (!this.applicationDeadline || this.applicationDeadline > now) &&
         this.applicationsCount < this.maxApplications;
};

// Método para obtener información pública de la vacante
jobSchema.methods.getPublicInfo = function() {
  const jobObj = this.toObject();
  return {
    _id: jobObj._id,
    title: jobObj.title,
    description: jobObj.description,
    requirements: jobObj.requirements,
    responsibilities: jobObj.responsibilities,
    benefits: jobObj.benefits,
    location: jobObj.location,
    employmentType: jobObj.employmentType,
    schedule: jobObj.schedule,
    salary: jobObj.salary,
    category: jobObj.category,
    tags: jobObj.tags,
    applicationDeadline: jobObj.applicationDeadline,
    startDate: jobObj.startDate,
    views: jobObj.views,
    isFeatured: jobObj.isFeatured,
    requiresCoverLetter: jobObj.requiresCoverLetter,
    createdAt: jobObj.createdAt,
    updatedAt: jobObj.updatedAt
  };
};

// Método estático para búsqueda avanzada
jobSchema.statics.searchJobs = function(filters = {}) {
  const query = {
    status: 'active',
    allowApplications: true,
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: new Date() } }
    ]
  };

  // Filtros de texto
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Filtros de ubicación
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  if (filters.state) {
    query['location.state'] = new RegExp(filters.state, 'i');
  }
  if (filters.remote !== undefined) {
    query['location.isRemote'] = filters.remote === 'true';
  }

  // Filtros de empleo
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.employmentType) {
    query.employmentType = filters.employmentType;
  }

  // Filtros de salario
  if (filters.minSalary) {
    query['salary.min'] = { $gte: parseInt(filters.minSalary) };
  }

  return this.find(query)
    .populate('company', 'businessInfo.companyName businessInfo.verified')
    .sort({ isFeatured: -1, createdAt: -1 });
};

module.exports = mongoose.model('Job', jobSchema);
