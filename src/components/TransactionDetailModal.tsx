import React from 'react';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

export interface TransactionDetail {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'cleared' | 'reconciled';
  notes?: string;
  projectName?: string;
  projectColor?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tx?: TransactionDetail | null;
  onUpdateStatus?: (id: string, status: 'pending' | 'cleared' | 'reconciled') => Promise<void> | void;
}

const TransactionDetailModal: React.FC<Props> = ({ isOpen, onClose, tx, onUpdateStatus }) => {
  if (!isOpen || !tx) return null;
  const [status, setStatus] = React.useState<TransactionDetail['status']>(tx.status);
  React.useEffect(() => { setStatus(tx.status) }, [tx.status]);
  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Detalle de transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6"/></button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo</span>
            <span className={`font-medium ${tx.type==='income' ? 'text-emerald-700' : 'text-red-700'}`}>{tx.type==='income' ? 'Ingreso' : 'Egreso'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Monto</span>
            <span className="font-medium">{new Intl.NumberFormat(undefined, { style: 'currency', currency: tx.currency }).format(tx.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="text-gray-800">{tx.date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-800">
              <option value="pending">Pendiente</option>
              <option value="cleared">Confirmado</option>
              <option value="reconciled">Conciliado</option>
            </select>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Proyecto</span>
            <span className="inline-flex items-center gap-1 text-gray-800">
              {tx.projectName ? (
                <>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.projectColor || '#9CA3AF' }} />
                  {tx.projectName}
                </>
              ) : '—'}
            </span>
          </div>
          {tx.notes && (
            <div>
              <div className="text-gray-500 mb-1">Notas</div>
              <div className="text-gray-800 whitespace-pre-wrap">{tx.notes}</div>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cerrar</button>
          <button
            onClick={async () => {
              if (onUpdateStatus) await onUpdateStatus(tx.id, status);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransactionDetailModal;


