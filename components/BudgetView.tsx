import React from 'react';
import type { BudgetEnvelope, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { PlusIcon, EditIcon, DeleteIcon } from './icons';

interface BudgetViewProps {
  envelopes: BudgetEnvelope[];
  currency: Currency;
  onAdd: () => void;
  onEdit: (envelope: BudgetEnvelope) => void;
  onDelete: (envelope: BudgetEnvelope) => void;
}

const EnvelopeCard: React.FC<{ envelope: BudgetEnvelope; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ envelope, currencyFormatter, onEdit, onDelete }) => {
    const percentage = envelope.budgetedAmount > 0 ? (envelope.spentAmount / envelope.budgetedAmount) * 100 : 0;
    const remaining = envelope.budgetedAmount - envelope.spentAmount;

    let progressBarColor = 'bg-primary-600';
    if (percentage > 100) progressBarColor = 'bg-red-500';
    else if (percentage > 80) progressBarColor = 'bg-yellow-500';

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-1">{envelope.name}</h3>
                 <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={onEdit} className="p-1 text-slate-400 hover:text-primary-500"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500"><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="mt-4">
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                    <div
                        className={`h-4 rounded-full transition-all duration-500 ease-out ${progressBarColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                        Gasto: {currencyFormatter.format(envelope.spentAmount)}
                    </span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                        Total: {currencyFormatter.format(envelope.budgetedAmount)}
                    </span>
                </div>
                <div className={`mt-2 text-sm font-bold text-right ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {remaining >= 0 ? `${currencyFormatter.format(remaining)} restante` : `${currencyFormatter.format(Math.abs(remaining))} acima`}
                </div>
            </div>
        </div>
    );
};

export const BudgetView: React.FC<BudgetViewProps> = ({ envelopes, currency, onAdd, onEdit, onDelete }) => {
    const currencyFormatter = getCurrencyFormatter(currency);

    const totalBudgeted = envelopes.reduce((sum, e) => sum + e.budgetedAmount, 0);
    const totalSpent = envelopes.reduce((sum, e) => sum + e.spentAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md flex-1 min-w-[280px]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Resumo do Orçamento Mensal</h2>
            <div className="flex justify-around mt-2">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Orçado</p>
                    <p className="font-bold text-lg text-primary-600 dark:text-primary-400">{currencyFormatter.format(totalBudgeted)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gasto</p>
                    <p className="font-bold text-lg text-slate-700 dark:text-slate-200">{currencyFormatter.format(totalSpent)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Restante</p>
                    <p className={`font-bold text-lg ${totalBudgeted - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(totalBudgeted - totalSpent)}</p>
                </div>
            </div>
        </div>
        <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition"
        >
            <PlusIcon className="w-5 h-5" />
            Novo Envelope
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {envelopes.map(envelope => (
            <EnvelopeCard key={envelope.id} envelope={envelope} currencyFormatter={currencyFormatter} onEdit={() => onEdit(envelope)} onDelete={() => onDelete(envelope)} />
        ))}
      </div>
       {envelopes.length === 0 && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <p>Nenhum envelope de orçamento criado.</p>
                <p>Use envelopes para controlar seus gastos por categoria!</p>
            </div>
        )}
    </div>
  );
};