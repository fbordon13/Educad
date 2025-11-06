const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido - usuario no encontrado' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Cuenta desactivada' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    }
    
    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Permisos insuficientes' 
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario es el propietario del recurso
const requireOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Autenticación requerida' 
      });
    }

    // Para recursos como trabajos o aplicaciones
    const resourceUserId = req.resource ? req.resource[resourceField] : null;
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso' 
      });
    }

    next();
  };
};

// Middleware para verificar perfil completo
const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autenticación requerida' 
    });
  }

  const { role, studentInfo, businessInfo } = req.user;
  
  let isComplete = false;
  
  if (role === 'student') {
    isComplete = studentInfo.firstName && 
                 studentInfo.lastName && 
                 studentInfo.age && 
                 studentInfo.career;
  } else if (role === 'business') {
    isComplete = businessInfo.companyName && 
                 businessInfo.contactName && 
                 businessInfo.phone && 
                 businessInfo.address && 
                 businessInfo.city;
  }

  if (!isComplete) {
    return res.status(400).json({ 
      message: 'Perfil incompleto. Completa tu información antes de continuar.',
      missingFields: getMissingFields(req.user)
    });
  }

  next();
};

// Función auxiliar para obtener campos faltantes
const getMissingFields = (user) => {
  const { role, studentInfo, businessInfo } = user;
  const missing = [];
  
  if (role === 'student') {
    if (!studentInfo.firstName) missing.push('firstName');
    if (!studentInfo.lastName) missing.push('lastName');
    if (!studentInfo.age) missing.push('age');
    if (!studentInfo.career) missing.push('career');
  } else if (role === 'business') {
    if (!businessInfo.companyName) missing.push('companyName');
    if (!businessInfo.contactName) missing.push('contactName');
    if (!businessInfo.phone) missing.push('phone');
    if (!businessInfo.address) missing.push('address');
    if (!businessInfo.city) missing.push('city');
  }
  
  return missing;
};

// Middleware para actualizar último login
const updateLastLogin = async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, { 
        lastLogin: new Date() 
      });
    } catch (error) {
      console.error('Error actualizando último login:', error);
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  requireCompleteProfile,
  updateLastLogin
};
