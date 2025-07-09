import React from 'react';
import { MenuIcon } from './icons';
import type { View } from '../types';
import { InstallButtonHeader } from './InstallButtonHeader.tsx';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: View;
}

const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    transactions: 'Minhas Transações',
    goals: 'Minhas Metas',
    settings: 'Configurações',
    reports: 'Relatórios Financeiros',
    budget: 'Orçamento por Envelopes',
    debts: 'Plano de Quitação de Dívidas',
    portfolio: 'Portfólio de Investimentos',
    bills: 'Contas e Assinaturas',
    assets: 'Meus Bens'
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen, activeView }) => {
  return (
    <header className="flex-shrink-0 bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button
          className="md:hidden text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu lateral"
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0 md:px-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 truncate">{viewTitles[activeView] || 'Controle de Finanças'}</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
           <InstallButtonHeader />
        </div>
      </div>
    </header>
  );
};
