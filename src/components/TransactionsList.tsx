import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import TransactionDetailModal from './TransactionDetailModal';
import ConsistentHeader from './ConsistentHeader';

type Tx = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'cleared' | 'reconciled';
  project_id?: string | null;
  projects?: { name: string; color: string } | null;
};

const TransactionsList: React.FC = () => {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Tx | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'cleared' | 'reconciled'>('all');
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all');
  const [project, setProject] = useState<string>('all');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('id, type, amount, currency, date, status, project_id, projects(name, color)')
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
          <div className="p-4 overflow-auto">
            {loading ? (
              <div className="text-gray-600">Cargando...</div>
            ) : (
              <table className="min-w-full w-full table-fixed">
                <colgroup>
                  <col className="w-[12%]" /> {/* Fecha */}
                  <col className="w-[12%]" /> {/* Tipo */}
                  <col className="w-[16%]" /> {/* Monto */}
                  <col className="w-[16%]" /> {/* Estado */}
                  <col className="w-[44%]" /> {/* Proyecto */}
                </colgroup>
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="py-2 pr-4 whitespace-nowrap">Fecha</th>
                    <th className="py-2 pr-4 whitespace-nowrap">Tipo</th>
                    <th className="py-2 pr-4 whitespace-nowrap text-right">Monto</th>
                    <th className="py-2 pr-4 whitespace-nowrap">Estado</th>
                    <th className="py-2 pr-4 whitespace-nowrap">Proyecto</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr className="border-t">
                      <td colSpan={5} className="py-6 text-center text-sm text-gray-500">Sin resultados</td>
                    </tr>
                  )}
                  {paged.map(r => (
                    <tr key={r.id} className="border-t text-sm cursor-pointer hover:bg-gray-50" onClick={() => setSelected(r)}>
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{new Date(r.date + 'T00:00:00').toLocaleDateString()}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border text-xs ${r.type==='income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{r.type==='income' ? 'Ingreso' : 'Egreso'}</span>
                      </td>
                      <td className={`py-2 pr-4 font-medium whitespace-nowrap text-right ${r.type==='income' ? 'text-emerald-700' : 'text-red-700'}`}>{new Intl.NumberFormat(undefined, { style: 'currency', currency: r.currency }).format(r.amount)}</td>
                      <td className="py-2 pr-4 text-gray-700 capitalize whitespace-nowrap">{r.status}</td>
                      <td className="py-2 pr-4">
                        {r.projects?.name ? (
                          <span className="inline-flex items-center gap-1 text-gray-800">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.projects?.color || '#9CA3AF' }} />
                            <span className="truncate block max-w-full">{r.projects?.name}</span>
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
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-sm bg-white">
          <span className="text-gray-600">Página {page} de {totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded border ${page<=1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Anterior</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`px-3 py-1.5 rounded border ${page>=totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Siguiente</button>
          </div>
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
            projectName: selected.projects?.name || undefined,
            projectColor: selected.projects?.color || undefined,
          }}
        />
      )}
    </div>
  );
};

export default TransactionsList;


