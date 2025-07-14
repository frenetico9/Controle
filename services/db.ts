

import { Pool } from '@neondatabase/serverless';
import { PaymentMethod, Recurrence } from '../types';
import type { User, Transaction, Goal, Currency, BudgetEnvelope, Debt, Investment, RecurringBill, Asset } from '../types';

// --- DATABASE CONNECTION SETUP ---
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_yHN4a9hOiRYA@ep-young-recipe-acylf25m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: NEON_CONNECTION_STRING });

let isDbInitialized = false;

// --- INITIALIZATION & MIGRATION ---
async function initializeDatabase() {
  if (isDbInitialized) return;
  console.log('Ensuring database schema is up-to-date...');

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Core Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        currency TEXT NOT NULL DEFAULT 'BRL'
      );
    `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS budget_envelopes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            budgeted_amount NUMERIC(12, 2) NOT NULL
        );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        recurrence TEXT NOT NULL,
        tags TEXT[]
      );
    `);
    
    // MIGRATION: Add envelope_id to transactions if it doesn't exist in an older schema.
    // This is safe to run multiple times.
    await pool.query(`
        ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS envelope_id UUID REFERENCES budget_envelopes(id) ON DELETE SET NULL;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_amount NUMERIC(12, 2) NOT NULL,
        current_amount NUMERIC(12, 2) NOT NULL,
        target_date TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

    // Super App Tables
    await pool.query(`
        CREATE TABLE IF NOT EXISTS debts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            total_amount NUMERIC(12, 2) NOT NULL,
            interest_rate NUMERIC(5, 2) NOT NULL,
            minimum_payment NUMERIC(12, 2) NOT NULL
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS investments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            quantity NUMERIC(18, 8) NOT NULL,
            purchase_price NUMERIC(18, 8) NOT NULL,
            current_price NUMERIC(18, 8) NOT NULL
        );
    `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS recurring_bills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            amount NUMERIC(12, 2) NOT NULL,
            due_day INTEGER NOT NULL
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            purchase_price NUMERIC(12, 2) NOT NULL,
            current_value NUMERIC(12, 2) NOT NULL
        );
    `);
    
    console.log('Schema verification complete.');
    await seedInitialData();
    isDbInitialized = true;
  } catch (e) {
    console.error('Database initialization failed.', e);
    throw e;
  }
}

async function ensureDbInitialized() {
  if (!isDbInitialized) {
    await initializeDatabase();
  }
}

