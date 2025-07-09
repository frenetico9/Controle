import React from 'react';
import type { View } from '../types';
import { 
    DashboardIcon, TransactionsIcon, GoalsIcon, SettingsIcon, WalletIcon, LogoutIcon, UserIcon,
    BudgetIcon, DebtIcon, PortfolioIcon, BillsIcon, AssetsIcon, ReportsIcon 
} from './icons';
import { useAuth } from './Auth';
import { maskEmail } from '../utils/formatters';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactNode;
  activeView: View;
  onClick: () => void;
}> = ({ view, label, icon, activeView, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        activeView === view
          ? 'bg-primary-600 text-white shadow-md font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setOpen }) => {
  const { user, logout } = useAuth();

  const mainNavItems = [
    { view: 'dashboard' as View, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'transactions' as View, label: 'Transações', icon: <TransactionsIcon className="w-6 h-6" /> },
    { view: 'reports' as View, label: 'Relatórios', icon: <ReportsIcon className="w-6 h-6" /> },
  ];

  const planningNavItems = [
    { view: 'budget' as View, label: 'Orçamento', icon: <BudgetIcon className="w-6 h-6" /> },
    { view: 'goals' as View, label: 'Metas', icon: <GoalsIcon className="w-6 h-6" /> },
    { view: 'debts' as View, label: 'Dívidas', icon: <DebtIcon className="w-6 h-6" /> },
  ];

  const assetsNavItems = [
    { view: 'portfolio' as View, label: 'Investimentos', icon: <PortfolioIcon className="w-6 h-6" /> },
    { view: 'assets' as View, label: 'Bens', icon: <AssetsIcon className="w-6 h-6" /> },
    { view: 'bills' as View, label: 'Contas', icon: <BillsIcon className="w-6 h-6" /> },
  ];

  const handleNavItemClick = (view: View) => {
    setActiveView(view);
    setOpen(false);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
      <aside
        className={`absolute md:relative flex flex-col w-64 bg-white dark:bg-slate-800 shadow-xl h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:min-w-[256px]`}
      >
        <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-700 px-4">
          <WalletIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-xl font-bold ml-2 text-slate-800 dark:text-white truncate">Controle de Finanças</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Principal</h2>
            <ul className="space-y-2">
              {mainNavItems.map((item) => (
                <NavItem key={item.view} {...item} activeView={activeView} onClick={() => handleNavItemClick(item.view)} />
              ))}
            </ul>
          </div>
          <div>
            <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Planejamento</h2>
            <ul className="space-y-2">
              {planningNavItems.map((item) => (
                <NavItem key={item.view} {...item} activeView={activeView} onClick={() => handleNavItemClick(item.view)} />
              ))}
            </ul>
          </div>
           <div>
            <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Ativos e Contas</h2>
            <ul className="space-y-2">
              {assetsNavItems.map((item) => (
                <NavItem key={item.view} {...item} activeView={activeView} onClick={() => handleNavItemClick(item.view)} />
              ))}
            </ul>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
           <NavItem
              view={'settings'}
              label={'Configurações'}
              icon={<SettingsIcon className="w-6 h-6" />}
              activeView={activeView}
              onClick={() => handleNavItemClick('settings')}
            />
          <div className="flex items-center mt-4">
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User Avatar" className="rounded-full w-10 h-10" />
            ) : (
                <div className="rounded-full w-10 h-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-500"/>
                </div>
            )}
            <div className="ml-3 flex-1 overflow-hidden">
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user ? maskEmail(user.email) : ''}</p>
            </div>
            <button onClick={logout} className="ml-2 p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Sair">
                <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
