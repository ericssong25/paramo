import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import TransactionDetailModal from './TransactionDetailModal';
import ConsistentHeader from './ConsistentHeader';
import { useBusinessWallets } from '../hooks/useBusinessWallets';

type Tx = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'cleared' | 'reconciled';
  notes?: string;
  project_id?: string | null;
  projects?: { name: string; color: string } | null;
  wallet_id?: string | null;
  from_wallet_id?: string | null;
  to_wallet_id?: string | null;
};

const TransactionsList: React.FC = () => {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Tx | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'cleared' | 'reconciled'>('all');
  const [type, setType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [project, setProject] = useState<string>('all');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Hook para obtener nombres de wallets
  const { getWalletDisplayName } = useBusinessWallets();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('id, type, amount, currency, date, status, notes, project_id, wallet_id, from_wallet_id, to_wallet_id, projects(name, color)')
          .order('date', { ascending: false })
          .limit(500);
        if (error) throw error;
        setRows((data || []) as any);
      } catch (e) {
        console.error('Error loading transactions:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('id, name').order('name');
      setProjects((data || []) as any);
    })();
  }, []);

  const filtered = rows.filter(r => {
    if (status !== 'all' && r.status !== status) return false;
    if (type !== 'all' && r.type !== type) return false;
    if (project !== 'all' && r.project_id !== project) return false;
    if (q) {
      const needle = q.toLowerCase();
      const hay = `${r.projects?.name || ''} ${r.type} ${r.status}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="h-full flex flex-col">
      <ConsistentHeader
        title="Transacciones"
        searchQuery={q}
        onSearchChange={setQ}
        searchPlaceholder="Buscar transacciones..."
        showCreateButton={false}
      >
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">Estatus: Todos</option>
          <option value="pending">Pendiente</option>
          <option value="cleared">Confirmado</option>
          <option value="reconciled">Conciliado</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">Tipo: Todos</option>
          <option value="income">Ingreso</option>
          <option value="expense">Egreso</option>
          <option value="transfer">Transferencia</option>
        </select>
        <select value={project} onChange={(e) => setProject(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">Proyecto: Todos</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </ConsistentHeader>

             <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Cargando transacciones...
              </div>
            ) : (
              <table className="min-w-full w-full table-fixed">
                <colgroup>
                  <col className="w-[12%]" /> {/* Fecha */}
                  <col className="w-[12%]" /> {/* Tipo */}
                  <col className="w-[16%]" /> {/* Monto */}
                  <col className="w-[16%]" /> {/* Estado */}
                  <col className="w-[44%]" /> {/* Proyecto */}
                </colgroup>
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                    <th className="px-6 py-4 whitespace-nowrap">Tipo</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Monto</th>
                    <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                    <th className="px-6 py-4 whitespace-nowrap">Proyecto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-lg font-medium mb-2">No se encontraron transacciones</div>
                          <div className="text-sm">Intenta ajustar los filtros de búsqueda</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {paged.map(r => (
                    <tr key={r.id} className="text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150" onClick={() => setSelected(r)}>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{new Date(r.date + 'T00:00:00').toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 
                          r.type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {r.type === 'income' ? 'Ingreso' : 
                           r.type === 'transfer' ? 'Transferencia' : 
                           'Egreso'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-semibold whitespace-nowrap text-right ${
                        r.type === 'income' ? 'text-emerald-700' : 
                        r.type === 'transfer' ? 'text-blue-700' :
                        'text-red-700'
                      }`}>
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: r.currency }).format(r.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          r.status === 'cleared' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {r.status === 'pending' ? 'Pendiente' : r.status === 'cleared' ? 'Confirmado' : 'Conciliado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.projects?.name ? (
                          <span className="inline-flex items-center gap-2 text-gray-800">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.projects?.color || '#9CA3AF' }} />
                            <span className="truncate">{r.projects?.name}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination controls - Integrated with table */}
          {!loading && paged.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                                     <span className="text-sm text-gray-700">
                     {filtered.length === 1 ? (
                       <>Mostrando <span className="font-medium">1</span> transacción</>
                     ) : (
                       <>
                         Mostrando <span className="font-medium">{((page - 1) * pageSize) + 1}</span> a <span className="font-medium">{Math.min(page * pageSize, filtered.length)}</span> de <span className="font-medium">{filtered.length}</span> transacciones
                       </>
                     )}
                   </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      page <= 1 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </div>
                  
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      page >= totalPages 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <TransactionDetailModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={async (id, status) => {
            const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
            if (!error) {
              setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            }
          }}
          tx={{
            id: selected.id,
            type: selected.type,
            amount: selected.amount,
            currency: selected.currency,
            date: new Date(selected.date + 'T00:00:00'),
            status: selected.status,
            notes: selected.notes,
            projectName: selected.projects?.name || undefined,
            projectColor: selected.projects?.color || undefined,
            walletId: selected.wallet_id || undefined,
            walletName: selected.wallet_id ? getWalletDisplayName(selected.wallet_id) : undefined,
            fromWalletId: selected.from_wallet_id || undefined,
            fromWalletName: selected.from_wallet_id ? getWalletDisplayName(selected.from_wallet_id) : undefined,
            toWalletId: selected.to_wallet_id || undefined,
            toWalletName: selected.to_wallet_id ? getWalletDisplayName(selected.to_wallet_id) : undefined,
          }}
        />
      )}
    </div>
  );
};

export default TransactionsList;


