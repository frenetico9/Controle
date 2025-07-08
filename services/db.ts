




import { createPool } from '@vercel/postgres';
import type { User, Transaction, Goal, Currency, PaymentMethod, Recurrence } from '../types';
import { sampleTransactions, sampleGoals } from '../constants';

// --- DATABASE CONNECTION SETUP ---
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_yHN4a9hOiRYA@ep-young-recipe-acylf25m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || NEON_CONNECTION_STRING,
  // @ts-ignore - This is a valid option for the underlying driver
  webSocketConstructor: typeof window !== 'undefined' ? WebSocket : undefined,
});

let isDbInitialized = false;

async function initializeDatabase() {
  if (isDbInitialized) return;
  console.log('Ensuring database schema is up-to-date...');

  try {
    await pool.sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        currency TEXT NOT NULL DEFAULT 'BRL'
      );
    `;

    await pool.sql`
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
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_amount NUMERIC(12, 2) NOT NULL,
        current_amount NUMERIC(12, 2) NOT NULL,
        target_date TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;
    
    console.log('Schema verification complete.');

    const { rows: seedCheck } = await pool.sql`SELECT id FROM users WHERE email = 'teste@email.com'`;
    if (seedCheck.length === 0) {
      console.log('Seeding initial data...');
      const { rows: userRows } = await pool.sql`
          INSERT INTO users (name, email, password_hash, currency) VALUES
          ('Usuário de Teste', 'teste@email.com', '123', 'BRL')
          RETURNING id;
      `;
      const userId = userRows[0].id;

      for (const tx of sampleTransactions) {
        await pool.sql`
            INSERT INTO transactions (id, user_id, amount, date, category, description, type, payment_method, recurrence, tags)
            VALUES (gen_random_uuid(), ${userId}, ${tx.amount}, ${tx.date}, ${tx.category}, ${tx.description}, ${tx.type}, ${tx.paymentMethod}, ${tx.recurrence}, ${tx.tags ? `{${tx.tags.join(',')}}` : null});
        `;
      }

      for (const goal of sampleGoals) {
         await pool.sql`
            INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date)
            VALUES (gen_random_uuid(), ${userId}, ${goal.name}, ${goal.targetAmount}, ${goal.currentAmount}, ${goal.targetDate});
         `;
      }
      console.log('Data seeding complete.');
    }

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

// --- Mappers ---
const mapToUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  avatarUrl: row.avatar_url,
  currency: row.currency,
});

const mapToTransaction = (row: any): Transaction => ({
  id: row.id,
  amount: Number(row.amount),
  date: new Date(row.date).toISOString(),
  category: row.category,
  description: row.description,
  type: row.type,
  paymentMethod: row.payment_method as PaymentMethod,
  recurrence: row.recurrence as Recurrence,
  tags: row.tags || [],
});

const mapToGoal = (row: any): Goal => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount),
  currentAmount: Number(row.current_amount),
  targetDate: new Date(row.target_date).toISOString(),
});


// --- User & Auth ---
export const login = async (email: string, pass: string): Promise<User | null> => {
  await ensureDbInitialized();
  const { rows } = await pool.sql`SELECT * FROM users WHERE lower(email) = ${email.toLowerCase()} AND password_hash = ${pass}`;
  if (rows.length > 0) {
    return mapToUser(rows[0]);
  }
  return null;
};

