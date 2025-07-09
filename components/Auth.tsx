import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Transaction, Goal, Currency, BudgetEnvelope, Debt, Investment, RecurringBill, Asset, Achievement } from '../types';
import usePersistentState from '../hooks/usePersistentState';
import * as db from '../services/db';
import { WalletIcon, FirstStepIcon, MedalIcon, TrophyIcon } from './icons';

// --- Achievements Definition ---
const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
    { id: 'first_transaction', title: 'Primeiro Passo', description: 'Você registrou sua primeira transação!', icon: FirstStepIcon },
    { id: 'first_budget', title: 'Orçamentista', description: 'Você criou seu primeiro envelope de orçamento.', icon: MedalIcon },
    { id: 'first_goal', title: 'Sonhador', description: 'Sua primeira meta foi definida. Vamos alcançá-la!', icon: MedalIcon },
    { id: 'debt_slayer', title: 'Caça-Dívidas', description: 'Você adicionou uma dívida para acompanhar.', icon: MedalIcon },
    { id: 'investor', title: 'Investidor', description: 'Você começou a acompanhar seus investimentos.', icon: TrophyIcon },
    { id: 'budget_master', title: 'Mestre do Orçamento', description: 'Manteve-se dentro do orçamento em um mês.', icon: TrophyIcon },
];

interface AuthContextType {
  user: User | null;
  // Data
  transactions: Transaction[];
  goals: Goal[];
  envelopes: BudgetEnvelope[];
  debts: Debt[];
  investments: Investment[];
  bills: RecurringBill[];
  assets: Asset[];
  achievements: Achievement[];
  // General
  currency: Currency;
  isDarkMode: boolean;
  isLoading: boolean;
  // Auth & Profile
  login: (email: string, pass:string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  toggleDarkMode: () => void;
  setCurrency: (currency: Currency) => Promise<void>;
  updateUserProfile: (data: { name: string; email: string; avatarUrl?: string; }) => Promise<{ success: boolean; message?: string; }>;
  // Transactions
  saveTransaction: (transaction: Omit<Transaction, 'id' | 'envelopeId'> & { id?: string, envelopeId?: string | null }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // Goals
  saveGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addProgressToGoal: (goalId: string, amount: number) => Promise<void>;
  // Envelopes
  saveEnvelope: (envelope: Omit<BudgetEnvelope, 'id' | 'spentAmount'> & { id?: string }) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  // Debts
  saveDebt: (debt: Omit<Debt, 'id'> & { id?: string }) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  // Investments
  saveInvestment: (investment: Omit<Investment, 'id' | 'currentPrice' | 'performance'> & { id?: string }) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  // Bills
  saveBill: (bill: Omit<RecurringBill, 'id'> & { id?: string }) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  // Assets
  saveAsset: (asset: Omit<Asset, 'id'> & { id?: string }) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  // PWA Install
  triggerInstallPrompt: () => void;
  canInstall: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = usePersistentState<User | null>('financa-leve-user', null);
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [isDarkMode, setIsDarkMode] = usePersistentState('theme:dark', false);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- PWA Installation Logic ---
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (installed)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for the browser's install prompt
    const handler = (e: Event) => {
        e.preventDefault();
        setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstallPrompt = () => {
    if (installPromptEvent) {
      // Show the native browser prompt
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA prompt');
        } else {
          console.log('User dismissed the PWA prompt');
        }
        // The prompt can only be used once.
        setInstallPromptEvent(null);
      });
    }
  };


