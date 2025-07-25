import React, { useState, useEffect } from 'react';
import type { BudgetEnvelope } from '../../types';

interface AddEnvelopeModalProps {
  onClose: () => void;
  onSave: (envelope: Omit<BudgetEnvelope, 'id' | 'spentAmount'> & { id?: string }) => void;
  envelopeToEdit?: BudgetEnvelope | null;
}

export const AddEnvelopeModal: React.FC<AddEnvelopeModalProps> = ({ onClose, onSave, envelopeToEdit }) => {
  const [name, setName] = useState('');
  const [budgetedAmount, setBudgetedAmount] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!envelopeToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(envelopeToEdit.name);
      setBudgetedAmount(String(envelopeToEdit.budgetedAmount));
    }
  }, [envelopeToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !budgetedAmount) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    
    const envelopeData = {
      name,
      budgetedAmount: parseFloat(budgetedAmount),
    };
    
    if(isEditing) {
        onSave({ ...envelopeData, id: envelopeToEdit.id });
    } else {
        onSave(envelopeData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Editar Envelope' : 'Novo Envelope de Orçamento'}</h2>
          
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome do Envelope</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Alimentação" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          <div>
            <label htmlFor="budgetedAmount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor Orçado Mensal</label>
            <input id="budgetedAmount" type="number" step="0.01" value={budgetedAmount} onChange={e => setBudgetedAmount(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">{isEditing ? 'Salvar Alterações' : 'Criar Envelope'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};