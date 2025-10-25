import React from 'react';
import type { Expense, Goal } from '../types';
import Insights from '../components/Insights';
import CategoryDoughnutChart from '../components/charts/CategoryDoughnutChart';

interface InsightsPageProps {
  expenses: Expense[];
  goals: Goal[];
  insight: string;
  isInsightLoading: boolean;
  onRefresh: () => void;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ expenses, goals, insight, isInsightLoading, onRefresh }) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Insights & Analysis</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <Insights insight={insight} onRefresh={onRefresh} isLoading={isInsightLoading} />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700/50">
               {expenses.length > 0 ? (
                    <CategoryDoughnutChart expenses={expenses} />
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-slate-300">No Spending Data Available</h3>
                        <p className="text-slate-500 mt-2">Add some expenses to see your spending breakdown.</p>
                    </div>
                )}
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700/50">
                 <h3 className="text-xl font-bold text-white mb-4">Savings Summary</h3>
                 {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map(goal => {
                            const progress = (goal.savedAmount / goal.targetAmount) * 100;
                            return (
                                <div key={goal.id}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold">{goal.emoji} {goal.name}</span>
                                        <span className="text-slate-400 text-sm">
                                            ₹{goal.savedAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div 
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full" 
                                            style={{ width: `${Math.min(progress, 100)}%` }}>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-slate-300">No Savings Goals Yet</h3>
                        <p className="text-slate-500 mt-2">Create a goal to start your savings journey.</p>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default InsightsPage;