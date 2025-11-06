import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Bolsa Trabajo</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Conectamos estudiantes con oportunidades de empleo de medio tiempo 
              en negocios locales. Encuentra tu próximo trabajo o encuentra el 
              talento que necesitas.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Buscar Trabajos
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Para estudiantes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Para Estudiantes</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Buscar Empleo
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Crear Perfil
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Subir CV</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Gestionar Aplicaciones</span>
              </li>
            </ul>
          </div>

          {/* Para negocios */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Para Negocios</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Publicar Vacantes</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Gestionar Aplicaciones</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Buscar Talentos</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Panel de Control</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-sm">contacto@bolsatrabajo.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Teléfono</p>
                <p className="text-sm">+52 (55) 1234-5678</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Ubicación</p>
                <p className="text-sm">Ciudad de México, México</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {currentYear} Bolsa de Trabajo Estudiantil. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="#" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Política de Privacidad
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Términos de Servicio
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
