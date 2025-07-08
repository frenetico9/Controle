import React, { useState, useEffect } from 'react';
import type { Debt } from '../../types';

interface AddDebtModalProps {
  onClose: () => void;
  onSave: (debt: Omit<Debt, 'id'> & { id?: string }) => void;
  debtToEdit?: Debt | null;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({ onClose, onSave, debtToEdit }) => {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!debtToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(debtToEdit.name);
      setTotalAmount(String(debtToEdit.totalAmount));
      setInterestRate(String(debtToEdit.interestRate));
      setMinimumPayment(String(debtToEdit.minimumPayment));
    }
  }, [debtToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalAmount || !interestRate || !minimumPayment) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    
    const debtData = {
      name,
      totalAmount: parseFloat(totalAmount),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
    };
    
    if(isEditing) {
        onSave({ ...debtData, id: debtToEdit.id });
    } else {
        onSave(debtData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</h2>
          
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome da Dívida</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cartão de Crédito" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalAmount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Saldo Devedor Total</label>
              <input id="totalAmount" type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
             <div>
              <label htmlFor="interestRate" className="text-sm font-medium text-slate-600 dark:text-slate-300">Taxa de Juros (% a.m.)</label>
              <input id="interestRate" type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="Ex: 14.5" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>
          
           <div>
            <label htmlFor="minimumPayment" className="text-sm font-medium text-slate-600 dark:text-slate-300">Pagamento Mínimo Mensal</label>
            <input id="minimumPayment" type="number" step="0.01" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">{isEditing ? 'Salvar Alterações' : 'Adicionar Dívida'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};