import React from 'react';
import type { RecurringBill, Currency } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { PlusIcon, EditIcon, DeleteIcon, BillsIcon } from './icons';

interface BillsViewProps {
  bills: RecurringBill[];
  currency: Currency;
  onAdd: () => void;
  onEdit: (bill: RecurringBill) => void;
  onDelete: (bill: RecurringBill) => void;
}

const BillCard: React.FC<{ bill: RecurringBill; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ bill, currencyFormatter, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">Dia</span>
            <span className="font-bold text-xl text-primary-600 dark:text-primary-400">{bill.dueDay}</span>
        </div>
        <div className="flex-grow min-w-0">
            <p className="font-bold text-slate-800 dark:text-slate-100 truncate pr-2">{bill.name}</p>
            <p className="font-semibold text-slate-600 dark:text-slate-300">{currencyFormatter.format(bill.amount)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
            <button onClick={onEdit} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors" aria-label="Editar">
                <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" aria-label="Excluir">
                <DeleteIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const BillRow: React.FC<{ bill: RecurringBill; currencyFormatter: Intl.NumberFormat; onEdit: () => void; onDelete: () => void; }> = ({ bill, currencyFormatter, onEdit, onDelete }) => {
    return (
        <tr className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{bill.name}</td>
            <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{currencyFormatter.format(bill.amount)}</td>
            <td className="p-4 text-slate-500 dark:text-slate-400">Todo dia {bill.dueDay}</td>
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

export const BillsView: React.FC<BillsViewProps> = ({ bills, currency, onAdd, onEdit, onDelete }) => {
    const currencyFormatter = getCurrencyFormatter(currency);

    const sortedBills = [...bills].sort((a,b) => a.dueDay - b.dueDay);
    const totalMonthlyCost = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contas e Assinaturas Recorrentes</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Custo Mensal Total: <span className="font-bold">{currencyFormatter.format(totalMonthlyCost)}</span></p>
            </div>
             <button onClick={onAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition">
                <PlusIcon className="w-5 h-5" /> Nova Conta
            </button>
        </div>
      </div>

       {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} currencyFormatter={currencyFormatter} onEdit={() => onEdit(bill)} onDelete={() => onDelete(bill)} />
        ))}
      </div>

       {/* Desktop View */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
            <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    <th className="p-4 font-semibold">Nome</th>
                    <th className="p-4 font-semibold">Valor</th>
                    <th className="p-4 font-semibold">Vencimento</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {sortedBills.map((bill) => (
                    <BillRow key={bill.id} bill={bill} currencyFormatter={currencyFormatter} onEdit={() => onEdit(bill)} onDelete={() => onDelete(bill)} />
                ))}
            </tbody>
        </table>
      </div>

       {bills.length === 0 && (
            <div className="text-center col-span-full py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <BillsIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>Nenhuma conta ou assinatura recorrente.</p>
                <p>Adicione suas contas para não perder mais nenhum vencimento.</p>
            </div>
        )}
    </div>
  );
};