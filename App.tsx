import React, { useState, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { GoalsTracker } from './components/GoalsTracker';
import { Settings } from './components/Settings';
import type { View, Transaction, Goal } from './types';
import { AddTransactionModal } from './components/AddTransactionModal';
import { EditGoalModal } from './components/EditGoalModal';
import { AddProgressModal } from './components/AddProgressModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PlusIcon, WalletIcon } from './components/icons';
import { useAuth, LoginPage } from './components/Auth';

const App: React.FC = () => {
  const { 
    user, 
    transactions, 
    goals, 
    currency, 
    isDarkMode, 
    isLoading,
    toggleDarkMode,
    saveTransaction,
    deleteTransaction,
    saveGoal,
    deleteGoal,
    addProgressToGoal,
    setCurrency
  } = useAuth();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // Modal states
  const [addTransactionModalOpen, setAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [addingProgressGoal, setAddingProgressGoal] = useState<Goal | null>(null);

  const handleSaveTransaction = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    await saveTransaction(transaction);
    setAddTransactionModalOpen(false);
    setEditingTransaction(null);
  };
  
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setDeletingTransaction(null);
  };

  const handleSaveGoal = async (goal: Goal) => {
    await saveGoal(goal);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    setDeletingGoal(null);
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
      await addProgressToGoal(goalId, amount);
      setAddingProgressGoal(null);
  }
  
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const handleEditTransaction = (transaction: Transaction) => {
      setEditingTransaction(transaction);
      setAddTransactionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <WalletIcon className="h-12 w-12 text-primary-600 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-300">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} goals={goals} balance={totalBalance} currency={currency} />;
      case 'transactions':
        return <TransactionsList transactions={transactions} onEdit={handleEditTransaction} onDelete={setDeletingTransaction} currency={currency}/>;
      case 'goals':
        return <GoalsTracker goals={goals} onAddGoal={handleSaveGoal} onEdit={setEditingGoal} onDelete={setDeletingGoal} onAddProgress={setAddingProgressGoal} currency={currency} />;
      case 'settings':
        return <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} currency={currency} setCurrency={setCurrency} />;
      default:
        return <Dashboard transactions={transactions} goals={goals} balance={totalBalance} currency={currency} />;
    }
  };

  return (
    <div className={`flex h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      
      {/* FAB */}
      <button
        onClick={() => { setEditingTransaction(null); setAddTransactionModalOpen(true); }}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 z-20"
        aria-label="Adicionar Transação"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
      
      {/* Modals */}
      {(addTransactionModalOpen || editingTransaction) && (
        <AddTransactionModal 
            onClose={() => { setAddTransactionModalOpen(false); setEditingTransaction(null); }} 
            onSaveTransaction={handleSaveTransaction}
            transactionToEdit={editingTransaction}
        />
      )}
      
      {deletingTransaction && (
        <ConfirmationModal
          title="Excluir Transação"
          description="Você tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          onConfirm={() => handleDeleteTransaction(deletingTransaction.id)}
          onClose={() => setDeletingTransaction(null)}
        />
      )}

      {editingGoal && (
        <EditGoalModal
            goal={editingGoal}
            onSave={handleSaveGoal}
            onClose={() => setEditingGoal(null)}
        />
      )}

      {deletingGoal && (
        <ConfirmationModal
          title="Excluir Meta"
          description="Você tem certeza que deseja excluir esta meta? Todo o progresso será perdido."
          onConfirm={() => handleDeleteGoal(deletingGoal.id)}
          onClose={() => setDeletingGoal(null)}
        />
      )}

      {addingProgressGoal && (
        <AddProgressModal
            goal={addingProgressGoal}
            onAddProgress={handleAddProgress}
            onClose={() => setAddingProgressGoal(null)}
            currency={currency}
        />
      )}
    </div>
  );
};

export default App;