import React, { useState, useEffect } from 'react';
import type { RecurringBill } from '../../types';

interface AddBillModalProps {
  onClose: () => void;
  onSave: (bill: Omit<RecurringBill, 'id'> & { id?: string }) => void;
  billToEdit?: RecurringBill | null;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({ onClose, onSave, billToEdit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!billToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(billToEdit.name);
      setAmount(String(billToEdit.amount));
      setDueDay(String(billToEdit.dueDay));
    }
  }, [billToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(dueDay);
    if (!name || !amount || !dueDay || day < 1 || day > 31) {
      setError('Por favor, preencha todos os campos corretamente. O dia do vencimento deve ser entre 1 e 31.');
      return;
    }
    setError('');
    
    const billData = {
      name,
      amount: parseFloat(amount),
      dueDay: parseInt(dueDay),
    };
    
    if(isEditing) {
        onSave({ ...billData, id: billToEdit.id });
    } else {
        onSave(billData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Editar Conta' : 'Nova Conta ou Assinatura'}</h2>
          
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Netflix, Aluguel" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor Mensal</label>
              <input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
             <div>
              <label htmlFor="dueDay" className="text-sm font-medium text-slate-600 dark:text-slate-300">Dia do Vencimento</label>
              <input id="dueDay" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="Ex: 10" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">{isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};