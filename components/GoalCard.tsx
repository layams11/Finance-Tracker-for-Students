import React from 'react';
import type { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  onWithdrawClick: (goal: Goal) => void;
  onContributeClick: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onWithdrawClick, onContributeClick }) => {
  const progress = (goal.savedAmount / goal.targetAmount) * 100;
  const isCompleted = goal.savedAmount >= goal.targetAmount;

  return (
    <div className={`bg-slate-800 rounded-lg p-5 shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 ${isCompleted ? 'border-2 border-green-500' : 'border-2 border-transparent'}`}>
      <div>
        <div className="flex justify-between items-start">
            <div className='flex items-center space-x-3'>
                <span className="text-3xl">{goal.emoji}</span>
                <h3 className="text-xl font-bold text-white">{goal.name}</h3>
            </div>
            {isCompleted && <span className="text-xs font-bold bg-green-500 text-white py-1 px-2 rounded-full">Completed!</span>}
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-end text-white">
                <span className="font-bold text-2xl">₹{goal.savedAmount.toFixed(2)}</span>
                <span className="text-sm text-slate-400">of ₹{goal.targetAmount.toFixed(2)}</span>
            </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button 
            onClick={() => onContributeClick(goal.id)} 
            disabled={isCompleted} 
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold text-sm"
        >
            Save ₹{goal.monthlyContribution}
        </button>
        <button 
            onClick={() => onWithdrawClick(goal)} 
            disabled={goal.savedAmount <= 0} 
            className="w-full py-2 px-4 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold text-sm"
        >
            Withdraw
        </button>
      </div>
    </div>
  );
};

export default GoalCard;