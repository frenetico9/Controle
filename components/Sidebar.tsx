import React from 'react';
import type { View } from '../types';
import { DashboardIcon, TransactionsIcon, GoalsIcon, SettingsIcon, WalletIcon, LogoutIcon, UserIcon } from './icons';
import { useAuth } from './Auth';

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
          ? 'bg-primary-500 text-white shadow-md'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { view: 'dashboard' as View, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'transactions' as View, label: 'Transações', icon: <TransactionsIcon className="w-6 h-6" /> },
    { view: 'goals' as View, label: 'Metas', icon: <GoalsIcon className="w-6 h-6" /> },
    { view: 'settings' as View, label: 'Configurações', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
      <aside
        className={`absolute md:relative flex flex-col w-64 bg-white dark:bg-slate-800 shadow-xl h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:min-w-[256px]`}
      >
        <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-700">
          <WalletIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold ml-2 text-slate-800 dark:text-white">Finança Leve</h1>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                activeView={activeView}
                onClick={() => {
                  setActiveView(item.view);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User Avatar" className="rounded-full w-10 h-10" />
            ) : (
                <div className="rounded-full w-10 h-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-500"/>
                </div>
            )}
            <div className="ml-3 flex-1 overflow-hidden">
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="ml-2 p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};