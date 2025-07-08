import React from 'react';
import type { Asset, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { PlusIcon, EditIcon, DeleteIcon, AssetsIcon } from './icons';

interface AssetsViewProps {
  assets: Asset[];
  currency: Currency;
  onAdd: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

const AssetCard: React.FC<{ asset: Asset; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ asset, currencyFormatter, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow min-w-0">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pr-2">{asset.name}</p>
                 <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {asset.type}
                </span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400" aria-label="Editar">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400" aria-label="Excluir">
                    <DeleteIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-slate-500 dark:text-slate-400">Valor Atual</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-base">{currencyFormatter.format(asset.currentValue)}</p>
            </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400">Valor de Compra</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-base">{currencyFormatter.format(asset.purchasePrice)}</p>
            </div>
        </div>
    </div>
);


const AssetRow: React.FC<{ asset: Asset; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ asset, currencyFormatter, onEdit, onDelete }) => {
    return (
        <tr className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{asset.name}</td>
            <td className="p-4 text-slate-500 dark:text-slate-400">{asset.type}</td>
            <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(asset.currentValue)}</td>
            <td className="p-4 text-slate-500 dark:text-slate-400">{currencyFormatter.format(asset.purchasePrice)}</td>
            <td className="p-4 text-right">
                <div className="flex justify-end items-center gap-2">
                    <button onClick={onEdit} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors" aria-label="Editar">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" aria-label="Excluir">
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, currency, onAdd, onEdit, onDelete }) => {
    const currencyFormatter = getCurrencyFormatter(currency);

    const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Meus Bens e Patrimônio Físico</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Valor Total Estimado: <span className="font-bold">{currencyFormatter.format(totalAssetsValue)}</span></p>
            </div>
             <button onClick={onAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition">
                <PlusIcon className="w-5 h-5" /> Novo Bem
            </button>
        </div>
      </div>

       {/* Mobile View */}
       <div className="md:hidden space-y-4">
            {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} currencyFormatter={currencyFormatter} onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} />
            ))}
       </div>

       {/* Desktop View */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
            <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    <th className="p-4 font-semibold">Nome</th>
                    <th className="p-4 font-semibold">Tipo</th>
                    <th className="p-4 font-semibold">Valor Atual</th>
                    <th className="p-4 font-semibold">Valor de Compra</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset) => (
                    <AssetRow key={asset.id} asset={asset} currencyFormatter={currencyFormatter} onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} />
                ))}
            </tbody>
        </table>
      </div>
      
       {assets.length === 0 && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <AssetsIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>Nenhum bem ou patrimônio adicionado.</p>
                <p>Adicione itens como seu carro ou imóvel para ter uma visão completa do seu patrimônio.</p>
            </div>
        )}

    </div>
  );
};