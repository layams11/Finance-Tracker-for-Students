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

export interface SplitParticipant {
    username: string;
    onPlatform: boolean;
}

export interface Expense {
    id: string;
    name: string;
    category: ExpenseCategory;
    amount: number; // The TOTAL amount of the expense
    date: string;
    isRefunded?: boolean;

    // Fields for multi-user split requests
    isSplit?: boolean;
    myShare?: number; // The creator's share
    splitWith?: SplitParticipant[]; // Array of users to split with
    splitStatus?: Record<string, 'pending' | 'accepted' | 'declined' | 'settled'>; // e.g., { 'user2': 'pending', 'John Doe': 'settled' }

    // Fields for expenses created from an accepted request
    isSplitRequest?: boolean;
    requestedBy?: string; // Username of the person who created the original expense
}


export interface RecurringExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  dayOfMonth: number;
}

export type Page = 'home' | 'goals' | 'transactions' | 'insights' | 'settings';