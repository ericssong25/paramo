import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  User,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  FileText,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Check,
  History,
  TrendingUp,
  Shield,
  Key,
  Lock
} from 'lucide-react';
import { Subscription } from '../types';
import { usePinSecurity } from '../hooks/usePinSecurity';
import PinModal from './PinModal';
import CredentialEditModal from './CredentialEditModal';

interface SubscriptionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscriptionId: string) => void;
  onUpdateCredentials?: (subscriptionId: string, credentials: { username: string; password?: string }) => Promise<void>;
}

const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onEdit,
  onDelete,
  onUpdateCredentials
}) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [showCredentialEditModal, setShowCredentialEditModal] = useState(false);
  
  const { isPinSet, isAuthenticated, setPin, verifyPin, resetAuthentication } = usePinSecurity();

  // Al abrir/cambiar de suscripción, reiniciar visibilidad y autenticación
  useEffect(() => {
    if (isOpen) {
      setShowCredentials(false);
      resetAuthentication();
    }
  }, [isOpen, subscription?.id]);

  if (!isOpen || !subscription) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getSubscriptionTypeText = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
      case 'quarterly':
        return 'Trimestral';
      case 'semiannual':
        return 'Semestral';
      case 'annual':
        return 'Anual';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(subscription.nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

  const handleShowCredentials = () => {
    if (!isPinSet) {
      setIsSettingPin(true);
      setShowPinModal(true);
      return;
    }

    // Siempre solicitar PIN (no reutilizar autenticación previa)
    setIsSettingPin(false);
    setShowPinModal(true);
  };

  const maskUsername = (username: string) => {
    if (username.length <= 3) return username;
    const visibleChars = Math.max(2, Math.floor(username.length * 0.3));
    return username.substring(0, visibleChars) + '•'.repeat(username.length - visibleChars);
  };

  const handlePinVerify = (pin: string): boolean => {
    const isValid = verifyPin(pin);
    if (isValid) {
      setShowCredentials(true);
    }
    return isValid;
  };

  const handlePinSet = (pin: string) => {
    setPin(pin);
    setShowCredentials(true);
  };

  const handlePinModalClose = () => {
    setShowPinModal(false);
    setIsSettingPin(false);
  };

  const handleCredentialEdit = () => {
    setShowCredentialEditModal(true);
  };

  const handleCredentialEditClose = () => {
    setShowCredentialEditModal(false);
  };

  const handleCredentialEditSave = async (credentials: { username: string; password?: string }) => {
    if (!subscription || !onUpdateCredentials) return;
    
    try {
      await onUpdateCredentials(subscription.id, credentials);
      setShowCredentialEditModal(false);
      // Assuming showSnackbar and showSnackbar are defined elsewhere or will be added.
      // For now, we'll just log the success.
      console.log('Credenciales actualizadas correctamente');
    } catch (error) {
      console.error('Error al actualizar credenciales:', error);
      // Assuming showSnackbar and showSnackbar are defined elsewhere or will be added.
      // For now, we'll just log the error.
      console.error('Error al actualizar credenciales', error);
    }
  };

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
                {subscription.serviceName}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusIcon(subscription.status)}
                <span className="text-sm text-gray-500">
                  {getStatusText(subscription.status)}
                </span>
                {subscription.alerts && (
                  <Bell className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(subscription)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar suscripción"
              >
                <Edit className="w-5 h-5 text-blue-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(subscription.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Eliminar suscripción"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alertas de vencimiento */}
          {(isOverdue || isDueSoon) && (
            <div className={`p-4 rounded-lg border-l-4 ${
              isOverdue 
                ? 'bg-red-50 border-red-400 text-red-700' 
                : 'bg-yellow-50 border-yellow-400 text-yellow-700'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  {isOverdue 
                    ? `¡Vencida hace ${Math.abs(daysUntilDue)} días!` 
                    : `Vence en ${daysUntilDue} días`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Información Básica</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Costo</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(subscription.cost, subscription.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Tipo</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {getSubscriptionTypeText(subscription.subscriptionType)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Responsable</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.responsible.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.responsible.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">Método de Pago</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {subscription.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Fechas Importantes</span>
              </h3>

              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-l-4 ${
                  isOverdue 
                    ? 'bg-red-50 border-red-400' 
                    : isDueSoon 
                    ? 'bg-yellow-50 border-yellow-400' 
                    : 'bg-gray-50 border-gray-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Próximo Vencimiento</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-700' : isDueSoon ? 'text-yellow-700' : 'text-gray-900'
                    }`}>
                      {formatDate(subscription.nextDueDate)}
                    </span>
                  </div>
                  {isOverdue && (
                    <div className="mt-1 text-xs text-red-600">
                      Vencida hace {Math.abs(daysUntilDue)} días
                    </div>
                  )}
                  {isDueSoon && !isOverdue && (
                    <div className="mt-1 text-xs text-yellow-600">
                      Vence en {daysUntilDue} días
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Última Renovación</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatDate(subscription.lastRenewalDate)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Creada</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatDate(subscription.createdAt)}
                    </span>
                  </div>
                </div>
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
              {subscription.managementUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">URL de Administración</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyToClipboard(subscription.managementUrl!, 'url')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copiar URL"
                      >
                        {copiedField === 'url' ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                      <a
                        href={subscription.managementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Abrir en nueva pestaña"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-600" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 break-all">
                    {subscription.managementUrl}
                  </p>
                </div>
              )}

              {/* Credenciales de Acceso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Credenciales de Acceso</span>
                    {isPinSet && (
                      <div className="flex items-center space-x-1">
                        <Lock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Protegido</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShowCredentials}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Ver credenciales"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {showCredentials && (
                      <button
                        onClick={handleCredentialEdit}
                        className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar credenciales"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {subscription.accessCredentials ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      {/* Usuario */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Usuario:</span>
                          {showCredentials && (
                            <button
                              onClick={() => copyToClipboard(subscription.accessCredentials!.username, 'cred-username')}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copiar usuario"
                            >
                              {copiedField === 'cred-username' ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-500" />
                              )}
                            </button>
                          )}
                        </div>
                        <p className={`text-sm break-all ${
                          showCredentials ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {showCredentials ? subscription.accessCredentials.username : maskUsername(subscription.accessCredentials.username)}
                        </p>
                      </div>

                      {/* Contraseña */}
                      {subscription.accessCredentials.password && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Contraseña:</span>
                            {showCredentials && (
                              <button
                                onClick={() => copyToClipboard(subscription.accessCredentials!.password!, 'cred-password')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copiar contraseña"
                              >
                                {copiedField === 'cred-password' ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-500" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className={`text-sm break-all ${
                            showCredentials ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {showCredentials ? subscription.accessCredentials.password : '••••••••••••••••'}
                          </p>
                        </div>
                      )}
                    </div>
                    {!isPinSet && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700">
                            Configura un PIN para proteger las credenciales
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">No hay credenciales configuradas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            {subscription.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Notas</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {subscription.notes}
                </p>
              </div>
            )}

            {/* Alertas */}
            {subscription.alerts && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Alertas activadas
                  </span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Recibirás notificaciones antes del vencimiento de esta suscripción.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={handlePinModalClose}
        onVerify={handlePinVerify}
        onSetPin={isSettingPin ? handlePinSet : undefined}
        isSettingPin={isSettingPin}
      />

      {/* Credential Edit Modal */}
      <CredentialEditModal
        isOpen={showCredentialEditModal}
        onClose={handleCredentialEditClose}
        onSave={handleCredentialEditSave}
        currentCredentials={subscription?.accessCredentials || null}
        serviceName={subscription?.serviceName || ''}
        loading={false}
      />
    </div>
  );
};

export default SubscriptionDetailModal;
