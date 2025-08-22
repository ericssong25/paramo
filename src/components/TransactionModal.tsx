import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, DollarSign, CalendarDays } from 'lucide-react';

type TxType = 'income' | 'expense';
type TxStatus = 'pending' | 'cleared' | 'reconciled';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: string;
  projects?: { id: string; name: string; color?: string }[];
  onSave: (tx: {
    type: TxType;
    amount: number;
    currency: string;
    date: string; // YYYY-MM-DD
    status: TxStatus;
    notes?: string;
    projectId?: string;
  }) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, baseCurrency, onSave, projects = [] }) => {
  const [type, setType] = useState<TxType>('income');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TxStatus>('pending');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');

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
    onSave({ type, amount: value, currency: baseCurrency, date, status, notes: notes?.trim() || undefined, projectId: projectId || undefined });
    onClose();
    // reset para próximas altas
    setType('income');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setStatus('pending');
    setNotes('');
    setError('');
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
              <input disabled value={baseCurrency} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600" />
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
      </div>
    </div>,
    document.body
  );
};

export default TransactionModal;


