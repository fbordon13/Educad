import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../../services/api';
import { 
  Users, 
  Eye, 
  CheckCircle, 
  X, 
  Clock,
  Calendar,
  Mail,
  Phone,
  FileText,
  Loader2,
  Filter,
  ChevronDown,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const JobApplications = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchJobAndApplications();
  }, [id, currentPage, selectedStatus]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      const [jobResponse, applicationsResponse] = await Promise.all([
        jobsAPI.getJob(id),
        applicationsAPI.getJobApplications(id, {
          page: currentPage,
          limit: 10,
          ...(selectedStatus && { status: selectedStatus })
        })
      ]);

      setJob(jobResponse.data.job);
      setApplications(applicationsResponse.data.applications);
      setPagination(applicationsResponse.data.pagination);
    } catch (error) {
      console.error('Error fetching job and applications:', error);
      toast.error('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, notes = '') => {
    try {
      setUpdatingStatus(applicationId);
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus, notes);
      toast.success('Estado actualizado exitosamente');
      fetchJobAndApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
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

  const ApplicationCard = ({ application }) => (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              {application.applicant.studentInfo.firstName} {application.applicant.studentInfo.lastName}
            </h3>
            {getStatusBadge(application.status)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Información Académica</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Carrera:</strong> {application.applicant.studentInfo.career}</p>
                {application.applicant.studentInfo.university && (
                  <p><strong>Universidad:</strong> {application.applicant.studentInfo.university}</p>
                )}
                {application.applicant.studentInfo.semester && (
                  <p><strong>Semestre:</strong> {application.applicant.studentInfo.semester}</p>
                )}
                <p><strong>Edad:</strong> {application.applicant.studentInfo.age} años</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {application.applicant.studentInfo.skills?.slice(0, 5).map((skill, index) => (
                  <span key={index} className="badge badge-secondary">
                    {skill}
                  </span>
                ))}
                {application.applicant.studentInfo.skills?.length > 5 && (
                  <span className="badge badge-secondary">
                    +{application.applicant.studentInfo.skills.length - 5} más
                  </span>
                )}
              </div>
            </div>
          </div>

          {application.coverLetter && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Carta de Presentación</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {application.coverLetter}
              </p>
            </div>
          )}

          {application.applicant.studentInfo.experience && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Experiencia</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {application.applicant.studentInfo.experience}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
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
          </div>

          {application.employerNotes && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tus Notas:</h4>
              <p className="text-blue-800 text-sm">{application.employerNotes}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {application.applicant.studentInfo.cvPath && (
            <a
              href={`/api/users/cv/${application.applicant.studentInfo.cvPath.split('/').pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver CV
            </a>
          )}
          
          <a
            href={`mailto:${application.applicant.email}`}
            className="btn btn-outline btn-sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contactar
          </a>
        </div>
      </div>

      {/* Status Update Actions */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Actualizar estado:</span>
            
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'reviewing')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-warning btn-sm"
                >
                  {updatingStatus === application._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'En Revisión'
                  )}
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-danger btn-sm"
                >
                  Rechazar
                </button>
              </>
            )}

            {application.status === 'reviewing' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-primary btn-sm"
                >
                  Seleccionar
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'interview')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-warning btn-sm"
                >
                  Entrevista
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-danger btn-sm"
                >
                  Rechazar
                </button>
              </>
            )}

            {application.status === 'shortlisted' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'interview')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-warning btn-sm"
                >
                  Entrevista
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'accepted')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-success btn-sm"
                >
                  Aceptar
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-danger btn-sm"
                >
                  Rechazar
                </button>
              </>
            )}

            {application.status === 'interview' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'accepted')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-success btn-sm"
                >
                  Aceptar
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                  disabled={updatingStatus === application._id}
                  className="btn btn-danger btn-sm"
                >
                  Rechazar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trabajo no encontrado</h1>
          <p className="text-gray-600 mb-6">El trabajo que buscas no existe.</p>
          <Link to="/my-jobs" className="btn btn-primary">
            Volver a Mis Trabajos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/my-jobs"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Volver a Mis Trabajos
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aplicaciones</h1>
          <p className="text-gray-600 mb-4">
            Revisa las aplicaciones para: <strong>{job.title}</strong>
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{pagination.totalApplications || 0} aplicaciones</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{job.views} vistas</span>
            </div>
          </div>
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
        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus ? 'No hay aplicaciones con el estado seleccionado' : 'No hay aplicaciones'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus 
                ? 'Intenta cambiar el filtro para ver más aplicaciones.'
                : 'Las aplicaciones aparecerán aquí cuando los estudiantes se postulen a tu trabajo.'
              }
            </p>
            {selectedStatus && (
              <button
                onClick={() => setSelectedStatus('')}
                className="btn btn-primary"
              >
                Ver Todas las Aplicaciones
              </button>
            )}
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

export default JobApplications;
