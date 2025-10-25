import React from 'react';
import type { Goal } from '../types';
import GoalCard from '../components/GoalCard';
import { PlusIcon } from '../components/Icons';

interface GoalsPageProps {
  goals: Goal[];
  onWithdrawClick: (goal: Goal) => void;
  onContributeClick: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  setIsAddGoalModalOpen: (isOpen: boolean) => void;
}

const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onWithdrawClick, onContributeClick, onDeleteGoal, setIsAddGoalModalOpen }) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Savings Goals</h1>
            <button onClick={() => setIsAddGoalModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                <PlusIcon className="h-5 w-5" />
                <span>New Goal</span>
            </button>
        </div>
      
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onWithdrawClick={onWithdrawClick} onContributeClick={onContributeClick} onDeleteGoal={onDeleteGoal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/30">
            <h3 className="text-2xl text-slate-300 font-semibold">Your Savings Journey Starts Here!</h3>
            <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">Create your first savings goal to start tracking progress towards your dreams, whether it's a new gadget, a trip, or your education.</p>
            <button onClick={() => setIsAddGoalModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-colors mx-auto">
                <PlusIcon className="h-5 w-5" />
                <span>Create Your First Goal</span>
            </button>
          </div>
        )}
    </div>
  );
};

export default GoalsPage;