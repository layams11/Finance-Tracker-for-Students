import React, { useMemo } from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { WalletIcon, TrashIcon, CheckIcon, XIcon } from './Icons';

interface ExpenseTrackerProps {
  expenses: Expense[];
  spendingTarget: number;
  onRefundExpense: (expenseId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
  incomingSplitRequests: Array<Expense & { requester: string }>;
  onAcceptSplit: (requester: string, expenseId: string) => void;
  onDeclineSplit: (requester: string, expenseId: string) => void;
  onManualSettle: (expenseId: string, username: string) => void;
  currentUser: string;
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

const StatusBadge: React.FC<{status: 'pending' | 'accepted' | 'declined' | 'settled'}> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        accepted: 'bg-green-500/20 text-green-400',
        declined: 'bg-red-500/20 text-red-400',
        settled: 'bg-green-500/20 text-green-400',
    };
    return <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-semibold ${styles[status]}`}>{status}</span>;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, spendingTarget, onRefundExpense, onDeleteExpense, incomingSplitRequests, onAcceptSplit, onDeclineSplit, onManualSettle, currentUser }) => {

  const totalExpensesForDisplay = useMemo(() => {
    return expenses.filter(e => !e.isRefunded).reduce((sum, exp) => sum + (exp.myShare ?? exp.amount), 0);
  }, [expenses]);

  const spendingByCategory = useMemo(() => {
    return expenses.filter(e => !e.isRefunded).reduce((acc, expense) => {
      const cost = expense.myShare ?? expense.amount;
      acc[expense.category] = (acc[expense.category] || 0) + cost;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
      return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const budgetUsagePercentage = spendingTarget > 0 ? (totalExpensesForDisplay / spendingTarget) * 100 : 0;
  const isOverBudget = budgetUsagePercentage > 100;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <WalletIcon className="h-6 w-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Monthly Expense Tracker</h3>
      </div>
      
      {spendingTarget > 0 && (
        <div className="mb-6 bg-slate-900/50 p-4 rounded-lg">
          <div className="flex justify-between items-end text-white mb-1">
            <span className="font-bold text-2xl">₹{totalExpensesForDisplay.toFixed(2)}</span>
            <span className="text-sm text-slate-400">spent from ₹{spendingTarget.toFixed(2)} spending target</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`} 
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}>
            </div>
          </div>
           {isOverBudget && (
                <p className="text-xs text-red-400 mt-1.5 text-right">You've exceeded your spending target!</p>
            )}
        </div>
      )}
      
      {expenses.length > 0 || incomingSplitRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending Summary */}
            <div>
                <h4 className="font-semibold mb-2 text-slate-200">Spending by Category</h4>
                <div className="space-y-3">
                    {Object.entries(spendingByCategory)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([category, amount]) => (
                        <div key={category}>
                            <div className="flex justify-between mb-1 text-sm font-medium text-slate-300">
                                <span>{categoryEmojis[category as ExpenseCategory]} {category}</span>
                                <span>₹{(amount as number).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div 
                                    className={`${categoryColors[category as ExpenseCategory]} h-2.5 rounded-full`} 
                                    style={{width: `${totalExpensesForDisplay > 0 ? ((amount as number) / totalExpensesForDisplay) * 100 : 0}%`}}>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Recent Expenses List */}
            <div>
                <h4 className="font-semibold mb-2 text-slate-200">Recent Expenses & Requests</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {/* INCOMING REQUESTS */}
                    {incomingSplitRequests.map(req => (
                        <div key={`req-${req.id}`} className="bg-indigo-900/50 p-2.5 rounded-lg border-l-4 border-indigo-500">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{categoryEmojis[req.category]}</span>
                                    <div>
                                        <p className="font-semibold text-sm">Split Request: {req.name}</p>
                                        <p className="text-xs text-slate-400">From {req.requester} • Total: ₹{req.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="font-semibold text-indigo-300">
                                    Your Share: ₹{(req.amount / ((req.splitWith?.length ?? 0) + 1)).toFixed(2)}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={() => onDeclineSplit(req.requester, req.id)} className="flex items-center space-x-1 text-xs bg-red-600/50 hover:bg-red-600/80 text-white px-2 py-1 rounded transition-colors"><XIcon className="h-3 w-3" /><span>Decline</span></button>
                                <button onClick={() => onAcceptSplit(req.requester, req.id)} className="flex items-center space-x-1 text-xs bg-green-600/50 hover:bg-green-600/80 text-white px-2 py-1 rounded transition-colors"><CheckIcon className="h-3 w-3" /><span>Accept</span></button>
                            </div>
                        </div>
                    ))}
                    {/* YOUR EXPENSES */}
                    {sortedExpenses.map(expense => (
                        <div key={expense.id} className={`bg-slate-900/50 p-2.5 rounded-lg transition-opacity ${expense.isRefunded ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <span className="text-xl mt-1">{categoryEmojis[expense.category]}</span>
                                    <div className={`${expense.isRefunded ? 'line-through' : ''}`}>
                                        <p className="font-semibold text-sm">{expense.name}</p>
                                        <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                                        {expense.isSplitRequest && <p className="text-xs text-indigo-400">Split from {expense.requestedBy}</p>}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className={`font-semibold text-slate-200 ${expense.isRefunded ? 'line-through' : ''}`}>
                                        -₹{(expense.myShare ?? expense.amount).toFixed(2)}
                                    </div>
                                    {!expense.isRefunded ? (
                                        <div className="mt-1 min-h-[1.25rem] flex items-center justify-end space-x-2">
                                            {!expense.isSplit && !expense.isSplitRequest && <button onClick={() => onRefundExpense(expense.id)} className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded transition-colors">Refund</button>}
                                            <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-500 hover:text-red-400 p-0.5" aria-label="Delete expense">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : <p className="text-xs text-green-400 font-bold mt-1 min-h-[1.25rem]">REFUNDED</p>}
                                </div>
                            </div>
                            {expense.isSplit && !expense.isSplitRequest && (
                                <details className="mt-2 text-xs ml-9">
                                    <summary className="cursor-pointer text-slate-400 hover:text-white select-none">
                                        Split Details ({expense.splitWith?.length} people)
                                    </summary>
                                    <div className="pl-4 pt-2 space-y-2 border-l border-slate-700 ml-1 mt-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300 font-semibold">You (Payer)</span>
                                            <span className="font-semibold">₹{expense.myShare?.toFixed(2)}</span>
                                        </div>
                                        {expense.splitWith?.map(participant => (
                                            <div key={participant.username} className="flex justify-between items-center">
                                                <span className="text-slate-300">{participant.username} {participant.onPlatform && '👤'}</span>
                                                {participant.onPlatform ? (
                                                    <StatusBadge status={expense.splitStatus?.[participant.username] ?? 'pending'} />
                                                ) : (
                                                    expense.splitStatus?.[participant.username] === 'settled' ? (
                                                        <StatusBadge status="settled" />
                                                    ) : (
                                                        <button 
                                                            onClick={() => onManualSettle(expense.id, participant.username)}
                                                            className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded transition-colors"
                                                        >
                                                            Mark as Settled
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
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