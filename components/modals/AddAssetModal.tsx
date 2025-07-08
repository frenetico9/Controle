import React, { useState, useEffect } from 'react';
import type { Asset, AssetType } from '../../types';

interface AddAssetModalProps {
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id'> & { id?: string }) => void;
  assetToEdit?: Asset | null;
}

const assetTypes: AssetType[] = ['Imóvel', 'Veículo', 'Outro'];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onSave, assetToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('Veículo');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!assetToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(assetToEdit.name);
      setType(assetToEdit.type);
      setPurchasePrice(String(assetToEdit.purchasePrice));
      setCurrentValue(String(assetToEdit.currentValue));
    }
  }, [assetToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !purchasePrice || !currentValue) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    
    const assetData = {
      name,
      type,
      purchasePrice: parseFloat(purchasePrice),
      currentValue: parseFloat(currentValue),
    };
    
    if(isEditing) {
        onSave({ ...assetData, id: assetToEdit.id });
    } else {
        onSave(assetData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Editar Bem' : 'Adicionar Novo Bem'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome do Bem</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Carro, Apartamento" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium text-slate-600 dark:text-slate-300">Tipo</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as AssetType)} required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500">
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor de Compra</label>
              <input id="purchasePrice" type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="currentValue" className="text-sm font-medium text-slate-600 dark:text-slate-300">Valor Atual Estimado</label>
              <input id="currentValue" type="number" step="0.01" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="0,00" required className="mt-1 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">{isEditing ? 'Salvar Alterações' : 'Adicionar Bem'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};