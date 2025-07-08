import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Transaction, Goal, Currency } from '../types';
import usePersistentState from '../hooks/usePersistentState';
import * as db from '../services/db';
import { WalletIcon } from './icons';

interface AuthContextType {
  user: User | null;
  transactions: Transaction[];
  goals: Goal[];
  currency: Currency;
  isDarkMode: boolean;
  isLoading: boolean;
  login: (email: string, pass:string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  toggleDarkMode: () => void;
  setCurrency: (currency: Currency) => Promise<void>;
  updateUserProfile: (data: { name: string; email: string; avatarUrl?: string; }) => Promise<{ success: boolean; message?: string; }>;
  saveTransaction: (transaction: Omit<Transaction, 'id'> & { id?: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addProgressToGoal: (goalId: string, amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = usePersistentState<User | null>('financa-leve-user', null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDarkMode, setIsDarkMode] = usePersistentState('theme:dark', false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (user?.id) {
        // Fetch fresh data for the logged-in user
        const [dbTransactions, dbGoals] = await Promise.all([
            db.getTransactions(user.id),
            db.getGoals(user.id)
        ]);
        setTransactions(dbTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setGoals(dbGoals);
      }
      setIsLoading(false);
    };
    init();
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), [setIsDarkMode]);

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
    if (error) {
        return { success: false, message: error };
    }
    if (newUser) {
        await login(email, pass);
        return { success: true };
    }
    return { success: false, message: 'Ocorreu um erro desconhecido.' };
  };

  const logout = () => {
    setUser(null);
    setTransactions([]);
    setGoals([]);
  };

  const setCurrency = async (currency: Currency) => {
    if (!user) return;
    await db.updateUserCurrency(user.id, currency);
    setUser(prev => prev ? { ...prev, currency } : null);
  }

  const updateUserProfile = async (data: { name: string; email: string; avatarUrl?: string; }): Promise<{ success: boolean; message?: string; }> => {
    if (!user) return { success: false, message: "Usuário não logado" };

    const { user: updatedUser, error } = await db.updateUserProfile(user.id, data);

    if (error) {
        return { success: false, message: error };
    }
    if (updatedUser) {
        setUser(updatedUser);
        return { success: true };
    }
    return { success: false, message: "Falha ao atualizar o perfil." };
  };

  const saveTransaction = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    if (!user) throw new Error("User not logged in");
    if (transaction.id) { // Editing
        const updatedTx = await db.updateTransaction(transaction.id, transaction as Omit<Transaction, 'id'>);
        setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else { // Adding
        const newTx = await db.addTransaction(user.id, transaction as Omit<Transaction, 'id'>);
        setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const deleteTransaction = async (id: string) => {
    await db.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const saveGoal = async (goal: Goal) => {
    if(!user) throw new Error("User not logged in");
    const goalExists = goals.some(g => g.id === goal.id);
    if(goalExists) { // Updating
        const updatedGoal = await db.updateGoal(goal.id, goal);
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } else { // Adding
        const newGoal = await db.addGoal(user.id, goal);
        setGoals(prev => [...prev, newGoal]);
    }
  };

  const deleteGoal = async (id: string) => {
      await db.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addProgressToGoal = async (goalId: string, amount: number) => {
      const updatedGoal = await db.addProgressToGoal(goalId, amount);
      const newAmount = Math.min(updatedGoal.currentAmount, updatedGoal.targetAmount);
      setGoals(prev => prev.map(g => g.id === goalId ? { ...updatedGoal, currentAmount: newAmount } : g));
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        transactions,
        goals,
        currency: user?.currency || 'BRL',
        isDarkMode,
        isLoading,
        login, 
        logout, 
        register,
        toggleDarkMode,
        setCurrency,
        updateUserProfile,
        saveTransaction,
        deleteTransaction,
        saveGoal,
        deleteGoal,
        addProgressToGoal
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
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Finança Leve</h1>
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
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                            {isRegistering ? 'Registrar' : 'Entrar'}
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