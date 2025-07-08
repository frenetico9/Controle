import React, { useState, useMemo } from 'react';
import type { Debt, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { PlusIcon, EditIcon, DeleteIcon } from './icons';

interface DebtViewProps {
  debts: Debt[];
  currency: Currency;
  onAdd: () => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

type Strategy = 'snowball' | 'avalanche';

const DebtCard: React.FC<{ debt: Debt; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; index: number; strategy: Strategy; }> = ({ debt, currencyFormatter, onEdit, onDelete, index, strategy }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center font-bold text-2xl ${strategy === 'snowball' ? 'text-blue-500' : 'text-red-500'}`}>
                {index + 1}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-1">{debt.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={onEdit} className="p-1 text-slate-400 hover:text-primary-500"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500"><DeleteIcon className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2 text-sm">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Saldo Total</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(debt.totalAmount)}</p>
                    </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400">Juros (a.m.)</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{debt.interestRate.toFixed(2)}%</p>
                    </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400">Pag. Mínimo</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(debt.minimumPayment)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DebtView: React.FC<DebtViewProps> = ({ debts, currency, onAdd, onEdit, onDelete }) => {
    const currencyFormatter = getCurrencyFormatter(currency);
    const [strategy, setStrategy] = useState<Strategy>('avalanche');

    const sortedDebts = useMemo(() => {
        const debtsCopy = [...debts];
        if (strategy === 'avalanche') {
            return debtsCopy.sort((a, b) => b.interestRate - a.interestRate);
        } else { // snowball
            return debtsCopy.sort((a, b) => a.totalAmount - b.totalAmount);
        }
    }, [debts, strategy]);

    const totalDebtAmount = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Meu Plano de Dívidas</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Total de Dívidas: <span className="font-bold">{currencyFormatter.format(totalDebtAmount)}</span> | Soma dos Mínimos: <span className="font-bold">{currencyFormatter.format(totalMinimumPayments)}/mês</span></p>
            </div>
             <button onClick={onAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition">
                <PlusIcon className="w-5 h-5" /> Nova Dívida
            </button>
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Estratégia de Pagamento</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Escolha uma estratégia para ver a ordem de prioridade para quitar suas dívidas mais rápido.</p>
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 max-w-sm">
                <button
                    onClick={() => setStrategy('avalanche')}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors text-center ${strategy === 'avalanche' ? 'bg-white dark:bg-slate-800 shadow text-red-600' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    Avalanche (Juros Altos)
                </button>
                <button
                    onClick={() => setStrategy('snowball')}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors text-center ${strategy === 'snowball' ? 'bg-white dark:bg-slate-800 shadow text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    Bola de Neve (Saldo Baixo)
                </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {strategy === 'avalanche' ? 'Prioriza dívidas com juros maiores para economizar mais dinheiro a longo prazo.' : 'Prioriza dívidas com saldo menor para ganhar motivação com vitórias rápidas.'}
            </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDebts.map((debt, index) => (
            <DebtCard key={debt.id} debt={debt} currencyFormatter={currencyFormatter} onEdit={() => onEdit(debt)} onDelete={() => onDelete(debt)} index={index} strategy={strategy}/>
        ))}
      </div>

       {debts.length === 0 && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <p>Você está livre de dívidas! 🎉</p>
                <p>Se tiver alguma, adicione para começar a planejar sua quitação.</p>
            </div>
        )}
    </div>
  );
};