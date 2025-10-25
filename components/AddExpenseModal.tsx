import React, { useState } from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { XIcon } from './Icons';

interface AddExpenseModalProps {
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>, isRecurring: boolean, dayOfMonth?: number) => void;
}

const categories: ExpenseCategory[] = ['Food', 'Transport', 'Education', 'Utilities', 'Fun', 'Other'];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAddExpense }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amount && category) {
      if (isRecurring && (dayOfMonth < 1 || dayOfMonth > 31)) {
        alert("Please enter a valid day of the month (1-31).");
        return;
      }
      onAddExpense(
        {
            name,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
        }, 
        isRecurring, 
        isRecurring ? dayOfMonth : undefined
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Expense Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" placeholder="e.g., Lunch with friends" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
          </div>
          <div className="space-y-2 rounded-md p-3 bg-slate-900/50">
            <div className="flex items-center">
                <input
                    id="isRecurring"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-slate-300">
                    Make this a recurring monthly expense
                </label>
            </div>
            {isRecurring && (
                 <div>
                    <label className="block text-sm font-medium text-slate-400">Day of Month</label>
                    <input 
                        type="number" 
                        value={dayOfMonth} 
                        onChange={e => setDayOfMonth(parseInt(e.target.value))} 
                        min="1" 
                        max="31"
                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" 
                        required 
                    />
                </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;