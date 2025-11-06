import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Upload, 
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, isProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: user?.profile || {}
  });

  useEffect(() => {
    if (user?.profile) {
      // Set form values when user data is available
      Object.keys(user.profile).forEach(key => {
        setValue(key, user.profile[key]);
      });
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await updateProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('El archivo no puede ser mayor a 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCVUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo PDF');
      return;
    }

    try {
      setUploadingCV(true);
      await usersAPI.uploadCV(selectedFile);
      toast.success('CV subido exitosamente');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('cv-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Error al subir el CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleCVDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu CV?')) {
      return;
    }

    try {
      await usersAPI.deleteCV();
      toast.success('CV eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Error al eliminar el CV');
    }
  };

  const StudentProfile = () => (
    <div className="space-y-6">
      {/* Profile Completion Status */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
            <p className="text-gray-600">Completa tu perfil para mejores oportunidades</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isProfileComplete() ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isProfileComplete() ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Perfil completo</span>
            <span className={`font-medium ${isProfileComplete() ? 'text-green-600' : 'text-yellow-600'}`}>
              {isProfileComplete() ? 'Completo' : 'Incompleto'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${isProfileComplete() ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: isProfileComplete() ? '100%' : '75%' }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                {...register('firstName', { required: 'El nombre es requerido' })}
                className={`input ${errors.firstName ? 'border-danger-500' : ''}`}
                placeholder="Tu nombre"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                {...register('lastName', { required: 'El apellido es requerido' })}
                className={`input ${errors.lastName ? 'border-danger-500' : ''}`}
                placeholder="Tu apellido"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad *
              </label>
              <input
                {...register('age', { 
                  required: 'La edad es requerida',
                  min: { value: 16, message: 'La edad mínima es 16 años' },
                  max: { value: 35, message: 'La edad máxima es 35 años' }
                })}
                type="number"
                className={`input ${errors.age ? 'border-danger-500' : ''}`}
                placeholder="Tu edad"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-danger-600">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrera *
              </label>
              <input
                {...register('career', { required: 'La carrera es requerida' })}
                className={`input ${errors.career ? 'border-danger-500' : ''}`}
                placeholder="Tu carrera o especialidad"
              />
              {errors.career && (
                <p className="mt-1 text-sm text-danger-600">{errors.career.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universidad
              </label>
              <input
                {...register('university')}
                className="input"
                placeholder="Nombre de tu universidad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre
              </label>
              <input
                {...register('semester')}
                className="input"
                placeholder="Ej: 3er semestre, 2do año"
              />
            </div>
          </div>
        </div>

        {/* Skills and Experience */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Habilidades y Experiencia</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habilidades (separadas por comas)
              </label>
              <input
                {...register('skills')}
                className="input"
                placeholder="JavaScript, Python, Comunicación, Liderazgo..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Menciona tus habilidades técnicas y blandas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiencia Laboral
              </label>
              <textarea
                {...register('experience')}
                rows={4}
                className="textarea"
                placeholder="Describe tu experiencia laboral previa, proyectos relevantes, etc."
              />
            </div>
          </div>
        </div>

        {/* Availability and Preferences */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Disponibilidad y Preferencias</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidad
              </label>
              <select {...register('availability')} className="select">
                <option value="morning">Mañana</option>
                <option value="afternoon">Tarde</option>
                <option value="evening">Noche</option>
                <option value="weekend">Fin de semana</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación Preferida
              </label>
              <input
                {...register('preferredLocation')}
                className="input"
                placeholder="Ciudad o zona preferida"
              />
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Curriculum Vitae</h3>
          
          <div className="space-y-4">
            {user?.profile?.cvPath ? (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">CV actualizado</p>
                    <p className="text-sm text-gray-600">PDF subido exitosamente</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`/api/users/cv/${user.profile.cvPath.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Ver CV
                  </a>
                  <button
                    type="button"
                    onClick={handleCVDelete}
                    className="btn btn-danger btn-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Sube tu CV en formato PDF</p>
                  
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <label
                    htmlFor="cv-upload"
                    className="btn btn-outline cursor-pointer"
                  >
                    Seleccionar Archivo
                  </label>
                  
                  {selectedFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Archivo seleccionado: {selectedFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={handleCVUpload}
                        disabled={uploadingCV}
                        className="btn btn-primary btn-sm"
                      >
                        {uploadingCV ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          'Subir CV'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const BusinessProfile = () => (
    <div className="space-y-6">
      {/* Profile Completion Status */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Información de la Empresa</h2>
            <p className="text-gray-600">Completa la información de tu empresa</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isProfileComplete() ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isProfileComplete() ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Perfil completo</span>
            <span className={`font-medium ${isProfileComplete() ? 'text-green-600' : 'text-yellow-600'}`}>
              {isProfileComplete() ? 'Completo' : 'Incompleto'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${isProfileComplete() ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: isProfileComplete() ? '100%' : '80%' }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Información de la Empresa</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                {...register('companyName', { required: 'El nombre de la empresa es requerido' })}
                className={`input ${errors.companyName ? 'border-danger-500' : ''}`}
                placeholder="Nombre de tu empresa"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-danger-600">{errors.companyName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona de Contacto *
                </label>
                <input
                  {...register('contactName', { required: 'El nombre de contacto es requerido' })}
                  className={`input ${errors.contactName ? 'border-danger-500' : ''}`}
                  placeholder="Nombre del contacto"
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.contactName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  {...register('phone', { required: 'El teléfono es requerido' })}
                  className={`input ${errors.phone ? 'border-danger-500' : ''}`}
                  placeholder="Número de teléfono"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-danger-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                {...register('address', { required: 'La dirección es requerida' })}
                className={`input ${errors.address ? 'border-danger-500' : ''}`}
                placeholder="Dirección completa"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  {...register('city', { required: 'La ciudad es requerida' })}
                  className={`input ${errors.city ? 'border-danger-500' : ''}`}
                  placeholder="Ciudad"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-danger-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  {...register('state', { required: 'El estado es requerido' })}
                  className={`input ${errors.state ? 'border-danger-500' : ''}`}
                  placeholder="Estado"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-danger-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  {...register('zipCode')}
                  className="input"
                  placeholder="Código postal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Negocio
                </label>
                <input
                  {...register('businessType')}
                  className="input"
                  placeholder="Ej: Restaurante, Tienda, Oficina..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  {...register('website')}
                  className="input"
                  placeholder="https://www.tuempresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la Empresa
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="textarea"
                placeholder="Describe tu empresa, su misión, valores, etc."
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                Máximo 500 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'Completa tu perfil para que las empresas puedan conocerte mejor'
              : 'Actualiza la información de tu empresa para publicar trabajos'
            }
          </p>
        </div>

        {user?.role === 'student' ? <StudentProfile /> : <BusinessProfile />}
      </div>
    </div>
  );
};

export default Profile;
