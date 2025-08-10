import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  User,
  AlertTriangle,
  ExternalLink,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  Key,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { Subscription, SubscriptionStatus } from '../types';
import SubscriptionModal from './SubscriptionModal';
import SubscriptionDetailModal from './SubscriptionDetailModal';
import { usePinSecurity } from '../hooks/usePinSecurity';
import PinModal from './PinModal';
import CredentialViewModal from './CredentialViewModal';
import CredentialEditModal from './CredentialEditModal';

interface SubscriptionDashboardProps {
  subscriptions: Subscription[];
  loading?: boolean;
  profiles: Array<{ id: string; name: string; email: string; avatar?: string; role: string }>;
  projects: Array<{ id: string; name: string; description?: string }>;
  onAddSubscription?: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEditSubscription?: (id: string, updates: Partial<Subscription>) => Promise<void>;
  onDeleteSubscription?: (subscriptionId: string) => Promise<void>;
  onViewSubscription?: (subscription: Subscription) => void;
  onUpdateCredentials?: (subscriptionId: string, credentials: { username: string; password?: string }) => Promise<void>;
}

const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  subscriptions,
  loading = false,
  profiles,
  projects,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onViewSubscription,
  onUpdateCredentials,
}) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [showPinModal, setShowPinModal] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCredentialViewModal, setShowCredentialViewModal] = useState(false);
  const [credentialSubscription, setCredentialSubscription] = useState<Subscription | null>(null);
  const [showCredentialEditModal, setShowCredentialEditModal] = useState(false);
  
  const { isPinSet, isAuthenticated, setPin, verifyPin, resetAuthentication } = usePinSecurity();

  const filtered = useMemo(() => {
    let filtered = subscriptions;
    
    // Filtrar por búsqueda
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(s => 
        s.serviceName.toLowerCase().includes(q) ||
        s.paymentMethod.toLowerCase().includes(q) ||
        s.responsible.name.toLowerCase().includes(q)
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    return filtered;
  }, [subscriptions, query, statusFilter]);

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isOverdue = (nextDueDate: Date) => {
    return new Date(nextDueDate) < new Date();
  };

  // Funciones para manejar modales
  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
  };

  const handleSaveSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setModalLoading(true);
      if (editingSubscription) {
        await onEditSubscription?.(editingSubscription.id, subscriptionData);
      } else {
        await onAddSubscription?.(subscriptionData);
      }
      setIsModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error('Error saving subscription:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) {
      try {
        await onDeleteSubscription?.(subscriptionId);
        setIsDetailModalOpen(false);
        setSelectedSubscription(null);
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShowCredentials = (subscriptionId: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    // Siempre establecer la suscripción primero
    setCredentialSubscription(subscription);

    // Siempre requerir PIN si hay PIN configurado
    if (!isPinSet) {
      setIsSettingPin(true);
      setShowPinModal(true);
      return;
    }

    // Requerir verificación de PIN en cada intento
    setIsSettingPin(false);
    setShowPinModal(true);
  };

  const handlePinVerify = (pin: string): boolean => {
    const isValid = verifyPin(pin);
    if (isValid) {
      setShowPinModal(false);
      if (credentialSubscription) {
        setShowCredentialViewModal(true);
      }
    }
    return isValid;
  };

  const handlePinSet = (pin: string) => {
    setPin(pin);
    setShowPinModal(false);
    if (credentialSubscription) {
      setShowCredentialViewModal(true);
    }
  };

  const handlePinModalClose = () => {
    setShowPinModal(false);
    setIsSettingPin(false);
    // Importante: no limpiar credentialSubscription aquí para no romper la primera visualización
  };

  const handleCredentialEdit = () => {
    setShowCredentialViewModal(false);
    setShowCredentialEditModal(true);
  };

  const handleCredentialEditClose = () => {
    setShowCredentialEditModal(false);
    setCredentialSubscription(null);
  };

  const handleCredentialEditSave = async (credentials: { username: string; password?: string }) => {
    if (!credentialSubscription || !onUpdateCredentials) return;
    
    try {
      await onUpdateCredentials(credentialSubscription.id, credentials);
      setShowCredentialEditModal(false);
      setCredentialSubscription(null);
    } catch (error) {
      console.error('Error al actualizar credenciales:', error);
    }
  };

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{subscription.serviceName}</h3>
            {subscription.alerts && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(subscription.status)}`}>
              {getStatusIcon(subscription.status)}
              <span>{subscription.status}</span>
            </span>
            <span className="text-xs text-gray-500 capitalize">{subscription.subscriptionType}</span>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewSubscription(subscription)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditSubscription(subscription)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteSubscription(subscription.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Cost:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subscription.cost, subscription.currency)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Renewed:</span>
          <span className="text-gray-900">{formatDate(subscription.lastRenewalDate)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Due:</span>
          <span className={`font-medium ${isOverdue(subscription.nextDueDate) ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDate(subscription.nextDueDate)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Responsible:</span>
          <span className="text-gray-900 truncate">{subscription.responsible.name}</span>
        </div>
      </div>

      {subscription.managementUrl && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={subscription.managementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Manage</span>
          </a>
        </div>
      )}

      {/* Credenciales de Acceso */}
      {subscription.accessCredentials && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Credenciales</span>
              {isPinSet && (
                <div className="flex items-center space-x-1">
                  <Lock className="w-2 h-2 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Protegido</span>
                </div>
              )}
            </div>
            <button
              onClick={() => handleShowCredentials(subscription.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Ver credenciales"
            >
              <Eye className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          {!isPinSet && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="w-2 h-2 text-blue-600" />
                <span className="text-xs text-blue-700">
                  Configura un PIN para ver credenciales
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const SubscriptionListItem = ({ subscription }: { subscription: Subscription }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="font-semibold text-gray-900">{subscription.serviceName}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(subscription.status)}`}>
                {getStatusIcon(subscription.status)}
                <span>{subscription.status}</span>
              </span>
              {subscription.alerts && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="capitalize">{subscription.subscriptionType}</span>
              <span>•</span>
              <span>{subscription.paymentMethod}</span>
              <span>•</span>
              <span>{subscription.responsible.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatCurrency(subscription.cost, subscription.currency)}
            </div>
            <div className="text-gray-500">Cost</div>
          </div>
          
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatDate(subscription.lastRenewalDate)}
            </div>
            <div className="text-gray-500">Renewed</div>
          </div>
          
          <div className="text-right">
            <div className={`font-medium ${isOverdue(subscription.nextDueDate) ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(subscription.nextDueDate)}
            </div>
            <div className="text-gray-500">Due</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => handleShowCredentials(subscription.id)}
            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
            title="Ver credenciales"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewSubscription(subscription)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditSubscription(subscription)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteSubscription(subscription.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <button
            onClick={handleAddSubscription}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="text-gray-500">Loading subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-500 mb-4">
              {query || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first subscription'
              }
            </p>
            {!query && statusFilter === 'all' && (
              <button
                onClick={handleAddSubscription}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subscription</span>
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            {filtered.map(subscription => (
              viewMode === 'grid' 
                ? <SubscriptionCard key={subscription.id} subscription={subscription} />
                : <SubscriptionListItem key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
        profiles={profiles}
        projects={projects}
        loading={modalLoading}
      />

      <SubscriptionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onEdit={handleEditSubscription}
        onDelete={handleDeleteSubscription}
        onUpdateCredentials={onUpdateCredentials}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={handlePinModalClose}
        onVerify={handlePinVerify}
        onSetPin={isSettingPin ? handlePinSet : undefined}
        isSettingPin={isSettingPin}
      />

      {/* Credential View Modal */}
      <CredentialViewModal
        isOpen={showCredentialViewModal}
        onClose={() => {
          setShowCredentialViewModal(false);
          setCredentialSubscription(null);
        }}
        credentials={credentialSubscription?.accessCredentials || null}
        serviceName={credentialSubscription?.serviceName || ''}
        onEdit={handleCredentialEdit}
      />

      {/* CredentialEditModal */}
      <CredentialEditModal
        isOpen={showCredentialEditModal}
        onClose={handleCredentialEditClose}
        onSave={handleCredentialEditSave}
        currentCredentials={credentialSubscription?.accessCredentials || null}
        serviceName={credentialSubscription?.serviceName || ''}
        loading={false}
      />
    </div>
  );
};

export default SubscriptionDashboard;
