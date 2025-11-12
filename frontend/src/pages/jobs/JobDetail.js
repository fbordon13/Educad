import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign,
  Calendar,
  Building2,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, hasRole } = useAuth();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(id);
      setJob(response.data.job);
      setCompany(response.data.company);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Error al cargar los detalles del trabajo');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para aplicar');
      return;
    }

    if (hasRole('business')) {
      toast.error('Los negocios no pueden aplicar a trabajos');
      return;
    }

    try {
      setApplying(true);
      await applicationsAPI.apply(id, coverLetter);
      setHasApplied(true);
      toast.success('¡Aplicación enviada exitosamente!');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error(error.response?.data?.message || 'Error al aplicar al trabajo');
    } finally {
      setApplying(false);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const types = {
      'part-time': 'Medio Tiempo',
      'full-time': 'Tiempo Completo',
      'internship': 'Prácticas',
      'contract': 'Contrato',
      'temporary': 'Temporal'
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category) => {
    const categories = {
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
    return categories[category] || category;
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salario no especificado';
    
    const { min, max, currency, period } = salary;
    const currencySymbol = currency === 'USD' ? '$' : '$';
    const periodText = period === 'hourly' ? '/hora' : 
                     period === 'monthly' ? '/mes' : 
                     period === 'yearly' ? '/año' : '';
    
    if (min && max) {
      return `${currencySymbol}${min} - ${currencySymbol}${max}${periodText}`;
    } else if (min) {
      return `Desde ${currencySymbol}${min}${periodText}`;
    } else if (max) {
      return `Hasta ${currencySymbol}${max}${periodText}`;
    }
    
    return 'Salario a negociar';
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return 'Horario flexible';
    
    const { startTime, endTime, days, flexible } = schedule;
    
    if (flexible) {
      return 'Horario flexible';
    }
    
    const dayNames = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    
    const dayLabels = days ? days.map(day => dayNames[day]).join(', ') : '';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';
    
    return `${dayLabels} ${timeRange}`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del trabajo...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trabajo no encontrado</h1>
          <p className="text-gray-600 mb-6">El trabajo que buscas no existe o ha sido eliminado.</p>
          <Link to="/jobs" className="btn btn-primary">
            Ver Todos los Trabajos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a trabajos
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {job.isFeatured && (
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  )}
                  <span className="badge badge-primary">
                    {getEmploymentTypeLabel(job.employmentType)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <Building2 className="w-5 h-5 mr-2" />
                <span className="font-medium">{company?.businessInfo?.companyName}</span>
                {company?.businessInfo?.verified && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {job.location.address}, {job.location.city}, {job.location.state}
                    {job.location.isRemote && <span className="text-primary-600 ml-1">• Remoto</span>}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span>{getCategoryLabel(job.category)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>{formatSalary(job.salary)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Publicado {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción del Trabajo</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Responsabilidades</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Beneficios</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {hasApplied ? 'Aplicación Enviada' : 'Aplicar al Trabajo'}
              </h3>

              {hasApplied ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Ya has aplicado a este trabajo. Te notificaremos sobre el estado de tu aplicación.
                  </p>
                  <Link to="/applications" className="btn btn-outline">
                    Ver Mis Aplicaciones
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {!isAuthenticated ? (
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Debes iniciar sesión para aplicar a este trabajo.
                      </p>
                      <Link to="/login" className="btn btn-primary">
                        Iniciar Sesión
                      </Link>
                    </div>
                  ) : hasRole('business') ? (
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Businesses cannot apply to jobs.
                      </p>
                    </div>
                  ) : (
                    <>
                      {job.requiresCoverLetter && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Letter (Optional)
                          </label>
                          <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={4}
                            className="textarea"
                            placeholder="Explain why you are the ideal candidate for this job..."
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="btn btn-primary w-full btn-lg"
                      >
                        {applying ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Employment Type</span>
                  <p className="text-gray-900">{getEmploymentTypeLabel(job.employmentType)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Horario</span>
                  <p className="text-gray-900">{formatSchedule(job.schedule)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Salario</span>
                  <p className="text-gray-900">{formatSalary(job.salary)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Categoría</span>
                  <p className="text-gray-900">{getCategoryLabel(job.category)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Vistas</span>
                  <p className="text-gray-900">{job.views}</p>
                </div>

                {job.applicationDeadline && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha Límite</span>
                    <p className="text-gray-900">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            {company && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sobre la Empresa</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{company.businessInfo.companyName}</h4>
                    {company.businessInfo.businessType && (
                      <p className="text-sm text-gray-600">{company.businessInfo.businessType}</p>
                    )}
                  </div>

                  {company.businessInfo.description && (
                    <p className="text-sm text-gray-700">{company.businessInfo.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{company.businessInfo.city}, {company.businessInfo.state}</span>
                    </div>

                    {company.businessInfo.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{company.businessInfo.phone}</span>
                      </div>
                    )}

                    {company.businessInfo.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{company.businessInfo.email}</span>
                      </div>
                    )}

                    {company.businessInfo.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={company.businessInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Sitio web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
