import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  Building2,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const featuredResponse = await jobsAPI.getFeaturedJobs();
        setFeaturedJobs(featuredResponse.data.jobs.slice(0, 3)); // Solo 3 trabajos destacados
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (searchLocation) params.append('city', searchLocation);
    
    window.location.href = `/jobs?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplificado */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pasantías y Prácticas Profesionales en Panamá
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Una pasantía/práctica profesional es una experiencia de trabajo supervisada en una empresa u organización, en la cual el estudiante aplica los conocimientos adquiridos académicamente en un entorno real. En muchos casos se considera parte del plan de estudios para la titulación o graduación.
            </p>

            {/* Search Bar Simplificado */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar pasantía o práctica profesional..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Ver Pasantías Disponibles
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Registrarse
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Qué son las Pasantías */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">¿Qué son las Pasantías/Prácticas para Estudiantes en Panamá?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Experiencia Real</h3>
              <p className="text-gray-600 mb-4">Una pasantía/práctica profesional es una experiencia de trabajo supervisada en una empresa u organización, donde aplicas los conocimientos adquiridos académicamente en un entorno real.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Parte del Plan de Estudios</h3>
              <p className="text-gray-600 mb-4">En muchos casos se considera parte del plan de estudios para la titulación o graduación, cumpliendo requisitos académicos mientras adquieres experiencia práctica.</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Programa Aprender Haciendo</h3>
              <p className="text-gray-600 mb-4">En Panamá existe el programa "Aprender Haciendo" del MITRADEL que busca insertar jóvenes de 17 a 24 años en empresas privadas a través de pasantías.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requisitos y Beneficios */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">✅ Requisitos Comunes</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Estar matriculado en una institución educativa (universidad o técnica) o estar próximo a graduarse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Presentar hoja de vida, copia de cédula y, en ocasiones, póliza de seguro estudiantil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Carta de la universidad indicando que la práctica forma parte del plan de estudios</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Disponibilidad de horario compatible con tus clases</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>En algunos casos, buen rendimiento académico y competencias específicas</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">📋 Beneficios</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Experiencia real en empresa y desarrollo de habilidades profesionales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Posibilidad de vinculación laboral después de completar la pasantía</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Certificación o carta de práctica para tu CV</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Programa "Aprender Haciendo": asignación mensual de B/. 450 para jóvenes de 18-25 años</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Duración típica: 6 meses o 130 días hábiles. Modalidad presencial, mixta o flexible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pasantías Destacadas */}
      {featuredJobs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Pasantías Disponibles</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredJobs.map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                      {job.employmentType === 'part-time' ? 'Medio Tiempo' : 'Tiempo Completo'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location.city}
                  </div>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm"
                  >
                    Ver detalles
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/jobs" className="btn btn-primary">
                Ver Todas las Pasantías
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu pasantía?</h2>
          <p className="text-xl mb-8">
            Oportunidad para que estudiantes panameños adquieran experiencia real, amplíen su red profesional, y avancen en su carrera.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Registrarse Gratis
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Ir al Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
