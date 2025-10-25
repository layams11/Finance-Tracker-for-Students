import React, { useState, useCallback, useEffect } from 'react';
import { getSavingSuggestion } from '../services/geminiService';
import type { Goal } from '../types';
import { XIcon, SparklesIcon } from './Icons';

interface AddGoalModalProps {
  onClose: () => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
}

const emojis = ['💻', '✈️', '🎓', '🎁', ' emergency', '📱', '🚗', '🏠', '🎉'];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onAddGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💻');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const handleSuggestion = useCallback(async () => {
    if (!targetAmount || !targetDate) return;
    setIsLoadingSuggestion(true);
    try {
      const today = new Date();
      const target = new Date(targetDate);
      // Ensure months calculation is at least 1 to avoid division by zero
      const months = Math.max((target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()), 1);
      
      const suggestion = await getSavingSuggestion(parseFloat(targetAmount), months);
      setMonthlyContribution(suggestion.toString());
    } catch (error) {
        console.error("Failed to get suggestion:", error);
    } finally {
        setIsLoadingSuggestion(false);
    }
  }, [targetAmount, targetDate]);

  useEffect(() => {
    // Automatically fetch suggestion when both fields are filled
    const timer = setTimeout(() => {
        if (targetAmount && targetDate) {
            handleSuggestion();
        }
    }, 500); // Debounce to avoid rapid firing
    
    return () => clearTimeout(timer);
  }, [targetAmount, targetDate, handleSuggestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && targetAmount && targetDate && monthlyContribution) {
      onAddGoal({
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
        <h2 className="text-2xl font-bold mb-4 text-white">New Savings Goal</h2>
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
              <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} className="block w-full bg-slate-700 border-slate-600 rounded-l-md shadow-sm p-2 text-white" required />
              <button type="button" onClick={handleSuggestion} disabled={isLoadingSuggestion || !targetAmount || !targetDate} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center">
                {isLoadingSuggestion ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold">Add Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;