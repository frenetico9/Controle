export type View = 'dashboard' | 'transactions' | 'reports' | 'goals' | 'settings';

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