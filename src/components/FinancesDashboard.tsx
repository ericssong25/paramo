import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, CalendarDays, Plus } from 'lucide-react';
import TransactionModal from './TransactionModal';
import TransactionDetailModal from './TransactionDetailModal';
import { supabase } from '../lib/supabase';

type Currency = string;

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: Currency;
  date: Date;
  status: 'pending' | 'cleared' | 'reconciled';
  projectId?: string;
  projectName?: string;
  projectColor?: string;
}

export interface FinancesDashboardProps {
  openingBalance?: number;
  baseCurrency?: Currency;
  transactions?: FinanceTransaction[];
}

const numberFormat = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const FinancesDashboard: React.FC<FinancesDashboardProps> = ({
  openingBalance = 0,
  baseCurrency = 'USD',
  transactions = [],
}) => {
  const [localTransactions, setLocalTransactions] = useState<FinanceTransaction[]>(transactions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<'pending' | 'cleared' | 'reconciled'>('pending');
  const [formNotes, setFormNotes] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; name: string; color: string }[]>([]);
  const [detailTx, setDetailTx] = useState<FinanceTransaction | null>(null);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAhead = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);

  const { incomeThisMonth, expenseThisMonth, clearedIncome, clearedExpense, pendingWithin30d } = useMemo(() => {
    let incomeThisMonth = 0;
    let expenseThisMonth = 0;
    let clearedIncome = 0;
    let clearedExpense = 0;
    let pendingWithin30d = 0;

    for (const tx of localTransactions) {
      const isThisMonth = tx.date >= startOfMonth && tx.date <= now;
      if (isThisMonth) {
        if (tx.type === 'income') incomeThisMonth += tx.amount;
        if (tx.type === 'expense') expenseThisMonth += tx.amount;
      }
      if (tx.status === 'cleared' || tx.status === 'reconciled') {
        if (tx.type === 'income') clearedIncome += tx.amount;
        if (tx.type === 'expense') clearedExpense += tx.amount;
      }
      if (tx.status === 'pending' && tx.date > now && tx.date <= thirtyDaysAhead) {
        pendingWithin30d += tx.type === 'income' ? tx.amount : -tx.amount;
      }
    }
    return { incomeThisMonth, expenseThisMonth, clearedIncome, clearedExpense, pendingWithin30d };
  }, [localTransactions]);

  const currentBalance = openingBalance + clearedIncome - clearedExpense;
  const projectedBalance = currentBalance + pendingWithin30d;

  // Fetch from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('id, type, amount, currency, date, status, notes, project_id, projects(name, color)')
          .order('date', { ascending: false })
          .limit(200);
        if (error) throw error;
        const mapped: FinanceTransaction[] = (data || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount),
          currency: r.currency,
          date: new Date(`${r.date}T00:00:00`),
          status: r.status,
          notes: r.notes || undefined,
          projectId: r.project_id || undefined,
          projectName: r.projects?.name || undefined,
          projectColor: r.projects?.color || undefined,
        }));
        setLocalTransactions(mapped);
      } catch (e) {
        console.error('Error fetching transactions:', e);
      }
    })();
  }, []);

  // Fetch projects for selection in modal
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, color')
          .order('name');
        if (error) throw error;
        setProjects((data || []) as any);
      } catch (e) {
        console.error('Error fetching projects:', e);
      }
    })();
  }, []);

  const handleSaveModal = async (tx: { type: 'income' | 'expense'; amount: number; currency: string; date: string; status: 'pending' | 'cleared' | 'reconciled'; notes?: string; projectId?: string; }) => {
    // Persistir en Supabase inmediatamente
    try {
      const { error } = await supabase.from('transactions').insert({
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        date: tx.date,
        status: tx.status,
        notes: tx.notes || null,
        source: 'manual',
        project_id: tx.projectId || null,
      });
      if (error) throw error;
      const newTx: FinanceTransaction = {
        id: `tx_${Date.now()}`,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        date: new Date(`${tx.date}T00:00:00`),
        status: tx.status,
        projectId: tx.projectId,
        projectName: projects.find(p => p.id === tx.projectId)?.name,
        projectColor: projects.find(p => p.id === tx.projectId)?.color,
      };
      setLocalTransactions(prev => [newTx, ...prev]);
    } catch (e) {
      console.error('Error inserting transaction:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top header bar (matches main header style) */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 -mt-3 md:-mt-6 -mx-3 md:-mx-6 md:rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <span>{now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(v => !v)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva transacción</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction modal */}
      {isAddOpen && (
        <TransactionModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          baseCurrency={baseCurrency}
          projects={projects}
          onSave={handleSaveModal}
        />
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Saldo actual</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {numberFormat(currentBalance, baseCurrency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Incluye balance inicial</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Ingresos del mes</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {numberFormat(incomeThisMonth, baseCurrency)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Egresos del mes</span>
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {numberFormat(expenseThisMonth, baseCurrency)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Saldo proyectado 30 días</span>
            <CalendarDays className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {numberFormat(projectedBalance, baseCurrency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Basado en pendientes dentro de 30 días</div>
        </div>
      </div>

      {/* Minimal bar chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Ingresos vs Egresos (últimos 6 meses)</h3>
        </div>
        <AnimatedMiniBars baseCurrency={baseCurrency} transactions={localTransactions} />
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Transacciones recientes</h3>
        <RecentTransactionsList transactions={localTransactions.slice(0, 5)} onClickTx={(tx) => setDetailTx(tx)} />
      </div>

      {/* Detail modal */}
      {detailTx && (
        <TransactionDetailModal
          isOpen={!!detailTx}
          onClose={() => setDetailTx(null)}
          tx={{
            id: detailTx.id,
            type: detailTx.type,
            amount: detailTx.amount,
            currency: detailTx.currency,
            date: detailTx.date,
            status: detailTx.status,
            notes: (detailTx as any).notes,
            projectName: detailTx.projectName,
            projectColor: detailTx.projectColor,
          }}
        />
      )}
    </div>
  );
};

const AnimatedMiniBars: React.FC<{ baseCurrency: string; transactions: FinanceTransaction[] }> = ({ baseCurrency, transactions }) => {
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { key, label: d.toLocaleDateString(undefined, { month: 'short' }), date: d };
  });

  const data = months.map(m => {
    const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0, 23, 59, 59);
    let income = 0; let expense = 0;
    for (const tx of transactions) {
      if (tx.date >= m.date && tx.date <= monthEnd) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      }
    }
    return { label: m.label, income, expense };
  });

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.income, d.expense)));
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  return (
    <div className="relative">
      <div className="grid grid-cols-6 gap-4">
        {data.map((d, idx) => (
          <div key={idx} className="flex flex-col items-stretch" onMouseEnter={() => setHoverIdx(idx)} onMouseLeave={() => setHoverIdx(null)}>
            <div className="h-28 flex items-end gap-2">
              <div
                className="flex-1 rounded bg-emerald-400/20 relative overflow-hidden"
                style={{ height: `${(d.income / maxVal) * 100}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ height: `${(d.income / maxVal) * 100}%` }}
                />
              </div>
              <div
                className="flex-1 rounded bg-red-400/20 relative overflow-hidden"
                style={{ height: `${(d.expense / maxVal) * 100}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-700 ease-out"
                  style={{ height: `${(d.expense / maxVal) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center">{d.label}</div>
          </div>
        ))}
      </div>

      {hoverIdx !== null && (
        <div className="absolute -top-2 left-0 right-0 pointer-events-none">
          <div className="flex justify-around">
            {data.map((d, i) => (
              <div key={i} className="relative w-full">
                {i === hoverIdx && (
                  <div className="absolute -translate-x-1/2 left-1/2 -top-6 bg-white border border-gray-200 shadow px-2 py-1 rounded text-xs text-gray-800">
                    <div>Ingresos: {d.income ? numberFormat(d.income, baseCurrency) : numberFormat(0, baseCurrency)}</div>
                    <div>Egresos: {d.expense ? numberFormat(d.expense, baseCurrency) : numberFormat(0, baseCurrency)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecentTransactionsList: React.FC<{ transactions: FinanceTransaction[]; onClickTx?: (tx: FinanceTransaction) => void }> = ({ transactions, onClickTx }) => {
  if (!transactions.length) return <div className="text-sm text-gray-500">Sin transacciones</div>;
  return (
    <ul className="divide-y divide-gray-200">
      {transactions.map(tx => (
        <li key={tx.id} className="py-2 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 px-2 rounded" onClick={() => onClickTx && onClickTx(tx)}>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${tx.type==='income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{tx.type==='income' ? 'Ingreso' : 'Egreso'}</span>
            <span className="text-gray-600">{tx.date.toLocaleDateString()}</span>
            {tx.projectName && (
              <span className="inline-flex items-center gap-1 text-gray-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.projectColor || '#9CA3AF' }} />
                <span className="max-w-none">{tx.projectName}</span>
              </span>
            )}
          </div>
          <div className={`font-medium ${tx.type==='income' ? 'text-emerald-700' : 'text-red-700'}`}>{numberFormat(tx.amount, tx.currency)}</div>
        </li>
      ))}
    </ul>
  );
};

export default FinancesDashboard;


