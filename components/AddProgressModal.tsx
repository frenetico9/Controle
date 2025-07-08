import React, { useState, useMemo } from 'react';
import type { Goal, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';

interface AddProgressModalProps {
  goal: Goal;
  onAddProgress: (goalId: string, amount: number) => void;
  onClose: () => void;
  currency: Currency;
}

export const AddProgressModal: React.FC<AddProgressModalProps> = ({ goal, onAddProgress, onClose, currency }) => {
  const [amount, setAmount] = useState('');
  const currencyFormatter = getCurrencyFormatter(currency);
  
  const remainingAmount = useMemo(() => {
      return goal.targetAmount - goal.currentAmount;
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const progressAmount = parseFloat(amount);
    if (!isNaN(progressAmount) && progressAmount > 0) {
      onAddProgress(goal.id, progressAmount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Adicionar Progresso</h2>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Meta: <span className="font-semibold">{goal.name}</span></p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Falta {currencyFormatter.format(remainingAmount)} para completar.</p>
          </div>
          <div>
            <label htmlFor="progressAmount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor a Adicionar</label>
            <input 
              id="progressAmount" 
              type="number"
              step="0.01"
              min="0.01"
              max={remainingAmount}
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
              autoFocus
              className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
};