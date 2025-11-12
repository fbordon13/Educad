import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingJob, setDeletingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, selectedStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedStatus && { status: selectedStatus })
      };
      
      const response = await jobsAPI.getMyJobs(params);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Error loading your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingJob(jobId);
      await jobsAPI.deleteJob(jobId);
      toast.success('Job deleted successfully');
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error deleting job');
    } finally {
      setDeletingJob(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'badge-success' },
      paused: { label: 'Pausado', className: 'badge-warning' },
      closed: { label: 'Cerrado', className: 'badge-danger' },
      draft: { label: 'Borrador', className: 'badge-secondary' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
    );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    
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
    
    return 'A negociar';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600">
              Manage the vacancies you have posted
            </p>
          </div>
          
          <Link
            to="/create-job"
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post Job
          </Link>
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
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="closed">Cerrado</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {pagination.totalJobs ? `${pagination.totalJobs} jobs` : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusBadge(job.status)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(job.createdAt)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {job.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location.city}, {job.location.state}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{getEmploymentTypeLabel(job.employmentType)}</span>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{job.views} vistas</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{job.applicationsCount} aplicaciones</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Link>
                  
                  <Link
                    to={`/edit-job/${job._id}`}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    disabled={deletingJob === job._id}
                    className="btn btn-danger btn-sm"
                  >
                    {deletingJob === job._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/jobs/${job._id}/applications`}
                    className="btn btn-primary btn-sm w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ver Aplicaciones ({job.applicationsCount})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus ? 'You have no jobs with the selected status' : 'You have not posted any jobs'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus 
                ? 'Try changing the filter or post a new job.'
                : 'Start by posting your first vacancy to find talent.'
              }
            </p>
            <Link
              to="/create-job"
              className="btn btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post Job
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

export default MyJobs;
