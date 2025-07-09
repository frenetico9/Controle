import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { GoalsTracker } from './components/GoalsTracker';
import { Settings } from './components/Settings';
import type { View, Transaction, Goal, BudgetEnvelope, Debt, Investment, RecurringBill, Asset } from './types';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { EditGoalModal } from './components/modals/EditGoalModal';
import { AddProgressModal } from './components/modals/AddProgressModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PlusIcon, WalletIcon, InstallIcon } from './components/icons';
import { useAuth, LoginPage } from './components/Auth';
import { BudgetView } from './components/BudgetView';
import { AddEnvelopeModal } from './components/modals/AddEnvelopeModal';
import { DebtView } from './components/DebtView';
import { AddDebtModal } from './components/modals/AddDebtModal';
import { PortfolioView } from './components/PortfolioView';
import { AddInvestmentModal } from './components/modals/AddInvestmentModal';
import { BillsView } from './components/BillsView';
import { AddBillModal } from './components/modals/AddBillModal';
import { AssetsView } from './components/AssetsView';
import { AddAssetModal } from './components/modals/AddAssetModal';
import { ReportsView } from './components/ReportsView';

// ADDED: InstallPWA component logic moved here to fix a build resolution issue.
const InstallPWA: React.FC = () => {
    const { canInstall, triggerInstallPrompt } = useAuth();
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (canInstall) {
            // Use a timeout to avoid being too intrusive on page load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [canInstall]);

    const handleInstallClick = () => {
        triggerInstallPrompt();
        setIsVisible(false); // Hide banner after interaction
    };
    
    const handleDismiss = () => {
        setIsVisible(false); // Allow user to dismiss
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-600 text-white p-3 z-50 flex items-center justify-between shadow-lg animate-slide-up">
            <style>
            {`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}
            </style>
            <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
                <InstallIcon className="w-8 h-8 flex-shrink-0"/>
                <div className="flex-grow min-w-0">
                    <p className="font-bold truncate">Instale o App Controle de Finanças</p>
                    <p className="text-sm opacity-90 hidden sm:block">Acesso rápido e offline na sua tela inicial.</p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <button 
                    onClick={handleDismiss} 
                    className="font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-black/20 transition-colors"
                >
                    Agora não
                </button>
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 font-semibold text-sm bg-white text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-md transition-colors shadow"
                    aria-label="Instalar Aplicativo"
                >
                    <InstallIcon className="w-4 h-4" />
                    <span>Instalar</span>
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const { 
    user, 
    isLoading,
    // Data
    transactions, 
    goals, 
    envelopes,
    debts,
    investments,
    bills,
    assets,
    achievements,
    // General
    currency, 
    isDarkMode, 
    toggleDarkMode,
    setCurrency,
    // Transactions
    saveTransaction,
    deleteTransaction,
    // Goals
    saveGoal,
    deleteGoal,
    addProgressToGoal,
    // Envelopes
    saveEnvelope,
    deleteEnvelope,
    // Debts
    saveDebt,
    deleteDebt,
    // Investments
    saveInvestment,
    deleteInvestment,
    // Bills
    saveBill,
    deleteBill,
    // Assets
    saveAsset,
    deleteAsset,
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

  const [addEnvelopeModalOpen, setAddEnvelopeModalOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<BudgetEnvelope | null>(null);
  const [deletingEnvelope, setDeletingEnvelope] = useState<BudgetEnvelope | null>(null);

  const [addDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

  const [addInvestmentModalOpen, setAddInvestmentModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);

  const [addBillModalOpen, setAddBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [deletingBill, setDeletingBill] = useState<RecurringBill | null>(null);
  
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  // --- Handlers ---
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
  
  const handleSaveEnvelope = async (envelope: Omit<BudgetEnvelope, 'id' | 'spentAmount'> & { id?: string }) => {
    await saveEnvelope(envelope);
    setAddEnvelopeModalOpen(false);
    setEditingEnvelope(null);
  };

  const handleSaveDebt = async (debt: Omit<Debt, 'id'> & { id?: string }) => {
    await saveDebt(debt);
    setAddDebtModalOpen(false);
    setEditingDebt(null);
  }

  const handleSaveInvestment = async (investment: Omit<Investment, 'id' | 'performance'> & { id?: string }) => {
    await saveInvestment(investment);
    setAddInvestmentModalOpen(false);
    setEditingInvestment(null);
  }

  const handleSaveBill = async (bill: Omit<RecurringBill, 'id'> & { id?: string }) => {
    await saveBill(bill);
    setAddBillModalOpen(false);
    setEditingBill(null);
  }
  
  const handleSaveAsset = async (asset: Omit<Asset, 'id'> & { id?: string }) => {
    await saveAsset(asset);
    setAddAssetModalOpen(false);
    setEditingAsset(null);
  }

  // --- Memoized Calculations ---
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);
  
  const netWorth = useMemo(() => {
    const investmentValue = investments.reduce((sum, i) => sum + i.quantity * i.currentPrice, 0); 
    const assetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const debtValue = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    return totalBalance + investmentValue + assetValue - debtValue;
  }, [totalBalance, investments, assets, debts]);

  const handleEditTransaction = (transaction: Transaction) => {
      setEditingTransaction(transaction);
      setAddTransactionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <WalletIcon className="h-12 w-12 text-primary-600 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-300">Carregando seu universo financeiro...</p>
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
        return <Dashboard 
            transactions={transactions} 
            goals={goals} 
            balance={totalBalance} 
            currency={currency} 
            netWorth={netWorth}
            investments={investments}
            debts={debts}
            envelopes={envelopes}
            bills={bills}
            assets={assets}
        />;
      case 'transactions':
        return <TransactionsList transactions={transactions} onEdit={handleEditTransaction} onDelete={setDeletingTransaction} currency={currency}/>;
      case 'budget':
        return <BudgetView envelopes={envelopes} currency={currency} onAdd={() => { setEditingEnvelope(null); setAddEnvelopeModalOpen(true);}} onEdit={setEditingEnvelope} onDelete={setDeletingEnvelope} />;
      case 'debts':
        return <DebtView debts={debts} currency={currency} onAdd={() => { setEditingDebt(null); setAddDebtModalOpen(true); }} onEdit={setEditingDebt} onDelete={setDeletingDebt} />;
      case 'portfolio':
        return <PortfolioView investments={investments} currency={currency} onAdd={() => { setEditingInvestment(null); setAddInvestmentModalOpen(true); }} onEdit={setEditingInvestment} onDelete={setDeletingInvestment} />;
      case 'bills':
          return <BillsView bills={bills} currency={currency} onAdd={() => { setEditingBill(null); setAddBillModalOpen(true); }} onEdit={setEditingBill} onDelete={setDeletingBill} />;
      case 'assets':
          return <AssetsView assets={assets} currency={currency} onAdd={() => { setEditingAsset(null); setAddAssetModalOpen(true); }} onEdit={setEditingAsset} onDelete={setDeletingAsset} />;
      case 'goals':
        return <GoalsTracker goals={goals} onAddGoal={handleSaveGoal} onEdit={setEditingGoal} onDelete={setDeletingGoal} onAddProgress={setAddingProgressGoal} currency={currency} />;
      case 'reports':
          return <ReportsView 
            currency={currency} 
            transactions={transactions}
            goals={goals}
            netWorthData={{ balance: totalBalance, investments, assets, debts, envelopes, bills }} 
          />;
      case 'settings':
        return <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} currency={currency} setCurrency={setCurrency} achievements={achievements} />;
      default:
        return <Dashboard 
            transactions={transactions} 
            goals={goals} 
            balance={totalBalance} 
            currency={currency} 
            netWorth={netWorth}
            investments={investments}
            debts={debts}
            envelopes={envelopes}
            bills={bills}
            assets={assets}
        />;
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
      
      <InstallPWA />

      {/* --- Modals --- */}
      {(addTransactionModalOpen || editingTransaction) && (
        <AddTransactionModal 
            onClose={() => { setAddTransactionModalOpen(false); setEditingTransaction(null); }} 
            onSaveTransaction={handleSaveTransaction}
            transactionToEdit={editingTransaction}
            envelopes={envelopes}
        />
      )}
      
      {deletingTransaction && (
        <ConfirmationModal
          title="Excluir Transação"
          description="Você tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          onConfirm={() => handleDeleteTransaction(deletingTransaction.id).then(() => setDeletingTransaction(null))}
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
          onConfirm={() => handleDeleteGoal(deletingGoal.id).then(() => setDeletingGoal(null))}
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

      {(addEnvelopeModalOpen || editingEnvelope) && (
        <AddEnvelopeModal
          onClose={() => { setAddEnvelopeModalOpen(false); setEditingEnvelope(null); }}
          onSave={handleSaveEnvelope}
          envelopeToEdit={editingEnvelope}
        />
      )}

      {deletingEnvelope && (
        <ConfirmationModal
          title="Excluir Envelope"
          description="Tem certeza? Excluir este envelope não excluirá as transações associadas, mas elas perderão o vínculo."
          onConfirm={() => deleteEnvelope(deletingEnvelope.id).then(() => setDeletingEnvelope(null))}
          onClose={() => setDeletingEnvelope(null)}
        />
      )}

      {(addDebtModalOpen || editingDebt) && (
        <AddDebtModal
          onClose={() => { setAddDebtModalOpen(false); setEditingDebt(null); }}
          onSave={handleSaveDebt}
          debtToEdit={editingDebt}
        />
      )}
      
      {deletingDebt && (
        <ConfirmationModal
          title="Excluir Dívida"
          description="Tem certeza que deseja remover esta dívida do rastreamento?"
          onConfirm={() => deleteDebt(deletingDebt.id).then(() => setDeletingDebt(null))}
          onClose={() => setDeletingDebt(null)}
        />
      )}

      {(addInvestmentModalOpen || editingInvestment) && (
        <AddInvestmentModal
          onClose={() => { setAddInvestmentModalOpen(false); setEditingInvestment(null); }}
          onSave={handleSaveInvestment}
          investmentToEdit={editingInvestment}
        />
      )}

      {deletingInvestment && (
        <ConfirmationModal
          title="Excluir Investimento"
          description="Tem certeza que deseja remover este investimento do seu portfólio?"
          onConfirm={() => deleteInvestment(deletingInvestment.id).then(() => setDeletingInvestment(null))}
          onClose={() => setDeletingInvestment(null)}
        />
      )}
      
      {(addBillModalOpen || editingBill) && (
        <AddBillModal
          onClose={() => { setAddBillModalOpen(false); setEditingBill(null); }}
          onSave={handleSaveBill}
          billToEdit={editingBill}
        />
      )}

      {deletingBill && (
        <ConfirmationModal
          title="Excluir Conta/Assinatura"
          description="Tem certeza que deseja remover esta conta recorrente?"
          onConfirm={() => deleteBill(deletingBill.id).then(() => setDeletingBill(null))}
          onClose={() => setDeletingBill(null)}
        />
      )}

      {(addAssetModalOpen || editingAsset) && (
        <AddAssetModal
          onClose={() => { setAddAssetModalOpen(false); setEditingAsset(null); }}
          onSave={handleSaveAsset}
          assetToEdit={editingAsset}
        />
      )}

      {deletingAsset && (
        <ConfirmationModal
          title="Excluir Bem"
          description="Tem certeza que deseja remover este bem do seu patrimônio?"
          onConfirm={() => deleteAsset(deletingAsset.id).then(() => setDeletingAsset(null))}
          onClose={() => setDeletingAsset(null)}
        />
      )}
    </div>
  );
};

export default App;
