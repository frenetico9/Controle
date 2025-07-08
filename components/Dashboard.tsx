import React, { useMemo, useState } from 'react';
import type { Transaction, Goal, Currency } from '../types';
import { StatCard } from './StatCard';
import { CategoryPieChart } from './CategoryPieChart';
import { BalanceTrendChart } from './BalanceTrendChart';
import { ProgressBar } from './ProgressBar';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, GoalsIcon, NetWorthIcon } from './icons';
import { getCurrencyFormatter } from '../utils/formatters';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
  balance: number;
  currency: Currency;
  netWorth: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, goals, balance, currency, netWorth }) => {
  const currencyFormatter = getCurrencyFormatter(currency);
  const [balanceTimeframe, setBalanceTimeframe] = useState<'6m' | '12m' | 'ytd'>('6m');

  const { totalIncome, totalExpenses } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.reduce(
      (acc, t) => {
        const transactionDate = new Date(t.date);
        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
          if (t.type === 'income') {
            acc.totalIncome += t.amount;
          } else {
            acc.totalExpenses += t.amount;
          }
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [transactions]);
  
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);
  
  const timeframeOptions: { key: '6m' | '12m' | 'ytd', label: string }[] = [
      { key: '6m', label: '6 meses' },
      { key: '12m', label: '12 meses' },
      { key: 'ytd', label: 'Este Ano' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimônio Líquido"
          value={currencyFormatter.format(netWorth)}
          icon={<NetWorthIcon className="w-8 h-8 text-white" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="Saldo em Contas"
          value={currencyFormatter.format(balance)}
          icon={<WalletIcon className="w-8 h-8 text-white" />}
          color="bg-primary-500"
        />
        <StatCard
          title="Receitas (Mês)"
          value={currencyFormatter.format(totalIncome)}
          icon={<ArrowUpIcon className="w-8 h-8 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Despesas (Mês)"
          value={currencyFormatter.format(totalExpenses)}
          icon={<ArrowDownIcon className="w-8 h-8 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
           <div className="flex flex-wrap justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Balanço Mensal</h3>
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                 {timeframeOptions.map(option => (
                    <button
                        key={option.key}
                        onClick={() => setBalanceTimeframe(option.key)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            balanceTimeframe === option.key
                            ? 'bg-white dark:bg-slate-800 shadow text-primary-600 dark:text-primary-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
              </div>
          </div>
          <BalanceTrendChart transactions={transactions} currency={currency} timeframe={balanceTimeframe} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Despesas por Categoria</h3>
          <CategoryPieChart transactions={transactions} currency={currency} />
        </div>
      </div>
      
       {/* Recent Activity and Goals */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Atividade Recente</h3>
                {recentTransactions.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {recentTransactions.map(t => (
                            <li key={t.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">{t.description}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type === 'income' ? '+' : '-'} {currencyFormatter.format(t.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma transação recente.</div>
                )}
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Progresso das Metas</h3>
                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-slate-700 dark:text-slate-200">{goal.name}</span>
                                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{currencyFormatter.format(goal.currentAmount)} / {currencyFormatter.format(goal.targetAmount)}</span>
                                </div>
                                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma meta definida.</div>
                )}
            </div>
        </div>
    </div>
  );
};