// --- SEEDING ---
async function seedInitialData() {
    const { rows: seedCheck } = await pool.query("SELECT id FROM users WHERE email = $1", ['teste@email.com']);
    if (seedCheck.length > 0) return; // Already seeded

    console.log('Seeding initial data for user teste@email.com...');
    const { rows: userRows } = await pool.query(
        'INSERT INTO users (name, email, password_hash, currency) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Usuário de Teste', 'teste@email.com', '123', 'BRL']
    );
    const userId = userRows[0].id;

    // Seed Envelopes
    const { rows: envRows } = await pool.query(`
      INSERT INTO budget_envelopes (user_id, name, budgeted_amount) VALUES
      ($1, 'Alimentação', 800.00),
      ($1, 'Transporte', 250.00),
      ($1, 'Lazer', 400.00)
      RETURNING id, name;
    `, [userId]);
    const envMap = new Map(envRows.map(r => [r.name, r.id]));

    // Seed Transactions
    const sampleTransactions = [
      { amount: 5500.00, date: new Date(new Date().setDate(1)).toISOString(), category: 'Salário', description: 'Salário Mensal', type: 'income', paymentMethod: PaymentMethod.BANK_TRANSFER, recurrence: Recurrence.MONTHLY, envelopeId: null },
      { amount: 150.25, date: new Date(new Date().setDate(2)).toISOString(), category: 'Alimentação', description: 'Supermercado', type: 'expense', paymentMethod: PaymentMethod.DEBIT_CARD, recurrence: Recurrence.NONE, envelopeId: envMap.get('Alimentação') },
      { amount: 80.50, date: new Date(new Date().setDate(3)).toISOString(), category: 'Lazer', description: 'Cinema com amigos', type: 'expense', paymentMethod: PaymentMethod.CREDIT_CARD, recurrence: Recurrence.NONE, envelopeId: envMap.get('Lazer') },
      { amount: 50.00, date: new Date(new Date().setDate(5)).toISOString(), category: 'Transporte', description: 'Gasolina', type: 'expense', paymentMethod: PaymentMethod.CREDIT_CARD, recurrence: Recurrence.NONE, envelopeId: envMap.get('Transporte') },
      { amount: 1159.46, date: new Date(new Date().setDate(5)).toISOString(), category: 'Moradia', description: 'Aluguel', type: 'expense', paymentMethod: PaymentMethod.BANK_TRANSFER, recurrence: Recurrence.MONTHLY, envelopeId: null },
      { amount: 350.00, date: new Date(new Date().setDate(10)).toISOString(), category: 'Freelance', description: 'Job de Design', type: 'income', paymentMethod: PaymentMethod.PIX, recurrence: Recurrence.NONE, envelopeId: null },
      { amount: 45.99, date: new Date(new Date().setDate(12)).toISOString(), category: 'Assinaturas', description: 'Streaming de Música', type: 'expense', paymentMethod: PaymentMethod.CREDIT_CARD, recurrence: Recurrence.MONTHLY, envelopeId: null },
    ];
    for (const tx of sampleTransactions) {
      await pool.query(
          'INSERT INTO transactions (user_id, amount, date, category, description, type, payment_method, recurrence, envelope_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [userId, tx.amount, tx.date, tx.category, tx.description, tx.type, tx.paymentMethod, tx.recurrence, tx.envelopeId]
      );
    }
    
    // Seed Goals
    await pool.query('INSERT INTO goals (user_id, name, target_amount, current_amount, target_date) VALUES ($1, $2, $3, $4, $5)', [userId, 'Viagem para a Praia', 5000, 1250, new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()]);
    
    // Seed Debts
    await pool.query('INSERT INTO debts (user_id, name, total_amount, interest_rate, minimum_payment) VALUES ($1, $2, $3, $4, $5)', [userId, 'Cartão de Crédito Nubank', 4500.00, 14.5, 450.00]);
    
    // Seed Investments
    await pool.query('INSERT INTO investments (user_id, name, type, quantity, purchase_price, current_price) VALUES ($1, $2, $3, $4, $5, $6)', [userId, 'Bitcoin', 'Cripto', 0.05, 300000, 350000]);
    
    // Seed Bills
    await pool.query('INSERT INTO recurring_bills (user_id, name, amount, due_day) VALUES ($1, $2, $3, $4), ($1, $5, $6, $7)', [userId, 'Netflix', 39.90, 15, 'Internet Fibra', 99.90, 10]);
    
    // Seed Assets
    await pool.query('INSERT INTO assets (user_id, name, type, purchase_price, current_value) VALUES ($1, $2, $3, $4, $5)', [userId, 'Macbook Pro 14', 'Outro', 15000, 13500]);

    console.log('Data seeding complete.');
}


// --- MAPPERS ---
const mapToUser = (r: any): User => ({ id: r.id, email: r.email, name: r.name, avatarUrl: r.avatar_url, currency: r.currency });
const mapToTransaction = (r: any): Transaction => ({ id: r.id, amount: Number(r.amount), date: new Date(r.date).toISOString(), category: r.category, description: r.description, type: r.type, paymentMethod: r.payment_method, recurrence: r.recurrence, tags: r.tags || [], envelopeId: r.envelope_id });
const mapToGoal = (r: any): Goal => ({ id: r.id, name: r.name, targetAmount: Number(r.target_amount), currentAmount: Number(r.current_amount), targetDate: new Date(r.target_date).toISOString() });
const mapToEnvelope = (r: any): Omit<BudgetEnvelope, 'spentAmount'> => ({ id: r.id, name: r.name, budgetedAmount: Number(r.budgeted_amount) });
const mapToDebt = (r: any): Debt => ({ id: r.id, name: r.name, totalAmount: Number(r.total_amount), interestRate: Number(r.interest_rate), minimumPayment: Number(r.minimum_payment) });
const mapToInvestment = (r: any): Omit<Investment, 'performance'> => ({ id: r.id, name: r.name, type: r.type, quantity: Number(r.quantity), purchasePrice: Number(r.purchase_price), currentPrice: Number(r.current_price) });
const mapToBill = (r: any): RecurringBill => ({ id: r.id, name: r.name, amount: Number(r.amount), dueDay: r.due_day });
const mapToAsset = (r: any): Asset => ({ id: r.id, name: r.name, type: r.type, purchasePrice: Number(r.purchase_price), currentValue: Number(r.current_value) });


