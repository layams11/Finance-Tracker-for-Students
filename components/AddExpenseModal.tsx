import React, { useState } from 'react';
import type { Expense, ExpenseCategory, SplitParticipant } from '../types';
import { XIcon } from './Icons';

interface AddExpenseModalProps {
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>, isRecurring: boolean, dayOfMonth?: number) => void;
  currentUser: string;
  knownUsers: string[];
}

const categories: ExpenseCategory[] = ['Food', 'Transport', 'Education', 'Utilities', 'Fun', 'Other'];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAddExpense, currentUser, knownUsers }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  
  const [isSplit, setIsSplit] = useState(false);
  const [splitWithInput, setSplitWithInput] = useState('');
  const [splitWithParticipants, setSplitWithParticipants] = useState<SplitParticipant[]>([]);
  
  const handleAddUserToSplit = () => {
      const newUser = splitWithInput.trim();
      if (newUser && !splitWithParticipants.some(p => p.username === newUser) && newUser !== currentUser) {
          const onPlatform = knownUsers.includes(newUser);
          setSplitWithParticipants([...splitWithParticipants, { username: newUser, onPlatform }]);
          setSplitWithInput('');
      } else if (newUser === currentUser) {
          alert("You can't split an expense with yourself.");
      } else if (!newUser) {
          alert("Please enter a name or username.");
      } else {
          alert(`${newUser} is already in the split list.`);
      }
  };

  const handleRemoveUserFromSplit = (userToRemove: string) => {
      setSplitWithParticipants(splitWithParticipants.filter(p => p.username !== userToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !category) return;
    
    if (isRecurring && (dayOfMonth < 1 || dayOfMonth > 31)) {
        alert("Please enter a valid day of the month (1-31).");
        return;
    }

    const totalAmount = parseFloat(amount);
    const numPeople = splitWithParticipants.length + 1;
    const shareAmount = isSplit ? totalAmount / numPeople : totalAmount;

    const expenseData: Omit<Expense, 'id'> = {
        name,
        amount: totalAmount,
        category,
        date: new Date().toISOString(),
        isSplit,
        myShare: shareAmount,
        splitWith: isSplit ? splitWithParticipants : [],
        splitStatus: isSplit 
            ? splitWithParticipants.reduce((acc, p) => ({ ...acc, [p.username]: 'pending' }), {})
            : {},
    };

    onAddExpense(expenseData, isRecurring, isRecurring ? dayOfMonth : undefined);
    onClose();
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
              <label className="block text-sm font-medium text-slate-300">Total Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
          </div>
          <div className="space-y-4 rounded-md p-3 bg-slate-900/50">
            {/* Split Expense Section */}
            <div className="flex items-center">
                <input
                    id="isSplit"
                    type="checkbox"
                    checked={isSplit}
                    onChange={(e) => setIsSplit(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isSplit" className="ml-2 block text-sm text-slate-300">
                    Split this expense with others
                </label>
            </div>
            {isSplit && (
                 <div>
                    <label className="block text-sm font-medium text-slate-400">Add person by name or username</label>
                    <div className="flex items-center mt-1">
                        <input 
                            type="text" 
                            value={splitWithInput} 
                            onChange={e => setSplitWithInput(e.target.value)} 
                            className="block w-full bg-slate-700 border-slate-600 rounded-l-md shadow-sm p-2 text-white"
                            placeholder="e.g., user2 or Jane Doe"
                        />
                        <button type="button" onClick={handleAddUserToSplit} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md">Add</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {splitWithParticipants.map(p => (
                            <div key={p.username} className="bg-slate-700 rounded-full px-3 py-1 text-sm flex items-center">
                                {p.username} {p.onPlatform ? '👤' : ''}
                                <button type="button" onClick={() => handleRemoveUserFromSplit(p.username)} className="ml-2 text-slate-400 hover:text-white">
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {splitWithParticipants.length > 0 && (
                        <p className="text-xs text-slate-400 mt-2">
                            Total will be split between {splitWithParticipants.length + 1} people (₹{(parseFloat(amount || '0') / (splitWithParticipants.length + 1)).toFixed(2)} each).
                        </p>
                    )}
                </div>
            )}
            
            <hr className="border-slate-700"/>

            {/* Recurring Expense Section */}
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