// FIX: Removed circular import of 'Goal' type.
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  targetDate: string;
  emoji: string;
}

export interface Transaction {
  id:string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  // Optional fields for goal-related transactions
  goalId?: string;
  goalName?: string;
  goalEmoji?: string;
  // Optional fields for withdrawal or general purpose
  reason?: string;
}

export type ExpenseCategory = 'Education' | 'Food' | 'Transport' | 'Fun' | 'Utilities' | 'Other';

export interface Expense {
    id: string;
    name: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  dayOfMonth: number;
}

export type Page = 'home' | 'goals' | 'transactions' | 'insights' | 'settings';