// --- GENERIC CRUD ---
const createGetByUserId = <T>(tableName: string, mapper: (row: any) => T) => async (userId: string): Promise<T[]> => {
    await ensureDbInitialized();
    const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE user_id = $1`, [userId]);
    return rows.map(mapper);
};

const createAdd = <T, U>(tableName: string, jsToDbColumnMap: Record<string, string>, mapper: (row: any) => U) => async (userId: string, item: T): Promise<U> => {
    await ensureDbInitialized();
    const jsKeys = Object.keys(jsToDbColumnMap);
    const dbColumns = jsKeys.map(key => jsToDbColumnMap[key]);
    
    const values = jsKeys.map(key => (item as any)[key]);
    const placeholders = dbColumns.map((_, i) => `$${i + 2}`).join(', ');
    const columnNames = dbColumns.join(', ');

    const query = `INSERT INTO ${tableName} (user_id, ${columnNames}) VALUES ($1, ${placeholders}) RETURNING *;`;
    
    const { rows } = await pool.query(query, [userId, ...values]);
    return mapper(rows[0]);
};

const createUpdate = <T, U>(tableName: string, jsToDbColumnMap: Record<string, string>, mapper: (row: any) => U) => async (itemId: string, item: T): Promise<U> => {
    await ensureDbInitialized();
    const jsKeys = Object.keys(jsToDbColumnMap);
    
    const setClause = jsKeys.map((key, i) => `"${jsToDbColumnMap[key]}" = $${i + 2}`).join(', ');
    const values = jsKeys.map(key => (item as any)[key]);
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $1 RETURNING *;`;

    const { rows } = await pool.query(query, [itemId, ...values]);
    return mapper(rows[0]);
};

const createDelete = (tableName: string) => async (itemId: string): Promise<boolean> => {
    await ensureDbInitialized();
    const { rowCount } = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [itemId]);
    return Number(rowCount) > 0;
};


// --- API EXPORTS ---

// User & Auth
export const login = async (email: string, pass: string): Promise<User | null> => {
  await ensureDbInitialized();
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1 AND password_hash = $2', [email.toLowerCase(), pass]);
  return rows.length > 0 ? mapToUser(rows[0]) : null;
};

export const register = async (name: string, email: string, pass: string): Promise<{user: User | null, error?: string}> => {
  await ensureDbInitialized();
  try {
    const { rows } = await pool.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *', [name, email.toLowerCase(), pass]);
    return { user: mapToUser(rows[0]) };
  } catch (e: any) {
    return e.code === '23505' ? { user: null, error: 'Este e-mail já está cadastrado.' } : Promise.reject(e);
  }
};

export const updateUserCurrency = async (userId: string, currency: Currency): Promise<User> => {
    await ensureDbInitialized();
    const { rows } = await pool.query('UPDATE users SET currency = $1 WHERE id = $2 RETURNING *', [currency, userId]);
    return mapToUser(rows[0]);
}

export const updateUserProfile = async (userId: string, data: { name: string; email: string; avatarUrl?: string }): Promise<{user: User | null, error?: string}> => {
    await ensureDbInitialized();
    try {
        const { rows } = await pool.query(
            'UPDATE users SET name = $1, email = $2, avatar_url = COALESCE($3, avatar_url) WHERE id = $4 RETURNING *',
            [data.name, data.email.toLowerCase(), data.avatarUrl, userId]
        );
        return rows.length > 0 ? { user: mapToUser(rows[0]) } : { user: null, error: 'Usuário não encontrado.' };
    } catch (e: any) {
        return e.code === '23505' ? { user: null, error: 'Este e-mail já está em uso.' } : Promise.reject(e);
    }
}

// Transactions
export const getTransactions = createGetByUserId('transactions', mapToTransaction);
export const addTransaction = async (userId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await ensureDbInitialized();
    const { rows } = await pool.query(
        'INSERT INTO transactions (user_id, amount, date, category, description, type, payment_method, recurrence, tags, envelope_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [userId, tx.amount, tx.date, tx.category, tx.description, tx.type, tx.paymentMethod, tx.recurrence, tx.tags, tx.envelopeId]
    );
    return mapToTransaction(rows[0]);
}
export const updateTransaction = async (txId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await ensureDbInitialized();
    const { rows } = await pool.query(
        'UPDATE transactions SET amount = $1, date = $2, category = $3, description = $4, type = $5, payment_method = $6, recurrence = $7, tags = $8, envelope_id = $9 WHERE id = $10 RETURNING *',
        [tx.amount, tx.date, tx.category, tx.description, tx.type, tx.paymentMethod, tx.recurrence, tx.tags, tx.envelopeId, txId]
    );
    return mapToTransaction(rows[0]);
}
export const deleteTransaction = createDelete('transactions');

