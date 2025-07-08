import React from 'react';
import type { Investment, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { PlusIcon, EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface PortfolioViewProps {
  investments: Investment[];
  currency: Currency;
  onAdd: () => void;
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
}

const InvestmentCard: React.FC<{ investment: Investment; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ investment, currencyFormatter, onEdit, onDelete }) => {
    const currentValue = investment.quantity * investment.currentPrice;
    const cost = investment.quantity * investment.purchasePrice;
    const gainLoss = currentValue - cost;
    const performance = cost > 0 ? (gainLoss / cost) * 100 : 0;
    const isGain = gainLoss >= 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-1">{investment.name}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{investment.type}</p>
                </div>
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={onEdit} className="p-1 text-slate-400 hover:text-primary-500"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500"><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Posição Atual</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(currentValue)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quantidade</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{investment.quantity}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preço Médio</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(investment.purchasePrice)}</p>
                </div>
            </div>
             <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Resultado</p>
                <div className={`flex items-center gap-2 font-bold ${isGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isGain ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    <span>{currencyFormatter.format(gainLoss)} ({performance.toFixed(2)}%)</span>
                </div>
            </div>
        </div>
    );
};

export const PortfolioView: React.FC<PortfolioViewProps> = ({ investments, currency, onAdd, onEdit, onDelete }) => {
    const currencyFormatter = getCurrencyFormatter(currency);

    const { totalValue, totalCost } = React.useMemo(() => {
        return investments.reduce((acc, inv) => {
            acc.totalValue += inv.quantity * inv.currentPrice;
            acc.totalCost += inv.quantity * inv.purchasePrice;
            return acc;
        }, { totalValue: 0, totalCost: 0 });
    }, [investments]);

    const totalGainLoss = totalValue - totalCost;
    const totalPerformance = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const isTotalGain = totalGainLoss >= 0;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Meu Portfólio de Investimentos</h2>
                <div className={`flex items-center gap-4 mt-1`}>
                    <p className="text-slate-500 dark:text-slate-400">Valor Total: <span className="font-bold text-slate-700 dark:text-slate-200">{currencyFormatter.format(totalValue)}</span></p>
                    <div className={`flex items-center gap-1 font-bold text-sm ${isTotalGain ? 'text-green-600' : 'text-red-600'}`}>
                        {isTotalGain ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>}
                        {currencyFormatter.format(totalGainLoss)} ({totalPerformance.toFixed(2)}%)
                    </div>
                </div>
            </div>
             <button onClick={onAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition">
                <PlusIcon className="w-5 h-5" /> Novo Investimento
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} currencyFormatter={currencyFormatter} onEdit={() => onEdit(investment)} onDelete={() => onDelete(investment)} />
        ))}
      </div>

       {investments.length === 0 && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <p>Nenhum investimento rastreado.</p>
                <p>Adicione seus ativos para ver seu portfólio crescer!</p>
            </div>
        )}
    </div>
  );
};