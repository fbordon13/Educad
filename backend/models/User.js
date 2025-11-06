const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Información básica
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['student', 'business'],
    required: [true, 'El rol es requerido']
  },
  
  // Información del estudiante
  studentInfo: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      min: [16, 'La edad mínima es 16 años'],
      max: [35, 'La edad máxima es 35 años']
    },
    career: {
      type: String,
      trim: true
    },
    university: {
      type: String,
      trim: true
    },
    semester: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    cvPath: {
      type: String,
      default: ''
    },
    availability: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'weekend', 'flexible'],
      default: 'flexible'
    },
    preferredLocation: {
      type: String,
      trim: true
    }
  },
  
  // Información del negocio
  businessInfo: {
    companyName: {
      type: String,
      trim: true
    },
    contactName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Configuración de cuenta
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index para búsquedas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studentInfo.career': 1 });
userSchema.index({ 'studentInfo.skills': 1 });
userSchema.index({ 'businessInfo.city': 1 });

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener el nombre completo
userSchema.methods.getFullName = function() {
  if (this.role === 'student') {
    return `${this.studentInfo.firstName} ${this.studentInfo.lastName}`;
  } else {
    return this.businessInfo.companyName;
  }
};

// Método para obtener el perfil público
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  
  if (this.role === 'student') {
    // Para estudiantes, mostrar solo información relevante
    return {
      _id: userObj._id,
      role: userObj.role,
      studentInfo: userObj.studentInfo
    };
  } else {
    // Para negocios, mostrar información de contacto
    return {
      _id: userObj._id,
      role: userObj.role,
      businessInfo: {
        companyName: userObj.businessInfo.companyName,
        businessType: userObj.businessInfo.businessType,
        city: userObj.businessInfo.city,
        verified: userObj.businessInfo.verified
      }
    };
  }
};

module.exports = mongoose.model('User', userSchema);
