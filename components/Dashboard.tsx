import React, { useMemo, useState } from 'react';
import type { Transaction, Goal, Currency, Investment, Debt, BudgetEnvelope, RecurringBill, Asset } from '../types';
import { StatCard } from './StatCard';
import { CategoryPieChart } from './CategoryPieChart';
import { BalanceTrendChart } from './BalanceTrendChart';
import { ProgressBar } from './ProgressBar';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, GoalsIcon, NetWorthIcon, PortfolioIcon, BudgetIcon, BillsIcon } from './icons';
import { getCurrencyFormatter } from '../utils/formatters';
import { FinancialHealth } from './FinancialHealth';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
  balance: number;
  currency: Currency;
  netWorth: number;
  investments: Investment[];
  debts: Debt[];
  envelopes: BudgetEnvelope[];
  bills: RecurringBill[];
  assets: Asset[];
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { transactions, goals, balance, currency, netWorth, investments, envelopes, bills } = props;
  const currencyFormatter = getCurrencyFormatter(currency);
  
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

  const upcomingBills = useMemo(() => {
    const today = new Date().getDate();
    return [...bills]
        .sort((a,b) => a.dueDay - b.dueDay)
        .filter(b => b.dueDay >= today)
        .slice(0, 3);
  }, [bills]);

  const investmentSummary = useMemo(() => {
     const totalValue = investments.reduce((sum, i) => sum + i.quantity * i.currentPrice, 0);
     return { totalValue };
  }, [investments]);

  const budgetSummary = useMemo(() => {
      const totalBudgeted = envelopes.reduce((sum, e) => sum + e.budgetedAmount, 0);
      const totalSpent = envelopes.reduce((sum, e) => sum + e.spentAmount, 0);
      return { totalBudgeted, totalSpent };
  }, [envelopes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Header Stat Cards */}
      <div className="lg:col-span-3 xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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

      {/* Financial Health (Main component) */}
      <div className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <FinancialHealth 
          financialData={{
            monthlyIncome: totalIncome,
            monthlyExpenses: totalExpenses,
            totalAssets: netWorth + props.debts.reduce((s,d) => s + d.totalAmount, 0),
            totalDebt: props.debts.reduce((s,d) => s + d.totalAmount, 0)
          }}
        />
      </div>

      {/* Side Column */}
      <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <BudgetIcon className="w-6 h-6 text-primary-500"/>
                  <span>Orçamento do Mês</span>
              </h3>
              <ProgressBar value={budgetSummary.totalSpent} max={budgetSummary.totalBudgeted} />
              <div className="flex justify-between mt-2 text-sm font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Gasto: {currencyFormatter.format(budgetSummary.totalSpent)}</span>
                  <span className="text-slate-500 dark:text-slate-400">de {currencyFormatter.format(budgetSummary.totalBudgeted)}</span>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
               <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <PortfolioIcon className="w-6 h-6 text-green-500"/>
                  <span>Investimentos</span>
              </h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{currencyFormatter.format(investmentSummary.totalValue)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">em valor de mercado</p>
          </div>
      </div>

      {/* Balance Trend */}
      <div className="lg:col-span-3 xl:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <BalanceTrendChart transactions={transactions} currency={currency} timeframe={'6m'} />
      </div>

      {/* Expense Chart */}
      <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Despesas por Categoria</h3>
        <CategoryPieChart transactions={transactions} currency={currency} />
      </div>
      
       {/* Goals and Upcoming Bills */}
       <div className="lg:col-span-3 xl:col-span-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                   <GoalsIcon className="w-6 h-6 text-purple-500" />
                   <span>Progresso das Metas</span>
                </h3>
                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.slice(0, 2).map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-slate-700 dark:text-slate-200">{goal.name}</span>
                                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                                </div>
                                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma meta definida.</div>
                )}
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <BillsIcon className="w-6 h-6 text-orange-500" />
                    <span>Contas a Vencer</span>
                </h3>
                 {upcomingBills.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {upcomingBills.map(bill => (
                            <li key={bill.id} className="py-2 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">{bill.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Vence dia {bill.dueDay}</p>
                                </div>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                    {currencyFormatter.format(bill.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma conta a vencer este mês.</div>
                )}
            </div>
        </div>
    </div>
  );
};