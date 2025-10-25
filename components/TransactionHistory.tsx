import React, { useState, useMemo } from 'react';
import type { Transaction, Goal } from '../types';
import { HistoryIcon, ArrowUpIcon, ArrowDownIcon, WalletIcon } from './Icons';

interface TransactionHistoryProps {
  transactions: Transaction[];
  goals: Goal[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, goals }) => {
  const [filterGoalId, setFilterGoalId] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (filterGoalId !== 'all') {
      result = result.filter(t => t.goalId === filterGoalId);
    }
    if (filterStartDate) {
      result = result.filter(t => new Date(t.date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      result = result.filter(t => new Date(t.date) <= new Date(filterEndDate));
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else { // sortBy 'amount'
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [transactions, filterGoalId, filterStartDate, filterEndDate, sortBy, sortOrder]);
  
  const handleSort = (field: 'date' | 'amount') => {
      if (sortBy === field) {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortBy(field);
          setSortOrder('desc');
      }
  };

  const SortButton: React.FC<{field: 'date' | 'amount', label: string}> = ({field, label}) => (
      <button onClick={() => handleSort(field)} className={`flex items-center space-x-1 p-2 rounded-md ${sortBy === field ? 'bg-slate-600' : 'bg-slate-700'} hover:bg-slate-600`}>
        <span>{label}</span>
        {sortBy === field && (sortOrder === 'desc' ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUp-Icon className="h-4 w-4" />)}
      </button>
  )

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
            <HistoryIcon className="h-6 w-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Transaction History</h3>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-slate-900/40 rounded-lg">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Filter by Goal</label>
            <select value={filterGoalId} onChange={e => setFilterGoalId(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white">
                <option value="all">All Goals</option>
                {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" />
        </div>
        <div className="self-end">
            <label className="block text-sm font-medium text-slate-300 mb-1">Sort by</label>
            <div className="flex space-x-2">
                <SortButton field="date" label="Date" />
                <SortButton field="amount" label="Amount" />
            </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map(t => {
            const isDeposit = t.type === 'deposit';
            return (
              <div key={t.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg hover:bg-slate-900/80">
                  <div className="flex items-center space-x-3">
                      <span className="text-2xl">{t.goalEmoji || '❓'}</span>
                      <div>
                          <p className="font-semibold">{t.goalName || 'Unknown Goal'}</p>
                          <p className="text-xs text-slate-400">
                              {new Date(t.date).toLocaleDateString()}
                              {t.reason && ` - ${t.reason}`}
                          </p>
                      </div>
                  </div>
                  <div className={`font-bold text-lg ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                      {isDeposit ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No transactions found.</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;