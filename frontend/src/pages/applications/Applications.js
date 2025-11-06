import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  X, 
  Eye,
  Calendar,
  Building2,
  MapPin,
  Loader2,
  Filter,
  ChevronDown
} from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, selectedStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedStatus && { status: selectedStatus })
      };
      
      const response = await applicationsAPI.getMyApplications(params);
      setApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'badge-secondary' },
      reviewing: { label: 'En Revisión', className: 'badge-warning' },
      shortlisted: { label: 'Seleccionado', className: 'badge-primary' },
      interview: { label: 'Entrevista', className: 'badge-warning' },
      accepted: { label: 'Aceptado', className: 'badge-success' },
      rejected: { label: 'Rechazado', className: 'badge-danger' },
      withdrawn: { label: 'Retirado', className: 'badge-secondary' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'reviewing':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Aplicaciones</h1>
          <p className="text-gray-600">
            Revisa el estado de tus aplicaciones a trabajos
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por estado
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="select"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="reviewing">En Revisión</option>
                  <option value="shortlisted">Seleccionado</option>
                  <option value="interview">Entrevista</option>
                  <option value="accepted">Aceptado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="withdrawn">Retirado</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {pagination.totalApplications ? `${pagination.totalApplications} aplicaciones` : 'Cargando...'}
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando aplicaciones...</p>
            </div>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(application.status)}
                      <h3 className="text-xl font-bold text-gray-900">
                        {application.job.title}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span className="font-medium">{application.company.businessInfo.companyName}</span>
                      {application.company.businessInfo.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{application.job.location.city}, {application.job.location.state}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{getEmploymentTypeLabel(application.job.employmentType)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Aplicado el {formatDate(application.appliedAt)}</span>
                      </div>
                      
                      {application.reviewedAt && (
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>Revisado el {formatDate(application.reviewedAt)}</span>
                        </div>
                      )}
                      
                      {application.interviewScheduledAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Entrevista programada para {formatDate(application.interviewScheduledAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    {application.employerNotes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Notas del empleador:</h4>
                        <p className="text-gray-700 text-sm">{application.employerNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Link
                      to={`/jobs/${application.job._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Trabajo
                    </Link>
                    
                    {application.status === 'pending' && (
                      <button className="btn btn-danger btn-sm">
                        Retirar Aplicación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes aplicaciones</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus 
                ? 'No tienes aplicaciones con el estado seleccionado.'
                : 'Comienza aplicando a trabajos que te interesen.'
              }
            </p>
            <Link
              to="/jobs"
              className="btn btn-primary"
            >
              Buscar Trabajos
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
