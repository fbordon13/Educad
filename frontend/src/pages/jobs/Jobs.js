import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  Filter,
  ChevronDown,
  Loader2,
  Star
} from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [remote, setRemote] = useState(searchParams.get('remote') === 'true');

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await jobsAPI.getJobs(params);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await jobsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('city', location);
    if (category) params.append('category', category);
    if (employmentType) params.append('employmentType', employmentType);
    if (remote) params.append('remote', 'true');
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setEmploymentType('');
    setRemote(false);
    setSearchParams({});
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

  const getCategoryLabel = (cat) => {
    const category = categories.find(c => c.value === cat);
    return category ? category.label : cat;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trabajos Disponibles</h1>
          <p className="text-gray-600">
            Encuentra oportunidades de empleo que se adapten a tu perfil
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="¿Qué trabajo buscas?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="¿Dónde?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avanzados
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {(search || location || category || employmentType || remote) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Empleo
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="select"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="part-time">Medio Tiempo</option>
                    <option value="full-time">Tiempo Completo</option>
                    <option value="internship">Prácticas</option>
                    <option value="contract">Contrato</option>
                    <option value="temporary">Temporal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remote"
                      checked={remote}
                      onChange={(e) => setRemote(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                      Trabajo Remoto
                    </label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {pagination.totalJobs ? `${pagination.totalJobs} trabajos encontrados` : 'Cargando...'}
          </p>
          
          {pagination.totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando trabajos...</p>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {job.isFeatured && (
                      <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    )}
                    <span className="badge badge-primary">
                      {getEmploymentTypeLabel(job.employmentType)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {job.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location.city}, {job.location.state}
                    {job.location.isRemote && <span className="ml-2 text-primary-600">• Remoto</span>}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {getCategoryLabel(job.category)}
                  </div>

                  {job.salary && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="font-medium text-gray-900">
                        {job.salary.min && job.salary.max 
                          ? `$${job.salary.min} - $${job.salary.max}`
                          : job.salary.min 
                          ? `Desde $${job.salary.min}`
                          : `Hasta $${job.salary.max}`
                        } {job.salary.period === 'hourly' ? '/hora' : job.salary.period === 'monthly' ? '/mes' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Ver Detalles
                  </Link>
                  
                  <div className="flex items-center text-gray-500 text-xs">
                    <Eye className="w-4 h-4 mr-1" />
                    {job.views} vistas
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trabajos</h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros de búsqueda para encontrar más oportunidades.
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', pagination.currentPage - 1);
                setSearchParams(params);
              }}
              disabled={!pagination.hasPrevPage}
              className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              {pagination.currentPage} de {pagination.totalPages}
            </span>
            
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', pagination.currentPage + 1);
                setSearchParams(params);
              }}
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

export default Jobs;
