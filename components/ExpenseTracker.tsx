import React, { useMemo } from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { WalletIcon } from './Icons';

interface ExpenseTrackerProps {
  expenses: Expense[];
}

const categoryColors: Record<ExpenseCategory, string> = {
    'Education': 'bg-blue-500',
    'Food': 'bg-orange-500',
    'Transport': 'bg-purple-500',
    'Fun': 'bg-pink-500',
    'Utilities': 'bg-yellow-500',
    'Other': 'bg-gray-500'
};

const categoryEmojis: Record<ExpenseCategory, string> = {
    'Education': '🎓',
    'Food': '🍕',
    'Transport': '🚗',
    'Fun': '🎉',
    'Utilities': '💡',
    'Other': '🛒'
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses }) => {

  const spendingByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);
  
  const totalExpenses = useMemo(() => {
      return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses])

  const sortedExpenses = useMemo(() => {
      return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <WalletIcon className="h-6 w-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Monthly Expense Tracker</h3>
      </div>
      
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending Summary */}
            <div>
                <h4 className="font-semibold mb-2 text-slate-200">Spending by Category</h4>
                <div className="space-y-3">
                    {Object.entries(spendingByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                        <div key={category}>
                            <div className="flex justify-between mb-1 text-sm font-medium text-slate-300">
                                <span>{categoryEmojis[category as ExpenseCategory]} {category}</span>
                                <span>₹{amount.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div 
                                    className={`${categoryColors[category as ExpenseCategory]} h-2.5 rounded-full`} 
                                    style={{width: `${(amount / totalExpenses) * 100}%`}}>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Recent Expenses List */}
            <div>
                <h4 className="font-semibold mb-2 text-slate-200">Recent Expenses</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {sortedExpenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{categoryEmojis[expense.category]}</span>
                                <div>
                                    <p className="font-semibold text-sm">{expense.name}</p>
                                    <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                             <div className="font-semibold text-slate-200">
                                -₹{expense.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No expenses logged for this month yet.</p>
            <p className="text-sm">Click 'Add Expense' to start tracking your spending.</p>
          </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
