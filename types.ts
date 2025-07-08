export type View = 'dashboard' | 'transactions' | 'reports' | 'goals' | 'settings' | 'budget' | 'debts' | 'portfolio' | 'bills' | 'assets';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PaymentMethod {
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  BANK_TRANSFER = 'Transferência Bancária',
  PIX = 'PIX',
  CASH = 'Dinheiro',
}

export enum Recurrence {
    NONE = 'Não Recorrente',
    WEEKLY = 'Semanal',
    MONTHLY = 'Mensal',
    YEARLY = 'Anual',
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO 8601 format
  category: string;
  description: string;
  type: 'income' | 'expense';
  paymentMethod: PaymentMethod;
  recurrence: Recurrence;
  tags?: string[];
  envelopeId?: string | null;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO 8601 format
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    currency: Currency;
}

export type Currency = 'BRL' | 'USD' | 'EUR';

// Super App Types
export interface BudgetEnvelope {
  id: string;
  name: string;
  budgetedAmount: number;
  spentAmount: number; // This will be calculated on the fly
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  interestRate: number;
  minimumPayment: number;
}

export type InvestmentType = 'Ação' | 'FII' | 'Cripto' | 'Renda Fixa' | 'Outro';
export interface Investment {
    id: string;
    name: string;
    type: InvestmentType;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    performance: number; // Calculated field
}

export interface RecurringBill {
    id: string;
    name: string;
    amount: number;
    dueDay: number; // 1-31
}

export type AssetType = 'Imóvel' | 'Veículo' | 'Outro';
export interface Asset {
    id: string;
    name: string;
    purchasePrice: number;
    currentValue: number;
    type: AssetType;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{className?: string}>;
    unlocked: boolean;
}

export interface FinancialAnalysis {
    score: number; // 0-100
    summary: string;
    tips: { title: string; description: string }[];
}