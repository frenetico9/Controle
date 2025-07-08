import React, { useState, useEffect } from 'react';
import type { Investment, InvestmentType } from '../../types';

interface AddInvestmentModalProps {
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id' | 'performance'> & { id?: string }) => void;
  investmentToEdit?: Investment | null;
}

const investmentTypes: InvestmentType[] = ['Ação', 'FII', 'Cripto', 'Renda Fixa', 'Outro'];

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ onClose, onSave, investmentToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Ação');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!investmentToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(investmentToEdit.name);
      setType(investmentToEdit.type);
      setQuantity(String(investmentToEdit.quantity));
      setPurchasePrice(String(investmentToEdit.purchasePrice));
      setCurrentPrice(String(investmentToEdit.currentPrice));
    }
  }, [investmentToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !purchasePrice || !currentPrice) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    
    const investmentData = {
      name,
      type,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice: parseFloat(currentPrice),
    };
    
    if(isEditing) {
        onSave({ ...investmentData, id: investmentToEdit.id });
    } else {
        onSave(investmentData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Editar Investimento' : 'Adicionar Investimento'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome do Ativo</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Bitcoin, Ação XYZ" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium text-slate-600 dark:text-slate-300">Tipo</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as InvestmentType)} required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500">
                {investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="text-sm font-medium text-slate-600 dark:text-slate-300">Quantidade</label>
            <input id="quantity" type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ex: 10 ou 0.005" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="purchasePrice" className="text-sm font-medium text-slate-600 dark:text-slate-300">Preço de Compra (Unitário)</label>
                <input id="purchasePrice" type="number" step="any" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
                <label htmlFor="currentPrice" className="text-sm font-medium text-slate-600 dark:text-slate-300">Preço Atual (Unitário)</label>
                <input id="currentPrice" type="number" step="any" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};