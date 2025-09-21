import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, CalendarDays, Plus, Wallet, CreditCard, Smartphone, Coins } from 'lucide-react';
import TransactionModal from './TransactionModal';
import { supabase } from '../lib/supabase';
import { useBusinessWallets } from '../hooks/useBusinessWallets';

type Currency = string;

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: Currency;
  date: Date;
  status: 'pending' | 'cleared' | 'reconciled';
  projectId?: string;
  projectName?: string;
  projectColor?: string;
  walletId?: string;
  fromWalletId?: string;
  toWalletId?: string;
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
  
  // Hook para obtener wallets reales
  const { wallets: businessWallets, loading: walletsLoading, fetchWallets, getWalletDisplayName } = useBusinessWallets();

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
      // Solo contar transacciones en USD para estadísticas
      if (tx.currency !== 'USD') continue;
      
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
  }, [localTransactions, startOfMonth, now, thirtyDaysAhead]);

  // Calcular saldo actual basado en wallets USD
  const currentBalance = useMemo(() => {
    return businessWallets
      .filter(wallet => wallet.currency === 'USD')
      .reduce((total, wallet) => total + wallet.current_balance, 0);
  }, [businessWallets]);
  
  const projectedBalance = currentBalance + pendingWithin30d;

  // Fetch from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('id, type, amount, currency, date, status, notes, project_id, wallet_id, from_wallet_id, to_wallet_id, projects(name, color)')
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
          walletId: r.wallet_id || undefined,
          fromWalletId: r.from_wallet_id || undefined,
          toWalletId: r.to_wallet_id || undefined,
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

  const handleSaveModal = async (tx: { 
    type: 'income' | 'expense' | 'transfer'; 
    amount: number; 
    currency: string; 
    date: string; 
    status: 'pending' | 'cleared' | 'reconciled'; 
    notes?: string; 
    projectId?: string;
    walletId?: string;
    fromWalletId?: string;
    toWalletId?: string;
  }) => {
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
        wallet_id: tx.walletId || null,
        from_wallet_id: tx.fromWalletId || null,
        to_wallet_id: tx.toWalletId || null,
      });
      if (error) throw error;
      
      // Refrescar wallets después de la transacción
      await fetchWallets();
      
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
        walletId: tx.walletId,
        fromWalletId: tx.fromWalletId,
        toWalletId: tx.toWalletId,
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
          wallets={businessWallets.map(wallet => ({
            id: wallet.id,
            name: wallet.name,
            display_name: wallet.display_name,
            currency: wallet.currency,
            balance: wallet.current_balance
          }))}
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

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessWallets.map((wallet) => {
          const getIcon = () => {
            switch (wallet.icon_name) {
              case 'wallet': return <Wallet className="w-5 h-5 text-white" />;
              case 'credit-card': return <CreditCard className="w-5 h-5 text-white" />;
              case 'smartphone': return <Smartphone className="w-5 h-5 text-white" />;
              case 'coins': return <Coins className="w-5 h-5 text-white" />;
              default: return <Wallet className="w-5 h-5 text-white" />;
            }
          };

          const getColors = () => {
            switch (wallet.name) {
              case 'cash': return {
                bg: 'from-green-50 to-green-100',
                border: 'border-green-200',
                iconBg: 'bg-green-500',
                text: 'text-green-900',
                textSecondary: 'text-green-600'
              };
              case 'binance': return {
                bg: 'from-yellow-50 to-yellow-100',
                border: 'border-yellow-200',
                iconBg: 'bg-yellow-500',
                text: 'text-yellow-900',
                textSecondary: 'text-yellow-600'
              };
              case 'zinli': return {
                bg: 'from-purple-50 to-purple-100',
                border: 'border-purple-200',
                iconBg: 'bg-purple-500',
                text: 'text-purple-900',
                textSecondary: 'text-purple-600'
              };
              case 'bolivares': return {
                bg: 'from-blue-50 to-blue-100',
                border: 'border-blue-200',
                iconBg: 'bg-blue-500',
                text: 'text-blue-900',
                textSecondary: 'text-blue-600'
              };
              default: return {
                bg: 'from-gray-50 to-gray-100',
                border: 'border-gray-200',
                iconBg: 'bg-gray-500',
                text: 'text-gray-900',
                textSecondary: 'text-gray-600'
              };
            }
          };

          const colors = getColors();

          return (
            <div key={wallet.id} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 border ${colors.border} shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                  {getIcon()}
                </div>
                <div className="text-right">
                  <div className={`text-xs ${colors.textSecondary} font-medium`}>{wallet.display_name}</div>
                  <div className={`text-sm ${colors.textSecondary}`}>
                    {wallet.name === 'bolivares' ? 'VES' : wallet.currency}
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                {numberFormat(wallet.current_balance, wallet.currency)}
              </div>
              <div className={`text-xs ${colors.textSecondary}`}>Disponible</div>
            </div>
          );
        })}
      </div>

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


export default FinancesDashboard;