// Goals
const goalColumns = { name: 'name', targetAmount: 'target_amount', currentAmount: 'current_amount', targetDate: 'target_date' };
export const getGoals = createGetByUserId('goals', mapToGoal);
export const addGoal = createAdd('goals', goalColumns, mapToGoal);
export const updateGoal = createUpdate('goals', goalColumns, mapToGoal);
export const deleteGoal = createDelete('goals');
export const addProgressToGoal = async (goalId: string, amount: number): Promise<Goal> => {
    await ensureDbInitialized();
    const { rows } = await pool.query('UPDATE goals SET current_amount = LEAST(target_amount, current_amount + $1) WHERE id = $2 RETURNING *', [amount, goalId]);
    return mapToGoal(rows[0]);
}

// Budget Envelopes
const getEnvelopesWithoutSpent = createGetByUserId('budget_envelopes', mapToEnvelope);
export const getEnvelopes = async (userId: string): Promise<BudgetEnvelope[]> => {
    const envelopes = await getEnvelopesWithoutSpent(userId);
    const { rows } = await pool.query(
        "SELECT envelope_id, SUM(amount) as spent FROM transactions WHERE user_id = $1 AND type = 'expense' AND envelope_id IS NOT NULL AND date_trunc('month', date) = date_trunc('month', current_date) GROUP BY envelope_id",
        [userId]
    );
    const spentMap = new Map(rows.map(r => [r.envelope_id, Number(r.spent as any) || 0]));
    return envelopes.map((env): BudgetEnvelope => ({
        ...env,
        spentAmount: spentMap.get(env.id) || 0
    }));
}
const envelopeColumns = { name: 'name', budgetedAmount: 'budgeted_amount' };
export const addEnvelope = createAdd('budget_envelopes', envelopeColumns, mapToEnvelope);
export const updateEnvelope = createUpdate('budget_envelopes', envelopeColumns, mapToEnvelope);
export const deleteEnvelope = createDelete('budget_envelopes');


// Debts
const debtColumns = { name: 'name', totalAmount: 'total_amount', interestRate: 'interest_rate', minimumPayment: 'minimum_payment' };
export const getDebts = createGetByUserId('debts', mapToDebt);
export const addDebt = createAdd('debts', debtColumns, mapToDebt);
export const updateDebt = createUpdate('debts', debtColumns, mapToDebt);
export const deleteDebt = createDelete('debts');

// Investments
const getInvestmentsRaw = createGetByUserId('investments', mapToInvestment);
export const getInvestments = async (userId: string): Promise<Investment[]> => {
    const investments = await getInvestmentsRaw(userId);
    return investments.map(inv => {
        const value = inv.quantity * inv.currentPrice;
        const cost = inv.quantity * inv.purchasePrice;
        const performance = cost > 0 ? (value - cost) / cost * 100 : 0;
        return { ...inv, performance };
    });
};
const investmentColumns = { name: 'name', type: 'type', quantity: 'quantity', purchasePrice: 'purchase_price', currentPrice: 'current_price' };
export const addInvestment = createAdd('investments', investmentColumns, mapToInvestment);
export const updateInvestment = createUpdate('investments', investmentColumns, mapToInvestment);
export const deleteInvestment = createDelete('investments');

// Recurring Bills
const billColumns = { name: 'name', amount: 'amount', dueDay: 'due_day' };
export const getBills = createGetByUserId('recurring_bills', mapToBill);
export const addBill = createAdd('recurring_bills', billColumns, mapToBill);
export const updateBill = createUpdate('recurring_bills', billColumns, mapToBill);
export const deleteBill = createDelete('recurring_bills');

// Assets
const assetColumns = { name: 'name', type: 'type', purchasePrice: 'purchase_price', currentValue: 'current_value' };
export const getAssets = createGetByUserId('assets', mapToAsset);
export const addAsset = createAdd('assets', assetColumns, mapToAsset);
export const updateAsset = createUpdate('assets', assetColumns, mapToAsset);
export const deleteAsset = createDelete('assets');


// --- Combined Data Fetcher ---
export const getAllUserData = async (userId: string) => {
    await ensureDbInitialized();
    const [transactions, goals, envelopes, debts, investments, bills, assets] = await Promise.all([
        getTransactions(userId),
        getGoals(userId),
        getEnvelopes(userId),
        getDebts(userId),
        getInvestments(userId),
        getBills(userId),
        getAssets(userId),
    ]);
    return { transactions, goals, envelopes, debts, investments, bills, assets };
};