export const register = async (name: string, email: string, pass: string): Promise<{user: User | null, error?: string}> => {
  await ensureDbInitialized();
  try {
    const { rows } = await pool.sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email.toLowerCase()}, ${pass})
      RETURNING *;
    `;
    return { user: mapToUser(rows[0]) };
  } catch (e: any) {
    if (e.code === '23505') { // Unique violation
        return { user: null, error: 'Este e-mail já está cadastrado.' };
    }
    throw e;
  }
};

export const updateUserCurrency = async (userId: string, currency: Currency): Promise<boolean> => {
    await ensureDbInitialized();
    const { rowCount } = await pool.sql`UPDATE users SET currency = ${currency} WHERE id = ${userId}`;
    return rowCount > 0;
}

export const updateUserProfile = async (userId: string, data: { name: string; email: string; avatarUrl?: string }): Promise<{user: User | null, error?: string}> => {
    await ensureDbInitialized();
    const { name, email, avatarUrl } = data;
    try {
        const { rows } = await pool.sql`
            UPDATE users
            SET name = ${name}, email = ${email.toLowerCase()}, avatar_url = COALESCE(${avatarUrl}, avatar_url)
            WHERE id = ${userId}
            RETURNING *;
        `;
        if (rows.length === 0) return { user: null, error: 'Usuário não encontrado.' };
        return { user: mapToUser(rows[0]) };
    } catch (e: any) {
         if (e.code === '23505') { // Unique violation on email
            return { user: null, error: 'Este e-mail já está em uso por outra conta.' };
        }
        console.error('Error updating user profile:', e);
        throw e;
    }
}

// --- Transactions ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        SELECT * FROM transactions WHERE user_id = ${userId}
        ORDER BY date DESC;
    `;
    return rows.map(mapToTransaction);
}

export const addTransaction = async (userId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        INSERT INTO transactions (user_id, amount, date, category, description, type, payment_method, recurrence, tags)
        VALUES (${userId}, ${tx.amount}, ${tx.date}, ${tx.category}, ${tx.description}, ${tx.type}, ${tx.paymentMethod}, ${tx.recurrence}, ${tx.tags ? `{${tx.tags.join(',')}}` : null})
        RETURNING *;
    `;
    return mapToTransaction(rows[0]);
}

export const updateTransaction = async (txId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        UPDATE transactions
        SET amount = ${tx.amount}, date = ${tx.date}, category = ${tx.category}, description = ${tx.description}, type = ${tx.type}, payment_method = ${tx.paymentMethod}, recurrence = ${tx.recurrence}, tags = ${tx.tags ? `{${tx.tags.join(',')}}` : null}
        WHERE id = ${txId}
        RETURNING *;
    `;
    return mapToTransaction(rows[0]);
}

export const deleteTransaction = async (txId: string): Promise<boolean> => {
    await ensureDbInitialized();
    const { rowCount } = await pool.sql`DELETE FROM transactions WHERE id = ${txId}`;
    return rowCount > 0;
}

// --- Goals ---
export const getGoals = async (userId: string): Promise<Goal[]> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        SELECT * FROM goals WHERE user_id = ${userId}
        ORDER BY target_date ASC;
    `;
    return rows.map(mapToGoal);
}

export const addGoal = async (userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        INSERT INTO goals (user_id, name, target_amount, current_amount, target_date)
        VALUES (${userId}, ${goal.name}, ${goal.targetAmount}, ${goal.currentAmount}, ${goal.targetDate})
        RETURNING *;
    `;
    return mapToGoal(rows[0]);
}

export const updateGoal = async (goalId: string, goal: Omit<Goal, 'id'>): Promise<Goal> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        UPDATE goals
        SET name = ${goal.name}, target_amount = ${goal.targetAmount}, current_amount = ${goal.currentAmount}, target_date = ${goal.targetDate}
        WHERE id = ${goalId}
        RETURNING *;
    `;
    return mapToGoal(rows[0]);
}

export const deleteGoal = async (goalId: string): Promise<boolean> => {
    await ensureDbInitialized();
    const { rowCount } = await pool.sql`DELETE FROM goals WHERE id = ${goalId}`;
    return rowCount > 0;
}

export const addProgressToGoal = async (goalId: string, amount: number): Promise<Goal> => {
    await ensureDbInitialized();
    const { rows } = await pool.sql`
        UPDATE goals
        SET current_amount = current_amount + ${amount}
        WHERE id = ${goalId}
        RETURNING *;
    `;
    return mapToGoal(rows[0]);
}