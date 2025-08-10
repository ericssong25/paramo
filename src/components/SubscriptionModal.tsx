import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  User,
  AlertTriangle,
  ExternalLink,
  Globe,
  FileText,
  Bell,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { Subscription, SubscriptionStatus, SubscriptionType } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  subscription?: Subscription | null;
  profiles: Array<{ id: string; name: string; email: string; avatar?: string; role: string }>;
  projects: Array<{ id: string; name: string; description?: string }>;
  loading?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscription,
  profiles,
  projects,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    serviceName: '',
    subscriptionType: 'monthly' as SubscriptionType,
    currency: 'USD',
    status: 'active' as SubscriptionStatus,
    lastRenewalDate: '',
    nextDueDate: '',
    paymentMethod: '',
    responsibleId: '',
    notes: '',
    alerts: false,
    managementUrl: '',
    cost: '',
    projectId: '',
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (subscription) {
        // Modo edición
        setFormData({
          serviceName: subscription.serviceName,
          subscriptionType: subscription.subscriptionType,
          currency: subscription.currency,
          status: subscription.status,
          lastRenewalDate: subscription.lastRenewalDate.toISOString().split('T')[0],
          nextDueDate: subscription.nextDueDate.toISOString().split('T')[0],
          paymentMethod: subscription.paymentMethod,
          responsibleId: subscription.responsible.id,
          notes: subscription.notes || '',
          alerts: subscription.alerts,
          managementUrl: subscription.managementUrl || '',
          cost: subscription.cost.toString(),
          projectId: subscription.projectId || '',
          username: subscription.accessCredentials?.username || '',
          password: subscription.accessCredentials?.password || ''
        });
      } else {
        // Modo creación
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          serviceName: '',
          subscriptionType: 'monthly',
          currency: 'USD',
          status: 'active',
          lastRenewalDate: today,
          nextDueDate: today,
          paymentMethod: '',
          responsibleId: profiles[0]?.id || '',
          notes: '',
          alerts: false,
          managementUrl: '',
          cost: '',
          projectId: '',
          username: '',
          password: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, subscription]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'El nombre del servicio es requerido';
    }

    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = 'El método de pago es requerido';
    }

    if (!formData.responsibleId) {
      newErrors.responsibleId = 'Debe seleccionar un responsable';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'El costo debe ser mayor a 0';
    }

    if (!formData.lastRenewalDate) {
      newErrors.lastRenewalDate = 'La fecha de renovación es requerida';
    }

    if (!formData.nextDueDate) {
      newErrors.nextDueDate = 'La fecha de vencimiento es requerida';
    }

    if (formData.managementUrl && !isValidUrl(formData.managementUrl)) {
      newErrors.managementUrl = 'Debe ser una URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const responsible = profiles.find(p => p.id === formData.responsibleId);
      if (!responsible) {
        throw new Error('Responsable no encontrado');
      }

      await onSave({
        serviceName: formData.serviceName.trim(),
        subscriptionType: formData.subscriptionType,
        currency: formData.currency,
        status: formData.status,
        lastRenewalDate: new Date(formData.lastRenewalDate),
        nextDueDate: new Date(formData.nextDueDate),
        paymentMethod: formData.paymentMethod.trim(),
        responsible: {
          id: responsible.id,
          name: responsible.name,
          email: responsible.email,
          avatar: responsible.avatar || '',
          role: responsible.role
        },
        notes: formData.notes.trim() || undefined,
        alerts: formData.alerts,
        managementUrl: formData.managementUrl.trim() || undefined,
        accessCredentials: {
          username: formData.username.trim(),
          password: formData.password.trim() || undefined
        },
        cost: parseFloat(formData.cost),
        projectId: formData.projectId || undefined
      });

      onClose();
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {subscription ? 'Editar Suscripción' : 'Nueva Suscripción'}
              </h2>
              <p className="text-sm text-gray-500">
                {subscription ? 'Modifica los datos de la suscripción' : 'Agrega una nueva suscripción al sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Información Básica</span>
              </h3>

              {/* Nombre del Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Netflix, Spotify, Adobe Creative Cloud"
                />
                {errors.serviceName && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceName}</p>
                )}
              </div>

              {/* Tipo de Suscripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Suscripción
                </label>
                <select
                  value={formData.subscriptionType}
                  onChange={(e) => handleInputChange('subscriptionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semiannual">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="expired">Expirada</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.cost ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="COP">COP ($)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
            </div>

            {/* Fechas y Responsable */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Fechas y Responsable</span>
              </h3>

              {/* Fecha de Renovación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Última Renovación *
                </label>
                <input
                  type="date"
                  value={formData.lastRenewalDate}
                  onChange={(e) => handleInputChange('lastRenewalDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastRenewalDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastRenewalDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastRenewalDate}</p>
                )}
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Vencimiento *
                </label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nextDueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nextDueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextDueDate}</p>
                )}
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <input
                  type="text"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Tarjeta Visa ****1234, PayPal, Transferencia"
                />
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable *
                </label>
                <select
                  value={formData.responsibleId}
                  onChange={(e) => handleInputChange('responsibleId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.responsibleId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar responsable</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} ({profile.email})
                    </option>
                  ))}
                </select>
                {errors.responsibleId && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsibleId}</p>
                )}
              </div>

              {/* Proyecto (Opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proyecto (Opcional)
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Información Adicional</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* URL de Administración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Administración
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.managementUrl}
                    onChange={(e) => handleInputChange('managementUrl', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.managementUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://ejemplo.com/admin"
                  />
                </div>
                {errors.managementUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.managementUrl}</p>
                )}
              </div>

              {/* Alertas */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.alerts}
                    onChange={(e) => handleInputChange('alerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span>Activar alertas</span>
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Recibir notificaciones antes del vencimiento
                </p>
              </div>
            </div>



            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional, recordatorios, etc."
              />
            </div>
          </div>

          {/* Credenciales de Acceso - Solo mostrar en creación */}
          {!subscription && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  Credenciales de Acceso
                </h3>
              </div>
              
              {/* Nombre de Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="admin, usuario@empresa.com, etc."
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.username, 'username')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === 'username' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pr-20 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contraseña (opcional)"
                  />
                  <div className="absolute right-3 top-2.5 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.password, 'password')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Contraseña de acceso (opcional si el método de acceso es diferente)
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : (subscription ? 'Actualizar' : 'Crear')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;
