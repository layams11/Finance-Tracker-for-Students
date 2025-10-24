import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GoalCard from './components/GoalCard';
import AddGoalModal from './components/AddGoalModal';
import WithdrawModal from './components/WithdrawModal';
import Insights from './components/Insights';
import TransactionHistory from './components/TransactionHistory';
import AddExpenseModal from './components/AddExpenseModal';
import ExpenseTracker from './components/ExpenseTracker';
import { PlusIcon, CheckIcon, XIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import type { Goal, Transaction, Expense } from './types';
import { getFinancialInsights } from './services/geminiService';

const App: React.FC = () => {
  const [monthlyAllowance, setMonthlyAllowance] = useLocalStorage<number>( 'monthlyAllowance', 0);
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage<number>('monthlyBudget', 0);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  useEffect(() => {
    if (isEditingBudget) {
      setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : '');
    }
  }, [isEditingBudget, monthlyBudget]);

  const totalMonthlyContributions = useMemo(() => {
    return goals.reduce((total, goal) => total + (goal.savedAmount < goal.targetAmount ? goal.monthlyContribution : 0), 0);
  }, [goals]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);
  
  const totalOutflow = totalMonthlyContributions + totalExpenses;
  const remainingBalance = monthlyAllowance - totalOutflow;
  
  const budgetUsagePercentage = monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) : 0;
  const isBudgetOver = monthlyBudget > 0 && totalExpenses > monthlyBudget;

  const fetchInsights = useCallback(async () => {
    setIsInsightLoading(true);
    const newInsight = await getFinancialInsights(goals, transactions, expenses, monthlyAllowance, monthlyBudget);
    setInsight(newInsight);
    setIsInsightLoading(false);
  }, [goals, transactions, expenses, monthlyAllowance, monthlyBudget]);

  useEffect(() => {
    if(monthlyAllowance > 0) {
        fetchInsights();
    }
  }, [monthlyAllowance, goals, transactions, expenses, monthlyBudget, fetchInsights]); 

  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'savedAmount'>) => {
    const newGoal: Goal = {
      ...newGoalData,
      id: new Date().toISOString(),
      savedAmount: 0,
    };
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
      const newExpense: Expense = {
          ...newExpenseData,
          id: new Date().toISOString()
      };
      setExpenses(prev => [...prev, newExpense]);
  }

  const handleWithdrawClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdraw = (goalId: string, amount: number, reason: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prevGoals =>
      prevGoals.map(g =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount - amount } : g
      )
    );
    const newTransaction: Transaction = {
      id: new Date().toISOString(),
      goalId,
      goalName: goal.name,
      goalEmoji: goal.emoji,
      amount,
      reason,
      date: new Date().toISOString(),
      type: 'withdrawal',
    };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const handleAutoSave = () => {
    const newTransactions: Transaction[] = [];
    setGoals(prevGoals => 
        prevGoals.map(goal => {
            if (goal.savedAmount < goal.targetAmount) {
                const amountToAdd = Math.min(
                  goal.monthlyContribution,
                  goal.targetAmount - goal.savedAmount
                );

                if (amountToAdd > 0) {
                    newTransactions.push({
                        id: `${goal.id}-${new Date().toISOString()}`,
                        goalId: goal.id,
                        goalName: goal.name,
                        goalEmoji: goal.emoji,
                        amount: amountToAdd,
                        date: new Date().toISOString(),
                        type: 'deposit'
                    });
                    return {...goal, savedAmount: goal.savedAmount + amountToAdd};
                }
            }
            return goal;
        })
    );

    if(newTransactions.length > 0) {
        setTransactions(prev => [...prev, ...newTransactions]);
    }
    alert("Monthly contributions have been added to your goals!");
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0) {
      setMonthlyBudget(newBudget);
    }
    setIsEditingBudget(false);
  };

  if (monthlyAllowance === 0) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2 text-white">Welcome to SmartSave</h1>
                <p className="text-slate-400 mb-6">Your AI-powered finance tracker for students.</p>
                <form onSubmit={(e) => { e.preventDefault(); const value = (e.target as HTMLFormElement).allowance.value; setMonthlyAllowance(parseFloat(value)); }} className="flex flex-col items-center max-w-sm mx-auto">
                    <label className="text-lg text-slate-300 mb-2">Enter your monthly allowance (in ₹) to begin:</label>
                    <input type="number" name="allowance" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl" placeholder="20000" required />
                    <button type="submit" className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {/* Dashboard Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Monthly Allowance</h4>
            <p className="text-3xl font-bold text-white">₹{monthlyAllowance.toFixed(2)}</p>
          </div>
           <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Total Outflow</h4>
            <p className="text-3xl font-bold text-orange-400">-₹{totalOutflow.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Goals: ₹{totalMonthlyContributions.toFixed(2)} | Expenses: ₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Remaining Balance</h4>
            <p className={`text-3xl font-bold ${remainingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{remainingBalance.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h4 className="text-slate-400 text-sm">Expense Budget</h4>
              {monthlyBudget > 0 && !isEditingBudget && (
                <button onClick={() => setIsEditingBudget(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Edit</button>
              )}
            </div>
            {isEditingBudget ? (
              <form onSubmit={(e) => { e.preventDefault(); handleBudgetSave(); }} className="flex items-center mt-2 space-x-1">
                <span className='font-bold text-slate-400'>₹</span>
                <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-white" placeholder="e.g., 15000" autoFocus />
                <button type="submit" className="bg-green-600 hover:bg-green-500 p-2 rounded-md text-white"><CheckIcon className="h-5 w-5"/></button>
                <button type="button" onClick={() => setIsEditingBudget(false)} className="bg-slate-600 hover:bg-slate-500 p-2 rounded-md text-white"><XIcon className="h-5 w-5"/></button>
              </form>
            ) : monthlyBudget > 0 ? (
              <div className="mt-1">
                <p className="text-2xl font-bold text-white">
                  ₹{totalExpenses.toFixed(2)}
                  <span className="text-base font-normal text-slate-400"> / {monthlyBudget.toFixed(2)}</span>
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${isBudgetOver ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${budgetUsagePercentage}%` }}></div>
                </div>
                {isBudgetOver && <p className="text-xs text-red-400 mt-1">You've exceeded your budget!</p>}
              </div>
            ) : (
              <div className="mt-2">
                <button onClick={() => setIsEditingBudget(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg text-sm">
                  Set Monthly Budget
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <Insights insight={insight} onRefresh={fetchInsights} isLoading={isInsightLoading}/>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Finances</h2>
            <div className='flex items-center space-x-2'>
                <button onClick={() => setIsAddExpenseModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Expense</span>
                </button>
                <button onClick={() => setIsAddGoalModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>New Goal</span>
                </button>
            </div>
        </div>
        
        <div className="mb-12">
            <ExpenseTracker expenses={expenses} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Savings Goals</h2>
          <button onClick={handleAutoSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
              Run Monthly Save
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onWithdrawClick={handleWithdrawClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg">
            <h3 className="text-xl text-slate-300">No savings goals yet!</h3>
            <p className="text-slate-500 mb-4">Click 'New Goal' to start your savings journey.</p>
          </div>
        )}

        <div className="mt-12">
            <TransactionHistory transactions={transactions} goals={goals} />
        </div>

      </main>

      {isAddGoalModalOpen && (
        <AddGoalModal onClose={() => setIsAddGoalModalOpen(false)} onAddGoal={handleAddGoal} />
      )}
      {isWithdrawModalOpen && selectedGoal && (
        <WithdrawModal goal={selectedGoal} onClose={() => setIsWithdrawModalOpen(false)} onWithdraw={handleWithdraw} />
      )}
      {isAddExpenseModalOpen && (
        <AddExpenseModal onClose={() => setIsAddExpenseModalOpen(false)} onAddExpense={handleAddExpense} />
      )}
    </div>
  );
};

export default App;