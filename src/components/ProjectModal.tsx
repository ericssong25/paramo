import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Users, 
  Target,
  Clock,
  Link,
  Plus,
  Trash2
} from 'lucide-react';
import { Project, ProjectType, ProjectStatus, User as UserType, Milestone } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  users: UserType[];
  project?: Project;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  users,
  project
}) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#3B82F6',
    type: project?.type || 'finite' as ProjectType,
    status: project?.status || 'planning' as ProjectStatus,
    client: project?.client || '',
    projectLeadId: project?.projectLead?.id || '',
    objective: project?.objective || '',
    scope: project?.scope || [''],
    finalDueDate: project?.finalDueDate ? project.finalDueDate.toISOString().split('T')[0] : '',
    serviceCycle: project?.serviceCycle || 'monthly',
    reportingDay: project?.reportingDay || 1,
    monthlyDeliverables: project?.monthlyDeliverables || [''],
    driveLink: project?.driveLink || '',
    milestones: project?.milestones || [] as Milestone[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'El cliente es requerido';
    }

    if (formData.type === 'finite' && !formData.finalDueDate) {
      newErrors.finalDueDate = 'La fecha de entrega es requerida para proyectos finitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 ProjectModal: Iniciando envío de formulario...');
    console.log('📋 Datos del formulario:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validación fallida, errores:', errors);
      return;
    }

    const projectLead = users.find(u => u.id === formData.projectLeadId);
    console.log('👤 Project Lead encontrado:', projectLead);
    
    const projectData: Partial<Project> = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      type: formData.type,
      status: formData.status,
      client: formData.client,
      projectLead,
      objective: formData.objective,
      scope: formData.scope.filter(item => item.trim()),
      finalDueDate: formData.finalDueDate ? new Date(formData.finalDueDate) : undefined,
      serviceCycle: formData.type === 'recurring' ? formData.serviceCycle : undefined,
      reportingDay: formData.type === 'recurring' ? formData.reportingDay : undefined,
      monthlyDeliverables: formData.type === 'recurring' ? formData.monthlyDeliverables.filter(item => item.trim()) : undefined,
      driveLink: formData.driveLink,
      milestones: formData.milestones,
      updatedAt: new Date()
    };

    if (!project) {
      projectData.createdAt = new Date();
      projectData.id = Date.now().toString();
      projectData.members = projectLead ? [projectLead] : [];
      projectData.taskCount = 0;
      projectData.completedTasks = 0;
    }

    console.log('📤 ProjectModal: Enviando datos del proyecto:', projectData);
    console.log('📤 ProjectModal: Llamando a onSave...');

    onSave(projectData);
    onClose();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addScopeItem = () => {
    setFormData(prev => ({
      ...prev,
      scope: [...prev.scope, '']
    }));
  };

  const removeScopeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index)
    }));
  };

  const updateScopeItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.map((item, i) => i === index ? value : item)
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      monthlyDeliverables: [...prev.monthlyDeliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      monthlyDeliverables: prev.monthlyDeliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      monthlyDeliverables: prev.monthlyDeliverables.map((item, i) => i === index ? value : item)
    }));
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Rediseño de sitio web"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => updateFormData('client', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.client ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del cliente"
              />
              {errors.client && <p className="text-red-500 text-sm mt-1">{errors.client}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Descripción breve del proyecto"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Tipo de Proyecto */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="finite"
                  checked={formData.type === 'finite'}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Proyecto Finito</div>
                  <div className="text-sm text-gray-500">Con fecha de entrega específica</div>
                </div>
              </label>
              
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="recurring"
                  checked={formData.type === 'recurring'}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Servicio Recurrente</div>
                  <div className="text-sm text-gray-500">Gestión mensual continua</div>
                </div>
              </label>
            </div>
          </div>

          {/* Configuración del Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planificación</option>
                <option value="in-progress">En Curso</option>
                <option value="paused">Pausado</option>
                <option value="completed">Completado</option>
                {formData.type === 'recurring' && (
                  <option value="recurring-active">Recurrente Activo</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Líder del Proyecto
              </label>
              <select
                value={formData.projectLeadId}
                onChange={(e) => updateFormData('projectLeadId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar líder</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color del Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color del Proyecto
            </label>
            <div className="flex space-x-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateFormData('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Campos específicos por tipo de proyecto */}
          {formData.type === 'finite' ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Planificación del Proyecto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo Principal
                  </label>
                  <textarea
                    value={formData.objective}
                    onChange={(e) => updateFormData('objective', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="¿Cuál es el objetivo principal de este proyecto?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Entrega Final *
                  </label>
                  <input
                    type="date"
                    value={formData.finalDueDate}
                    onChange={(e) => updateFormData('finalDueDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.finalDueDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.finalDueDate && <p className="text-red-500 text-sm mt-1">{errors.finalDueDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcance y Entregables
                  </label>
                  {formData.scope.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateScopeItem(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Entregable del proyecto"
                      />
                      {formData.scope.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScopeItem(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addScopeItem}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar entregable
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Servicio Recurrente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciclo de Servicio
                  </label>
                  <select
                    value={formData.serviceCycle}
                    onChange={(e) => updateFormData('serviceCycle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="weekly">Semanal</option>
                    <option value="quarterly">Trimestral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día de Reporte (del mes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.reportingDay}
                    onChange={(e) => updateFormData('reportingDay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entregables Mensuales
                </label>
                {formData.monthlyDeliverables.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Entregable mensual"
                    />
                    {formData.monthlyDeliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar entregable
                </button>
              </div>
            </div>
          )}

          {/* Enlace a Drive */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 inline mr-2" />
              Enlace a Google Drive
            </label>
            <input
              type="url"
              value={formData.driveLink}
              onChange={(e) => updateFormData('driveLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
