
import type { Transaction, Goal } from './types';
import { PaymentMethod, Recurrence } from './types';

export const CATEGORIES = [
  'Moradia', 'Transporte', 'Alimentação', 'Saúde', 'Educação',
  'Lazer', 'Salário', 'Investimentos', 'Compras', 'Outros'
];

export const EXPENSE_CATEGORIES = [
  'Moradia', 'Transporte', 'Alimentação', 'Saúde', 'Educação',
  'Lazer', 'Compras', 'Impostos', 'Outros'
];

export const INCOME_CATEGORIES = [
    'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'
];

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3500,
    date: new Date().toISOString(),
    category: 'Salário',
    description: 'Salário Mensal',
    type: 'income',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurrence: Recurrence.MONTHLY,
    tags: ['trabalho']
  },
  {
    id: '2',
    amount: 1200,
    date: new Date(new Date().setDate(2)).toISOString(),
    category: 'Moradia',
    description: 'Aluguel',
    type: 'expense',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurrence: Recurrence.MONTHLY,
    tags: ['casa']
  },
  {
    id: '3',
    amount: 75.50,
    date: new Date(new Date().setDate(5)).toISOString(),
    category: 'Transporte',
    description: 'Gasolina',
    type: 'expense',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurrence: Recurrence.NONE,
    tags: ['carro']
  },
  {
    id: '4',
    amount: 250,
    date: new Date(new Date().setDate(10)).toISOString(),
    category: 'Alimentação',
    description: 'Supermercado',
    type: 'expense',
    paymentMethod: PaymentMethod.DEBIT_CARD,
    recurrence: Recurrence.WEEKLY,
  },
   {
    id: '5',
    amount: 150,
    date: new Date(new Date().setDate(12)).toISOString(),
    category: 'Lazer',
    description: 'Cinema e Jantar',
    type: 'expense',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurrence: Recurrence.NONE,
    tags: ['diversao', 'amigos']
  },
   {
    id: '6',
    amount: 500,
    date: new Date(new Date().setDate(15)).toISOString(),
    category: 'Freelance',
    description: 'Projeto de design',
    type: 'income',
    paymentMethod: PaymentMethod.PIX,
    recurrence: Recurrence.NONE,
  }
];

export const sampleGoals: Goal[] = [
  {
    id: 'g1',
    name: 'Viagem de Férias',
    targetAmount: 5000,
    currentAmount: 1250,
    targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString(),
  },
  {
    id: 'g2',
    name: 'Novo Celular',
    targetAmount: 3000,
    currentAmount: 2800,
    targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1).toISOString(),
  }
];