import React, { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Users, Briefcase, FileText, Database } from 'lucide-react';
import { exportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ExportData = () => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type) => {
    try {
      setExporting(type);
      let response;
      let filename;

      switch (type) {
        case 'users':
          response = await exportAPI.exportUsers();
          filename = `users_export_${Date.now()}.xlsx`;
          break;
        case 'jobs':
          response = await exportAPI.exportJobs();
          filename = `jobs_export_${Date.now()}.xlsx`;
          break;
        case 'applications':
          response = await exportAPI.exportApplications();
          filename = `applications_export_${Date.now()}.xlsx`;
          break;
        case 'all':
          response = await exportAPI.exportAll();
          filename = `all_data_export_${Date.now()}.xlsx`;
          break;
        default:
          return;
      }

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Datos de ${type === 'users' ? 'usuarios' : type === 'jobs' ? 'trabajos' : type === 'applications' ? 'aplicaciones' : 'todos los datos'} exportados exitosamente a Excel`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(error.response?.data?.message || `Error al exportar datos de ${type}`);
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'users',
      title: 'Exportar Usuarios',
      description: 'Exporta todos los usuarios registrados (estudiantes y empresas)',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'jobs',
      title: 'Exportar Trabajos',
      description: 'Exporta todas las vacantes publicadas con detalles completos',
      icon: Briefcase,
      color: 'bg-green-500'
    },
    {
      id: 'applications',
      title: 'Exportar Aplicaciones',
      description: 'Exporta todas las aplicaciones a trabajos con información de candidatos',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      id: 'all',
      title: 'Exportar Todo',
      description: 'Exporta todo en un solo archivo Excel con múltiples hojas',
      icon: Database,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exportar Datos a Excel</h1>
          <p className="text-gray-600">
            Descarga toda la información registrada en formato Excel para análisis y reportes
          </p>
        </div>

        {/* Export Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isExporting = exporting === option.id;

            return (
              <div
                key={option.id}
                className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${option.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {option.description}
                    </p>
                    <button
                      onClick={() => handleExport(option.id)}
                      disabled={isExporting || exporting !== null}
                      className="btn btn-primary w-full"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Descargar Excel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Acerca de las Exportaciones a Excel</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Todos los datos se exportan en formato Microsoft Excel (.xlsx)</li>
                <li>• Los archivos incluyen toda la información relevante de la base de datos</li>
                <li>• "Exportar Todo" crea un solo archivo con múltiples hojas</li>
                <li>• Los archivos se nombran automáticamente con timestamps</li>
                <li>• Las exportaciones grandes pueden tardar unos momentos en generarse</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;

