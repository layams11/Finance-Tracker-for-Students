import React from 'react';
import type { RecurringExpense } from '../types';
import { XIcon, WalletIcon } from './Icons';

interface RecurringExpensesManagerProps {
  recurringExpenses: RecurringExpense[];
  onDelete: (id: string) => void;
}

const RecurringExpensesManager: React.FC<RecurringExpensesManagerProps> = ({ recurringExpenses, onDelete }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <WalletIcon className="h-6 w-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Recurring Expenses</h3>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {recurringExpenses.length > 0 ? (
          recurringExpenses.map(re => (
            <div key={re.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">{re.name}</p>
                <p className="text-xs text-slate-400">
                  Category: {re.category}
                </p>
              </div>
              <div className="text-center px-4">
                 <p className="font-semibold">₹{re.amount.toFixed(2)}</p>
                 <p className="text-xs text-slate-400">Day: {re.dayOfMonth}</p>
              </div>
              <button
                onClick={() => onDelete(re.id)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-700 transition-colors"
                aria-label={`Delete recurring expense ${re.name}`}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>You have no recurring expenses set up.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringExpensesManager;