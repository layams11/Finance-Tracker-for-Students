import React, { useState, useEffect } from 'react';
import type { Goal } from '../types';
import { XIcon } from './Icons';

interface EditGoalModalProps {
  goal: Goal;
  onClose: () => void;
  onEditGoal: (goal: Goal) => void;
}

const emojis = ['💻', '✈️', '🎓', '🎁', ' emergency', '📱', '🚗', '🏠', '🎉'];

const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, onClose, onEditGoal }) => {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [targetDate, setTargetDate] = useState(goal.targetDate.split('T')[0]); // Format for input[type=date]
  const [monthlyContribution, setMonthlyContribution] = useState(goal.monthlyContribution.toString());
  const [selectedEmoji, setSelectedEmoji] = useState(goal.emoji);

  useEffect(() => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setTargetDate(goal.targetDate.split('T')[0]);
    setMonthlyContribution(goal.monthlyContribution.toString());
    setSelectedEmoji(goal.emoji);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && targetAmount && targetDate && monthlyContribution) {
      onEditGoal({
        ...goal,
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate,
        monthlyContribution: parseFloat(monthlyContribution),
        emoji: selectedEmoji,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Edit Savings Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Goal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Target Amount (₹)</label>
              <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Target Date</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" min={new Date().toISOString().split("T")[0]} required />
            </div>
          </div>
           <div>
              <label className="block text-sm font-medium text-slate-300">Goal Icon</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {emojis.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setSelectedEmoji(emoji)} className={`text-2xl p-2 rounded-lg transition-transform duration-200 ${selectedEmoji === emoji ? 'bg-indigo-600 scale-110' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {emoji}
                    </button>
                ))}
              </div>
           </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Monthly Contribution (₹)</label>
            <div className="flex items-center mt-1">
              <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white" required />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;
