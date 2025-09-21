import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, DollarSign, CalendarDays, ArrowRightLeft, ArrowRight, Wallet, CreditCard, Smartphone, Coins, Check } from 'lucide-react';

type TxType = 'income' | 'expense' | 'transfer';
type TxStatus = 'pending' | 'cleared' | 'reconciled';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: string;
  projects?: { id: string; name: string; color?: string }[];
  wallets?: { id: string; name: string; display_name: string; currency: string; balance?: number }[];
  onSave: (tx: {
    type: TxType;
    amount: number;
    currency: string;
    date: string; // YYYY-MM-DD
    status: TxStatus;
    notes?: string;
    projectId?: string;
    walletId?: string;
    fromWalletId?: string;
    toWalletId?: string;
  }) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, baseCurrency, onSave, projects = [], wallets = [] }) => {
  const [type, setType] = useState<TxType>('income');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TxStatus>('pending');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [currency, setCurrency] = useState<string>(baseCurrency);
  const [walletId, setWalletId] = useState<string>('');
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [showFromWalletModal, setShowFromWalletModal] = useState(false);
  const [showToWalletModal, setShowToWalletModal] = useState(false);

  // Helper functions para wallets
  const getWalletIcon = (walletName: string) => {
    switch (walletName) {
      case 'cash': return Wallet;
      case 'binance': return CreditCard;
      case 'zinli': return Smartphone;
      case 'bolivares': return Coins;
      default: return Wallet;
    }
  };

  const getWalletColors = (walletName: string) => {
    switch (walletName) {
      case 'cash': return {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        iconBg: 'bg-green-500',
        text: 'text-green-900',
        textSecondary: 'text-green-700'
      };
      case 'binance': return {
        bg: 'from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-500',
        text: 'text-yellow-900',
        textSecondary: 'text-yellow-700'
      };
      case 'zinli': return {
        bg: 'from-purple-50 to-purple-100',
        border: 'border-purple-200',
        iconBg: 'bg-purple-500',
        text: 'text-purple-900',
        textSecondary: 'text-purple-700'
      };
      case 'bolivares': return {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500',
        text: 'text-blue-900',
        textSecondary: 'text-blue-700'
      };
      default: return {
        bg: 'from-gray-50 to-gray-100',
        border: 'border-gray-200',
        iconBg: 'bg-gray-500',
        text: 'text-gray-900',
        textSecondary: 'text-gray-700'
      };
    }
  };

  const getSelectedWallet = (walletId: string) => {
    return wallets.find(w => w.id === walletId);
  };

  const formatBalance = (balance: number | undefined, currency: string) => {
    if (balance === undefined) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const getFromWalletBalance = () => {
    if (!fromWalletId) return 0;
    const wallet = getSelectedWallet(fromWalletId);
    return wallet?.balance || 0;
  };

  const canTransfer = () => {
    if (type !== 'transfer') return true;
    const transferAmount = parseFloat(amount || '0');
    const availableBalance = getFromWalletBalance();
    return transferAmount <= availableBalance;
  };

  if (!isOpen) return null;
  // Pre-select project if only one provided
  React.useEffect(() => {
    if (projects && projects.length === 1) {
      setProjectId(projects[0].id);
    }
  }, [projects, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount || '0');
    if (!value || value <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    // Validaciones específicas por tipo
    if (type === 'transfer') {
      if (!fromWalletId || !toWalletId) {
        setError('Debe seleccionar wallets origen y destino');
        return;
      }
      if (fromWalletId === toWalletId) {
        setError('Los wallets origen y destino deben ser diferentes');
        return;
      }
      if (!canTransfer()) {
        const availableBalance = getFromWalletBalance();
        const fromWallet = getSelectedWallet(fromWalletId);
        setError(`Saldo insuficiente. Disponible: ${formatBalance(availableBalance, fromWallet?.currency || 'USD')}`);
        return;
      }
    } else if (type === 'income' || type === 'expense') {
      if (!walletId) {
        setError('Debe seleccionar un wallet');
        return;
      }
    }

    onSave({ 
      type, 
      amount: value, 
      currency, 
      date, 
      status, 
      notes: notes?.trim() || undefined, 
      projectId: projectId || undefined,
      walletId: type === 'transfer' ? undefined : walletId,
      fromWalletId: type === 'transfer' ? fromWalletId : undefined,
      toWalletId: type === 'transfer' ? toWalletId : undefined
    });
    
    onClose();
    // reset para próximas altas
    setType('income');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setStatus('pending');
    setNotes('');
    setError('');
    setCurrency(baseCurrency);
    setWalletId('');
    setFromWalletId('');
    setToWalletId('');
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nueva transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => setType('income')} className={`px-4 py-2 text-sm ${type==='income' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>Ingreso</button>
                <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 text-sm border-l border-gray-200 ${type==='expense' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}>Egreso</button>
                <button type="button" onClick={() => setType('transfer')} className={`px-4 py-2 text-sm border-l border-gray-200 ${type==='transfer' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>Transferencia</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={`w-full rounded-lg border px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-200'}`} />
              </div>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
          </div>

          {/* Campos condicionales según el tipo */}
          {type === 'transfer' ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferencia entre Wallets</h3>
              </div>
              
              {/* Selector visual de wallets */}
              <div className="flex items-center justify-center space-x-8">
                {/* Wallet Origen */}
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-sm font-medium text-gray-700">Desde</label>
                  <button
                    type="button"
                    onClick={() => setShowFromWalletModal(true)}
                    className={`relative w-32 h-20 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      fromWalletId 
                        ? `${getWalletColors(getSelectedWallet(fromWalletId)?.name || '').bg} ${getWalletColors(getSelectedWallet(fromWalletId)?.name || '').border} border-2` 
                        : 'bg-gray-50 border-gray-200 border-2 border-dashed hover:border-gray-300'
                    }`}
                  >
                    {fromWalletId ? (
                      <>
                        <div className="flex flex-col items-center justify-center h-full p-2">
                          <div className={`p-2 rounded-lg mb-1 ${getWalletColors(getSelectedWallet(fromWalletId)?.name || '').iconBg}`}>
                            {React.createElement(getWalletIcon(getSelectedWallet(fromWalletId)?.name || ''), { 
                              className: `w-4 h-4 text-white` 
                            })}
                          </div>
                          <span className={`text-xs font-medium ${getWalletColors(getSelectedWallet(fromWalletId)?.name || '').text}`}>
                            {getSelectedWallet(fromWalletId)?.display_name}
                          </span>
                          <span className={`text-xs ${getWalletColors(getSelectedWallet(fromWalletId)?.name || '').textSecondary}`}>
                            {formatBalance(getSelectedWallet(fromWalletId)?.balance, getSelectedWallet(fromWalletId)?.currency || 'USD')}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-1">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Seleccionar</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Flecha direccional */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">Transferir</span>
                </div>

                {/* Wallet Destino */}
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hacia</label>
                  <button
                    type="button"
                    onClick={() => setShowToWalletModal(true)}
                    className={`relative w-32 h-20 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      toWalletId 
                        ? `${getWalletColors(getSelectedWallet(toWalletId)?.name || '').bg} ${getWalletColors(getSelectedWallet(toWalletId)?.name || '').border} border-2` 
                        : 'bg-gray-50 border-gray-200 border-2 border-dashed hover:border-gray-300'
                    }`}
                  >
                    {toWalletId ? (
                      <>
                        <div className="flex flex-col items-center justify-center h-full p-2">
                          <div className={`p-2 rounded-lg mb-1 ${getWalletColors(getSelectedWallet(toWalletId)?.name || '').iconBg}`}>
                            {React.createElement(getWalletIcon(getSelectedWallet(toWalletId)?.name || ''), { 
                              className: `w-4 h-4 text-white` 
                            })}
                          </div>
                          <span className={`text-xs font-medium ${getWalletColors(getSelectedWallet(toWalletId)?.name || '').text}`}>
                            {getSelectedWallet(toWalletId)?.display_name}
                          </span>
                          <span className={`text-xs ${getWalletColors(getSelectedWallet(toWalletId)?.name || '').textSecondary}`}>
                            {formatBalance(getSelectedWallet(toWalletId)?.balance, getSelectedWallet(toWalletId)?.currency || 'USD')}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-1">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Seleccionar</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Información de la transferencia */}
              {(fromWalletId || toWalletId) && (
                <div className={`rounded-lg p-3 border ${
                  type === 'transfer' && amount && !canTransfer() 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <ArrowRightLeft className={`w-4 h-4 ${
                      type === 'transfer' && amount && !canTransfer() 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`} />
                    <span className={`text-sm ${
                      type === 'transfer' && amount && !canTransfer() 
                        ? 'text-red-800' 
                        : 'text-blue-800'
                    }`}>
                      {fromWalletId && toWalletId 
                        ? `Transferir desde ${getSelectedWallet(fromWalletId)?.display_name} hacia ${getSelectedWallet(toWalletId)?.display_name}`
                        : fromWalletId 
                          ? `Desde ${getSelectedWallet(fromWalletId)?.display_name}`
                          : `Hacia ${getSelectedWallet(toWalletId)?.display_name}`
                      }
                    </span>
                  </div>
                  {type === 'transfer' && fromWalletId && amount && (
                    <div className="mt-2 text-xs">
                      <span className={!canTransfer() ? 'text-red-600' : 'text-blue-600'}>
                        {!canTransfer() 
                          ? `❌ Saldo insuficiente (Disponible: ${formatBalance(getFromWalletBalance(), getSelectedWallet(fromWalletId)?.currency || 'USD')})`
                          : `✅ Saldo suficiente (Disponible: ${formatBalance(getFromWalletBalance(), getSelectedWallet(fromWalletId)?.currency || 'USD')})`
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet</label>
              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Seleccionar wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.display_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TxStatus)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="pending">Pendiente</option>
                <option value="cleared">Confirmado</option>
                <option value="reconciled">Conciliado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="USD">USD</option>
                <option value="VES">VES</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">(Opcional) Seleccionar proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Guardar</button>
          </div>
        </form>

        {/* Modal de selección de wallet origen */}
        {showFromWalletModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Wallet Origen</h3>
                <button onClick={() => setShowFromWalletModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {wallets.map(wallet => {
                  const colors = getWalletColors(wallet.name);
                  const IconComponent = getWalletIcon(wallet.name);
                  const isSelected = fromWalletId === wallet.id;
                  
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => {
                        setFromWalletId(wallet.id);
                        setShowFromWalletModal(false);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        isSelected 
                          ? `${colors.bg} ${colors.border} border-2` 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {wallet.display_name}
                        </span>
                        <span className={`text-xs ${colors.textSecondary}`}>
                          {formatBalance(wallet.balance, wallet.currency)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal de selección de wallet destino */}
        {showToWalletModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Wallet Destino</h3>
                <button onClick={() => setShowToWalletModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {wallets.filter(w => w.id !== fromWalletId).map(wallet => {
                  const colors = getWalletColors(wallet.name);
                  const IconComponent = getWalletIcon(wallet.name);
                  const isSelected = toWalletId === wallet.id;
                  
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => {
                        setToWalletId(wallet.id);
                        setShowToWalletModal(false);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        isSelected 
                          ? `${colors.bg} ${colors.border} border-2` 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {wallet.display_name}
                        </span>
                        <span className={`text-xs ${colors.textSecondary}`}>
                          {formatBalance(wallet.balance, wallet.currency)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default TransactionModal;


