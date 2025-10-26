import React, { useState } from 'react';
import type { RecurringExpense } from '../types';
import RecurringExpensesManager from '../components/RecurringExpensesManager';
import { LogoutIcon } from '../components/Icons';

interface SettingsPageProps {
  monthlyAllowance: number;
  monthlySpendingTarget: number;
  onUpdateBudget: (newAllowance: number, newSpendingTarget: number) => void;
  recurringExpenses: RecurringExpense[];
  onDeleteRecurringExpense: (id: string) => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    monthlyAllowance, 
    monthlySpendingTarget, 
    onUpdateBudget,
    recurringExpenses,
    onDeleteRecurringExpense,
    onLogout
}) => {
  const [allowance, setAllowance] = useState(monthlyAllowance.toString());
  const [spendingTarget, setSpendingTarget] = useState(monthlySpendingTarget.toString());
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateBudget(parseFloat(allowance), parseFloat(spendingTarget));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">Update Your Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="allowance" className="block text-sm font-medium text-slate-300 mb-1">Total Monthly Allowance (₹)</label>
                        <input 
                            type="number"
                            id="allowance"
                            value={allowance}
                            onChange={(e) => setAllowance(e.target.value)}
                            className="w-full p-3 bg-slate-700 border-slate-600 rounded-lg text-white text-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="spendingTarget" className="block text-sm font-medium text-slate-300 mb-1">Monthly Spending Target (₹)</label>
                        <input 
                            type="number"
                            id="spendingTarget"
                            value={spendingTarget}
                            onChange={(e) => setSpendingTarget(e.target.value)}
                            className="w-full p-3 bg-slate-700 border-slate-600 rounded-lg text-white text-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                         <p className="text-xs text-slate-500 mt-2">This is the amount you aim to spend. The rest becomes your savings pot.</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors text-base">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>

        <div>
            <RecurringExpensesManager recurringExpenses={recurringExpenses} onDelete={onDeleteRecurringExpense} />
        </div>
    </div>
  );
};

export default SettingsPage;