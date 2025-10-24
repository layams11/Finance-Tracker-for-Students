import React, { useState } from 'react';
import type { Goal } from '../types';
import { XIcon } from './Icons';

interface WithdrawModalProps {
  goal: Goal;
  onClose: () => void;
  onWithdraw: (goalId: string, amount: number, reason: string) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ goal, onClose, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (reason && withdrawAmount > 0 && withdrawAmount <= goal.savedAmount) {
      onWithdraw(goal.id, withdrawAmount, reason);
      onClose();
    } else {
        alert("Please enter a valid amount and reason.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-1 text-white">Withdraw from <span className="text-purple-400">{goal.name}</span></h2>
        <p className="text-sm text-slate-400 mb-4">Available to withdraw: ₹{goal.savedAmount.toFixed(2)}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={goal.savedAmount} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Reason for Withdrawal</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" placeholder="e.g., Early bird tickets for the concert" required></textarea>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 font-semibold">Withdraw</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
