import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  ArrowRight,
  Building2,
  GraduationCap,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasRole, isProfileComplete } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await usersAPI.getDashboardStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const StudentDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Hola, {user?.profile?.firstName || 'Estudiante'}!
            </h1>
            <p className="text-gray-600">
              {isProfileComplete() 
                ? 'Tu perfil está completo. ¡Excelente!'
                : 'Completa tu perfil para tener mejores oportunidades.'
              }
            </p>
          </div>
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        {!isProfileComplete() && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">Perfil incompleto</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Completa tu información para acceder a todas las funciones.
            </p>
            <Link
              to="/profile"
              className="btn btn-sm btn-warning mt-2"
            >
              Completar Perfil
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Aplicaciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.applications?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.applications?.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entrevistas</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.applications?.interview || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceptadas</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.applications?.accepted || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Aplicaciones Recientes</h2>
          <Link
            to="/applications"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {stats?.recentApplications?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentApplications.map((application) => (
              <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{application.job.title}</h3>
                  <p className="text-sm text-gray-600">{application.company.businessInfo.companyName}</p>
                  <p className="text-xs text-gray-500">
                    Aplicado el {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${
                    application.status === 'accepted' ? 'badge-success' :
                    application.status === 'interview' ? 'badge-warning' :
                    application.status === 'rejected' ? 'badge-danger' :
                    'badge-secondary'
                  }`}>
                    {application.status === 'accepted' ? 'Aceptada' :
                     application.status === 'interview' ? 'Entrevista' :
                     application.status === 'rejected' ? 'Rechazada' :
                     application.status === 'pending' ? 'Pendiente' :
                     application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tienes aplicaciones recientes</p>
            <Link
              to="/jobs"
              className="btn btn-primary"
            >
              Buscar Trabajos
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      {stats?.recommendedJobs?.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Trabajos Recomendados</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {stats.recommendedJobs.map((job) => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{job.company.businessInfo.companyName}</p>
                <p className="text-xs text-gray-500 mb-3">{job.location.city}, {job.location.state}</p>
                <Link
                  to={`/jobs/${job._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  Ver detalles
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const BusinessDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Hola, {user?.profile?.companyName || 'Empresa'}!
            </h1>
            <p className="text-gray-600">
              {isProfileComplete() 
                ? 'Tu perfil está completo. ¡Excelente!'
                : 'Completa tu perfil para publicar trabajos.'
              }
            </p>
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        {!isProfileComplete() && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">Perfil incompleto</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Completa tu información para publicar trabajos.
            </p>
            <Link
              to="/profile"
              className="btn btn-sm btn-warning mt-2"
            >
              Completar Perfil
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trabajos Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.jobs?.active || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vistas</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.jobs?.totalViews || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aplicaciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.applications?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.applications?.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/create-job"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Publicar Trabajo</h3>
              <p className="text-sm text-gray-600">Crear nueva vacante</p>
            </div>
          </Link>

          <Link
            to="/my-jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Mis Trabajos</h3>
              <p className="text-sm text-gray-600">Gestionar vacantes</p>
            </div>
          </Link>

          <Link
            to="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Aplicaciones</h3>
              <p className="text-sm text-gray-600">Revisar candidatos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      {stats?.recentApplications?.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Aplicaciones Recientes</h2>
            <Link
              to="/applications"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentApplications.map((application) => (
              <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{application.job.title}</h3>
                  <p className="text-sm text-gray-600">
                    {application.applicant.studentInfo.firstName} {application.applicant.studentInfo.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Aplicado el {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${
                    application.status === 'accepted' ? 'badge-success' :
                    application.status === 'interview' ? 'badge-warning' :
                    application.status === 'rejected' ? 'badge-danger' :
                    'badge-secondary'
                  }`}>
                    {application.status === 'accepted' ? 'Aceptada' :
                     application.status === 'interview' ? 'Entrevista' :
                     application.status === 'rejected' ? 'Rechazada' :
                     application.status === 'pending' ? 'Pendiente' :
                     application.status}
                  </span>
                  <Link
                    to={`/jobs/${application.job._id}/applications`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasRole('student') ? <StudentDashboard /> : <BusinessDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