  // --- Achievements Calculator ---
  const calculateAchievements = useCallback((data: { transactions: Transaction[], envelopes: BudgetEnvelope[], goals: Goal[], debts: Debt[], investments: Investment[] }) => {
    const unlockedAchievements = new Set<string>();

    if (data.transactions.length > 0) unlockedAchievements.add('first_transaction');
    if (data.envelopes.length > 0) unlockedAchievements.add('first_budget');
    if (data.goals.length > 0) unlockedAchievements.add('first_goal');
    if (data.debts.length > 0) unlockedAchievements.add('debt_slayer');
    if (data.investments.length > 0) unlockedAchievements.add('investor');
    // TODO: Implement 'budget_master' logic (more complex check)

    const fullAchievements = ALL_ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: unlockedAchievements.has(ach.id)
    }));
    setAchievements(fullAchievements);
  }, []);

  // --- Data Loading Effect ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (user?.id) {
        const allData = await db.getAllUserData(user.id);
        setTransactions(allData.transactions);
        setGoals(allData.goals);
        setEnvelopes(allData.envelopes);
        setDebts(allData.debts);
        setInvestments(allData.investments);
        setBills(allData.bills);
        setAssets(allData.assets);
        calculateAchievements(allData);
      } else {
        // Clear all data if no user
        setTransactions([]);
        setGoals([]);
        setEnvelopes([]);
        setDebts([]);
        setInvestments([]);
        setBills([]);
        setAssets([]);
        setAchievements([]);
      }
      setIsLoading(false);
    };
    init();
  }, [user, calculateAchievements]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), [setIsDarkMode]);

  // --- Auth Functions ---
  const login = async (email: string, pass: string): Promise<boolean> => {
    const loggedInUser = await db.login(email, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const { user: newUser, error } = await db.register(name, email, pass);
    if (error) return { success: false, message: error };
    if (newUser) {
      await login(email, pass);
      return { success: true };
    }
    return { success: false, message: 'Ocorreu um erro desconhecido.' };
  };

  const logout = () => setUser(null);

  const setCurrency = async (currency: Currency) => {
    if (!user) return;
    await db.updateUserCurrency(user.id, currency);
    setUser(prev => prev ? { ...prev, currency } : null);
  }

  const updateUserProfile = async (data: { name: string; email: string; avatarUrl?: string; }): Promise<{ success: boolean; message?: string; }> => {
    if (!user) return { success: false, message: "Usuário não logado" };
    const { user: updatedUser, error } = await db.updateUserProfile(user.id, data);
    if (error) return { success: false, message: error };
    if (updatedUser) {
        setUser(updatedUser);
        return { success: true };
    }
    return { success: false, message: "Falha ao atualizar o perfil." };
  };

  // --- Generic Save/Delete Handlers ---
  const createSaveHandler = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>, addFunc: Function, updateFunc: Function) => {
    return async (item: Omit<T, 'id'> & { id?: string }) => {
      if (!user) throw new Error("User not logged in");
      let result;
      if (item.id) { // Editing
          result = await updateFunc(item.id, item);
          setter(prev => prev.map(i => i.id === result.id ? result : i));
      } else { // Adding
          result = await addFunc(user.id, item);
          setter(prev => [...prev, result]);
      }
      return result;
    }
  };

  const createDeleteHandler = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>, deleteFunc: Function) => {
      return async (id: string) => {
          await deleteFunc(id);
          setter(prev => prev.filter(i => i.id !== id));
      }
  };

  // --- Specific Implementations ---
  const saveTransaction = async (transaction: Omit<Transaction, 'id' | 'envelopeId'> & { id?: string, envelopeId?: string | null }) => {
    if (!user) return;

    // 1. Save the transaction to the database
    if (transaction.id) {
      await db.updateTransaction(transaction.id, transaction as Omit<Transaction, 'id'>);
    } else {
      await db.addTransaction(user.id, transaction as Omit<Transaction, 'id'>);
    }
    
    // 2. Refetch transactions and envelopes to get fresh data
    const [updatedTransactions, updatedEnvelopes] = await Promise.all([
        db.getTransactions(user.id),
        db.getEnvelopes(user.id)
    ]);

    // 3. Update local state with the fresh data
    setTransactions(updatedTransactions);
    setEnvelopes(updatedEnvelopes);

    // 4. Recalculate achievements with the fresh data
    calculateAchievements({
        transactions: updatedTransactions, 
        envelopes: updatedEnvelopes, 
        goals, 
        debts, 
        investments
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    // 1. Delete from DB
    await db.deleteTransaction(id);

    // 2. Refetch transactions and envelopes
    const [updatedTransactions, updatedEnvelopes] = await Promise.all([
        db.getTransactions(user.id),
        db.getEnvelopes(user.id)
    ]);

    // 3. Update local state
    setTransactions(updatedTransactions);
    setEnvelopes(updatedEnvelopes);

    // 4. Recalculate achievements
    calculateAchievements({
        transactions: updatedTransactions, 
        envelopes: updatedEnvelopes, 
        goals, 
        debts, 
        investments
    });
  };
  
  const saveGoal = async (goal: Goal) => {
    const goalExists = goals.some(g => g.id === goal.id);
    if (goalExists) {
      const updatedGoal = await db.updateGoal(goal.id, goal);
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } else {
      if(!user) return;
      const newGoal = await db.addGoal(user.id, goal as Omit<Goal, 'id'>);
      setGoals(prev => [...prev, newGoal]);
      calculateAchievements({transactions, envelopes, goals: [...goals, newGoal], debts, investments});
    }
  };
  const deleteGoal = createDeleteHandler(setGoals, db.deleteGoal);

  const saveEnvelope = createSaveHandler(setEnvelopes, db.addEnvelope, db.updateEnvelope);
  const deleteEnvelope = createDeleteHandler(setEnvelopes, db.deleteEnvelope);
  const saveDebt = createSaveHandler(setDebts, db.addDebt, db.updateDebt);
  const deleteDebt = createDeleteHandler(setDebts, db.deleteDebt);
  const saveInvestment = createSaveHandler(setInvestments, db.addInvestment, db.updateInvestment);
  const deleteInvestment = createDeleteHandler(setInvestments, db.deleteInvestment);
  const saveBill = createSaveHandler(setBills, db.addBill, db.updateBill);
  const deleteBill = createDeleteHandler(setBills, db.deleteBill);
  const saveAsset = createSaveHandler(setAssets, db.addAsset, db.updateAsset);
  const deleteAsset = createDeleteHandler(setAssets, db.deleteAsset);


  const addProgressToGoal = async (goalId: string, amount: number) => {
      const updatedGoal = await db.addProgressToGoal(goalId, amount);
      const newAmount = Math.min(updatedGoal.currentAmount, updatedGoal.targetAmount);
      setGoals(prev => prev.map(g => g.id === goalId ? { ...updatedGoal, currentAmount: newAmount } : g));
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
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
        currency: user?.currency || 'BRL',
        isDarkMode,
        isLoading,
        // Auth
        login, 
        logout, 
        register,
        toggleDarkMode,
        setCurrency,
        updateUserProfile,
        // Handlers
        saveTransaction, deleteTransaction,
        saveGoal, deleteGoal, addProgressToGoal,
        saveEnvelope, deleteEnvelope,
        saveDebt, deleteDebt,
        saveInvestment, deleteInvestment,
        saveBill, deleteBill,
        saveAsset, deleteAsset,
        // PWA Install
        triggerInstallPrompt,
        canInstall: !isStandalone && !!installPromptEvent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a DataProvider');
  }
  return context;
};

export const LoginPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isRegistering) {
                if(!name) {
                    setError('Por favor, informe seu nome.');
                    return;
                }
                const result = await register(name, email, password);
                if (!result.success) {
                    setError(result.message || 'Ocorreu um erro no registro.');
                }
            } else {
                const success = await login(email, password);
                if (!success) {
                    setError('E-mail ou senha inválidos.');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <WalletIcon className="h-10 w-10 text-primary-600" />
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Controle de Finanças</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isRegistering ? 'Crie sua conta para começar a economizar.' : 'Seu controle financeiro, simples e elegante.'}
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isRegistering && (
                         <div>
                            <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-md text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Seu nome"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-md text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"
                               className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-md text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Sua senha"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <button type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Processando...' : (isRegistering ? 'Registrar' : 'Entrar')}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <button onClick={toggleForm} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                         {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};
