import React from 'react';
import type { Currency, Investment, Asset, Debt, BudgetEnvelope, RecurringBill, Transaction, Goal } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';
import { DownloadIcon, ArrowUpIcon, ArrowDownIcon, WalletIcon } from './icons';
import { exportNetWorthPDF, exportFullReportToExcel } from '../services/exportService';
import { useAuth } from './Auth';

interface ReportsViewProps {
  currency: Currency;
  transactions: Transaction[];
  goals: Goal[];
  netWorthData: {
    balance: number;
    investments: Investment[];
    assets: Asset[];
    debts: Debt[];
    envelopes: BudgetEnvelope[];
    bills: RecurringBill[];
  }
}

const ReportCard: React.FC<{title: string, value: string, icon: React.ReactNode, details: React.ReactNode}> = ({title, value, icon, details}) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
            </div>
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700">
                {icon}
            </div>
        </div>
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            {details}
        </div>
    </div>
);


export const ReportsView: React.FC<ReportsViewProps> = ({ currency, netWorthData, transactions, goals }) => {
    const { user } = useAuth();
    const currencyFormatter = getCurrencyFormatter(currency);
    const { balance, investments, assets, debts } = netWorthData;
    
    const totalInvestments = investments.reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0);
    const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalDebts = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    
    const totalAssetSum = balance + totalInvestments + totalAssetsValue;
    const netWorth = totalAssetSum - totalDebts;

    const handlePdfExport = () => {
        if (user) {
            exportNetWorthPDF(netWorthData, currency, user.name);
        }
    };
    
    const handleExcelExport = () => {
        if (user) {
            exportFullReportToExcel({
                ...netWorthData,
                transactions,
                goals,
            }, currency, user.name);
        }
    }
    
    return (
        <div className="space-y-6">
             <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Demonstrativo de Patrimônio Líquido</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Uma visão completa da sua saúde financeira.</p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={handleExcelExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
                        <DownloadIcon className="w-5 h-5" /> Excel
                    </button>
                    <button onClick={handlePdfExport} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition">
                        <DownloadIcon className="w-5 h-5" /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                   <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                     <p className="text-sm font-medium text-green-800 dark:text-green-300">Total de Ativos</p>
                     <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currencyFormatter.format(totalAssetSum)}</p>
                   </div>
                   <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                     <p className="text-sm font-medium text-red-800 dark:text-red-300">Total de Passivos (Dívidas)</p>
                     <p className="text-3xl font-bold text-red-600 dark:text-red-400">{currencyFormatter.format(totalDebts)}</p>
                   </div>
                </div>
                 <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                     <p className="text-lg font-bold text-indigo-800 dark:text-indigo-300">PATRIMÔNIO LÍQUIDO</p>
                     <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 my-2">{currencyFormatter.format(netWorth)}</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <ReportCard 
                    title="Caixa e Contas" 
                    value={currencyFormatter.format(balance)}
                    icon={<WalletIcon className="w-7 h-7 text-primary-600 dark:text-primary-400" />}
                    details={<p className="text-sm text-slate-500 dark:text-slate-400">Soma dos saldos de todas as suas contas correntes e poupanças.</p>}
                />
                 <ReportCard 
                    title="Investimentos" 
                    value={currencyFormatter.format(totalInvestments)}
                    icon={<ArrowUpIcon className="w-7 h-7 text-green-600 dark:text-green-400" />}
                    details={
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                          {investments.slice(0, 3).map(i => <li key={i.id} className="flex justify-between items-center"><span className="truncate pr-2">{i.name}</span> <span className="font-medium flex-shrink-0">{currencyFormatter.format(i.quantity * i.currentPrice)}</span></li>)}
                          {investments.length > 3 && <li>...e mais {investments.length - 3}</li>}
                          {investments.length === 0 && <li className="text-slate-400">Nenhum investimento adicionado.</li>}
                        </ul>
                    }
                />
                 <ReportCard 
                    title="Bens Físicos" 
                    value={currencyFormatter.format(totalAssetsValue)}
                    icon={<WalletIcon className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />}
                    details={
                         <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                           {assets.slice(0, 3).map(a => <li key={a.id} className="flex justify-between items-center"><span className="truncate pr-2">{a.name}</span> <span className="font-medium flex-shrink-0">{currencyFormatter.format(a.currentValue)}</span></li>)}
                           {assets.length > 3 && <li>...e mais {assets.length - 3}</li>}
                           {assets.length === 0 && <li className="text-slate-400">Nenhum bem adicionado.</li>}
                        </ul>
                    }
                />
                <ReportCard 
                    title="Dívidas" 
                    value={currencyFormatter.format(totalDebts)}
                    icon={<ArrowDownIcon className="w-7 h-7 text-red-600 dark:text-red-400" />}
                    details={
                         <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                           {debts.slice(0, 3).map(d => <li key={d.id} className="flex justify-between items-center"><span className="truncate pr-2">{d.name}</span> <span className="font-medium flex-shrink-0">{currencyFormatter.format(d.totalAmount)}</span></li>)}
                           {debts.length > 3 && <li>...e mais {debts.length - 3}</li>}
                           {debts.length === 0 && <li className="text-slate-400">Nenhuma dívida adicionada.</li>}
                        </ul>
                    }
                />
            </div>

        </div>
    );
};