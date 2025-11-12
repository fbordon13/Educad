import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(id);
      setJob(response.data.job);
      
      // Set form values
      const jobData = response.data.job;
      reset({
        title: jobData.title,
        description: jobData.description,
        employmentType: jobData.employmentType,
        category: jobData.category,
        'location.city': jobData.location.city,
        'location.state': jobData.location.state,
        'location.address': jobData.location.address,
        'location.zipCode': jobData.location.zipCode,
        'location.isRemote': jobData.location.isRemote,
        'location.isHybrid': jobData.location.isHybrid,
        'salary.min': jobData.salary?.min,
        'salary.max': jobData.salary?.max,
        'salary.period': jobData.salary?.period || 'hourly',
        'salary.isNegotiable': jobData.salary?.isNegotiable,
        'schedule.flexible': jobData.schedule?.flexible,
        'schedule.startTime': jobData.schedule?.startTime,
        'schedule.endTime': jobData.schedule?.endTime,
        'schedule.days': jobData.schedule?.days || [],
        requirements: jobData.requirements?.join('\n'),
        responsibilities: jobData.responsibilities?.join('\n'),
        benefits: jobData.benefits?.join('\n'),
        tags: jobData.tags?.join(', '),
        startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : '',
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toISOString().split('T')[0] : '',
        requiresCoverLetter: jobData.requiresCoverLetter,
        status: jobData.status
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Error loading job');
      navigate('/my-jobs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Process arrays
      const processedData = {
        ...data,
        requirements: data.requirements ? data.requirements.split('\n').filter(req => req.trim()) : [],
        responsibilities: data.responsibilities ? data.responsibilities.split('\n').filter(resp => resp.trim()) : [],
        benefits: data.benefits ? data.benefits.split('\n').filter(benefit => benefit.trim()) : [],
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await jobsAPI.updateJob(id, processedData);
      toast.success('Job updated successfully');
      navigate(`/jobs/${id}`);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error.response?.data?.message || 'Error updating job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h1>
          <p className="text-gray-600 mb-6">The job you are trying to edit does not exist.</p>
          <button
            onClick={() => navigate('/my-jobs')}
            className="btn btn-primary"
          >
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  const employmentTypes = [
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'internship', label: 'Prácticas' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporal' }
  ];

  const categories = [
    { value: 'technology', label: 'Tecnología' },
    { value: 'customer-service', label: 'Atención al Cliente' },
    { value: 'retail', label: 'Ventas/Retail' },
    { value: 'food-service', label: 'Servicios de Alimentación' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Ventas' },
    { value: 'administration', label: 'Administración' },
    { value: 'education', label: 'Educación' },
    { value: 'healthcare', label: 'Salud' },
    { value: 'tutoring', label: 'Tutorías' },
    { value: 'delivery', label: 'Reparto/Entrega' },
    { value: 'cleaning', label: 'Limpieza' },
    { value: 'security', label: 'Seguridad' },
    { value: 'other', label: 'Otros' }
  ];

  const salaryPeriods = [
    { value: 'hourly', label: 'Por Hora' },
    { value: 'weekly', label: 'Por Semana' },
    { value: 'monthly', label: 'Por Mes' },
    { value: 'yearly', label: 'Por Año' }
  ];

  const days = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'paused', label: 'Pausado' },
    { value: 'closed', label: 'Cerrado' },
    { value: 'draft', label: 'Borrador' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to job
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Job</h1>
          <p className="text-gray-600">
            Update your vacancy information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Minimum 5 characters' },
                    maxLength: { value: 100, message: 'Maximum 100 characters' }
                  })}
                  className={`input ${errors.title ? 'border-danger-500' : ''}`}
                  placeholder="E.g: Part-Time Sales Assistant"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 50, message: 'Minimum 50 characters' },
                    maxLength: { value: 2000, message: 'Maximum 2000 characters' }
                  })}
                  rows={6}
                  className={`textarea ${errors.description ? 'border-danger-500' : ''}`}
                  placeholder="Describe the responsibilities, work environment, and what makes this position special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    {...register('employmentType', { required: 'Employment type is required' })}
                    className={`select ${errors.employmentType ? 'border-danger-500' : ''}`}
                  >
                    {employmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType && (
                    <p className="mt-1 text-sm text-danger-600">{errors.employmentType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    {...register('category', { required: 'La categoría es requerida' })}
                    className={`select ${errors.category ? 'border-danger-500' : ''}`}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    {...register('status')}
                    className="select"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ubicación</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    {...register('location.city', { required: 'La ciudad es requerida' })}
                    className={`input ${errors['location.city'] ? 'border-danger-500' : ''}`}
                    placeholder="Ciudad"
                  />
                  {errors['location.city'] && (
                    <p className="mt-1 text-sm text-danger-600">{errors['location.city'].message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    {...register('location.state', { required: 'El estado es requerido' })}
                    className={`input ${errors['location.state'] ? 'border-danger-500' : ''}`}
                    placeholder="Estado"
                  />
                  {errors['location.state'] && (
                    <p className="mt-1 text-sm text-danger-600">{errors['location.state'].message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  {...register('location.address', { required: 'La dirección es requerida' })}
                  className={`input ${errors['location.address'] ? 'border-danger-500' : ''}`}
                  placeholder="Dirección completa"
                />
                {errors['location.address'] && (
                  <p className="mt-1 text-sm text-danger-600">{errors['location.address'].message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  {...register('location.zipCode')}
                  className="input"
                  placeholder="Código postal"
                />
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    {...register('location.isRemote')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remote Work</span>
                </label>

                <label className="flex items-center">
                  <input
                    {...register('location.isHybrid')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hybrid Work</span>
                </label>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Salario</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario Mínimo
                  </label>
                  <input
                    {...register('salary.min', { 
                      min: { value: 0, message: 'El salario mínimo no puede ser negativo' }
                    })}
                    type="number"
                    className={`input ${errors['salary.min'] ? 'border-danger-500' : ''}`}
                    placeholder="0"
                  />
                  {errors['salary.min'] && (
                    <p className="mt-1 text-sm text-danger-600">{errors['salary.min'].message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario Máximo
                  </label>
                  <input
                    {...register('salary.max', { 
                      min: { value: 0, message: 'El salario máximo no puede ser negativo' }
                    })}
                    type="number"
                    className={`input ${errors['salary.max'] ? 'border-danger-500' : ''}`}
                    placeholder="0"
                  />
                  {errors['salary.max'] && (
                    <p className="mt-1 text-sm text-danger-600">{errors['salary.max'].message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    {...register('salary.period')}
                    className="select"
                  >
                    {salaryPeriods.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('salary.isNegotiable')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Salario negociable</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Horario</h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  {...register('schedule.flexible')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Horario flexible</span>
              </div>

              {!watch('schedule.flexible') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      {...register('schedule.startTime')}
                      type="time"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fin
                    </label>
                    <input
                      {...register('schedule.endTime')}
                      type="time"
                      className="input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {days.map(day => (
                    <label key={day.value} className="flex items-center">
                      <input
                        {...register('schedule.days')}
                        type="checkbox"
                        value={day.value}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Requisitos</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos (uno por línea) *
                </label>
                <textarea
                  {...register('requirements', { 
                    required: 'Al menos un requisito es requerido'
                  })}
                  rows={4}
                  className={`textarea ${errors.requirements ? 'border-danger-500' : ''}`}
                  placeholder="Ejemplo:&#10;• Estudiantes de 3er semestre en adelante&#10;• Disponibilidad de medio tiempo&#10;• Buenas habilidades de comunicación&#10;• Experiencia en ventas (deseable)"
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-danger-600">{errors.requirements.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Escribe cada requisito en una línea separada, comenzando con • o -
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información Adicional</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsabilidades (opcional)
                </label>
                <textarea
                  {...register('responsibilities')}
                  rows={4}
                  className="textarea"
                  placeholder="Describe las principales responsabilidades del puesto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficios (opcional)
                </label>
                <textarea
                  {...register('benefits')}
                  rows={4}
                  className="textarea"
                  placeholder="Menciona los beneficios que ofrece el puesto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas (opcional)
                </label>
                <input
                  {...register('tags')}
                  className="input"
                  placeholder="JavaScript, Python, Comunicación, Liderazgo..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separa las etiquetas con comas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Límite de Aplicación
                  </label>
                  <input
                    {...register('applicationDeadline')}
                    type="date"
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('requiresCoverLetter')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Requerir carta de presentación</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="btn btn-outline btn-lg"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
            >
              {saving ? (
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
    </div>
  );
};

export default EditJob;
