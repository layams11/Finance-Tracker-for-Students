import React from 'react';
import type { Goal, Expense } from '../types';
import Insights from '../components/Insights';
import GoalCard from '../components/GoalCard';
import ExpenseTracker from '../components/ExpenseTracker';
import { PlusIcon } from '../components/Icons';

interface HomePageProps {
    remainingSpendingMoney: number;
    monthlySpendingTarget: number;
    savingsLeftToAllocate: number;
    personalSavingsPot: number;
    totalSavedInGoals: number;
    goals: Goal[];
    insight: string;
    fetchInsights: () => void;
    isInsightLoading: boolean;
    setIsAddExpenseModalOpen: (isOpen: boolean) => void;
    setIsAddGoalModalOpen: (isOpen: boolean) => void;
    expenses: Expense[];
}

const HomePage: React.FC<HomePageProps> = (props) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        
        {/* Dashboard Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50">
            <h4 className="text-slate-400 text-sm">Remaining Spending Money</h4>
            <p className={`text-3xl font-bold ${props.remainingSpendingMoney >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{props.remainingSpendingMoney.toFixed(2)}</p>
            <p className="text-xs text-slate-500">from ₹{props.monthlySpendingTarget.toFixed(2)} target</p>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50">
            <h4 className="text-slate-400 text-sm">Savings Left to Allocate</h4>
            <p className="text-3xl font-bold text-amber-400">₹{props.savingsLeftToAllocate.toFixed(2)}</p>
            <p className="text-xs text-slate-500">from ₹{props.personalSavingsPot.toFixed(2)} pot</p>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50">
            <h4 className="text-slate-400 text-sm">Total Saved in Goals</h4>
            <p className="text-3xl font-bold text-indigo-400">₹{props.totalSavedInGoals.toFixed(2)}</p>
             <p className="text-xs text-slate-500">across {props.goals.length} goals</p>
          </div>
        </div>
        
        <div>
          <Insights insight={props.insight} onRefresh={props.fetchInsights} isLoading={props.isInsightLoading}/>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <div className='flex items-center space-x-2'>
                <button onClick={() => props.setIsAddExpenseModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Expense</span>
                </button>
                <button onClick={() => props.setIsAddGoalModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>New Goal</span>
                </button>
            </div>
        </div>

        <div>
            <ExpenseTracker expenses={props.expenses} spendingTarget={props.monthlySpendingTarget} />
        </div>
    </div>
  );
};

export default HomePage;