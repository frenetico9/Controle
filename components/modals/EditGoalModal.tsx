import React, { useState, useEffect } from 'react';
import type { Goal } from '../../types';

interface EditGoalModalProps {
  goal: Goal;
  onSave: (goal: Goal) => void;
  onClose: () => void;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setTargetDate(goal.targetDate.split('T')[0]);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...goal,
      name,
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(targetDate).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Meta</h2>
          <div>
            <label htmlFor="goalName" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome da Meta</label>
            <input id="goalName" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label htmlFor="goalTargetAmount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor Alvo</label>
            <input id="goalTargetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label htmlFor="goalTargetDate" className="text-sm font-medium text-slate-600 dark:text-slate-300">Data Alvo</label>
            <input id="goalTargetDate" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};