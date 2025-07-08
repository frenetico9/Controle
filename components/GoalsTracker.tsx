import React, { useState } from 'react';
import type { Goal, Currency } from '../types';
import { ProgressBar } from './ProgressBar';
import { PlusIcon, EditIcon, DeleteIcon } from './icons';
import { getCurrencyFormatter } from '../utils/formatters';

interface GoalsTrackerProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onAddProgress: (goal: Goal) => void;
  currency: Currency;
}


export const GoalsTracker: React.FC<GoalsTrackerProps> = ({ goals, onAddGoal, onEdit, onDelete, onAddProgress, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const currencyFormatter = getCurrencyFormatter(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && targetAmount && targetDate) {
      onAddGoal({
        id: `g${Date.now()}`,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0, // New goals start with 0
        targetDate,
      });
      // Reset form
      setName('');
      setTargetAmount('');
      setTargetDate('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div/>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Meta
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-all duration-300">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Adicionar Nova Meta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome da Meta (ex: Viagem)" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            <input type="number" placeholder="Valor Alvo" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">Salvar Meta</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{goal.name}</h3>
                    <div className="flex items-center gap-1">
                       <button onClick={() => onEdit(goal)} className="p-1 text-slate-400 hover:text-primary-500"><EditIcon className="w-4 h-4" /></button>
                       <button onClick={() => onDelete(goal)} className="p-1 text-slate-400 hover:text-red-500"><DeleteIcon className="w-4 h-4" /></button>
                    </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Meta até {new Date(goal.targetDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                <div className="flex justify-between mt-2 text-sm font-medium">
                <span className="text-green-600 dark:text-green-400">{currencyFormatter.format(goal.currentAmount)}</span>
                <span className="text-slate-600 dark:text-slate-300">{currencyFormatter.format(goal.targetAmount)}</span>
                </div>
                <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% concluído
                </p>
            </div>
            <button onClick={() => onAddProgress(goal)} className="mt-4 w-full text-sm bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 font-semibold py-2 px-4 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-500/30 transition">
                Adicionar Progresso
            </button>
          </div>
        ))}
      </div>
       {goals.length === 0 && !isAdding && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400">
                <p>Nenhuma meta encontrada.</p>
                <p>Clique em "Nova Meta" para começar a planejar seu futuro!</p>
            </div>
        )}
    </div>
  );
};