import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GoalCard from './components/GoalCard';
import AddGoalModal from './components/AddGoalModal';
import WithdrawModal from './components/WithdrawModal';
import Insights from './components/Insights';
import TransactionHistory from './components/TransactionHistory';
import AddExpenseModal from './components/AddExpenseModal';
import ExpenseTracker from './components/ExpenseTracker';
import RecurringExpensesManager from './components/RecurringExpensesManager';
import { PlusIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import type { Goal, Transaction, Expense, RecurringExpense } from './types';
import { getFinancialInsights } from './services/geminiService';

const App: React.FC = () => {
  const [monthlyAllowance, setMonthlyAllowance] = useLocalStorage<number | null>( 'monthlyAllowance', null);
  const [monthlySpendingTarget, setMonthlySpendingTarget] = useLocalStorage<number | null>('monthlySpendingTarget', null);
  
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [recurringExpenses, setRecurringExpenses] = useLocalStorage<RecurringExpense[]>('recurringExpenses', []);
  const [lastRecurringCheck, setLastRecurringCheck] = useLocalStorage<string>('lastRecurringCheck', '');
  
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Auto-add recurring expenses at the start of a new month
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    if (lastRecurringCheck !== currentMonth) {
      const newExpenses: Expense[] = recurringExpenses.map(re => ({
        id: `${re.id}-${currentMonth}`,
        name: `${re.name} (Recurring)`,
        amount: re.amount,
        category: re.category,
        date: new Date().toISOString(),
      }));

      // Prevent adding duplicates if user reloads on the first of the month
      const existingRecurringExpenseIds = expenses.map(e => e.id);
      const uniqueNewExpenses = newExpenses.filter(ne => !existingRecurringExpenseIds.includes(ne.id));
      
      if (uniqueNewExpenses.length > 0) {
        setExpenses(prev => [...prev, ...uniqueNewExpenses]);
      }
      setLastRecurringCheck(currentMonth);
    }
  }, [recurringExpenses, lastRecurringCheck, setLastRecurringCheck, expenses, setExpenses]);


  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const totalContributionsThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'deposit' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((total, t) => total + t.amount, 0);
  }, [transactions]);
  
  const totalSavedInGoals = useMemo(() => goals.reduce((sum, goal) => sum + goal.savedAmount, 0), [goals]);
  
  // New "Three Pot" Budgeting Logic
  const personalSavingsPot = (monthlyAllowance || 0) - (monthlySpendingTarget || 0);
  const availablePersonalSavings = personalSavingsPot - totalContributionsThisMonth;
  const remainingSpendingMoney = (monthlySpendingTarget || 0) - totalExpenses;

  
  const fetchInsights = useCallback(async () => {
    if (monthlyAllowance === null || monthlySpendingTarget === null) return;
    setIsInsightLoading(true);
    const newInsight = await getFinancialInsights(goals, transactions, expenses, monthlyAllowance, monthlySpendingTarget, totalContributionsThisMonth);
    setInsight(newInsight);
    setIsInsightLoading(false);
  }, [goals, transactions, expenses, monthlyAllowance, monthlySpendingTarget, totalContributionsThisMonth]);

  useEffect(() => {
    if(monthlyAllowance !== null) {
        fetchInsights();
    }
  }, [monthlyAllowance, goals, transactions, expenses, fetchInsights]); 

  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'savedAmount'>) => {
    if (newGoalData.monthlyContribution > availablePersonalSavings) {
      if (!window.confirm("This goal's monthly contribution is higher than your available personal savings. Are you sure you want to add it?")) {
        return;
      }
    }
    const newGoal: Goal = {
      ...newGoalData,
      id: new Date().toISOString(),
      savedAmount: 0,
    };
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>, isRecurring: boolean, dayOfMonth?: number) => {
      const newExpense: Expense = {
          ...newExpenseData,
          id: new Date().toISOString()
      };
      setExpenses(prev => [...prev, newExpense]);

      if (isRecurring && dayOfMonth) {
        const newRecurringExpense: RecurringExpense = {
            id: new Date().toISOString(),
            name: newExpenseData.name,
            amount: newExpenseData.amount,
            category: newExpenseData.category,
            dayOfMonth,
        };
        setRecurringExpenses(prev => [...prev, newRecurringExpense]);
      }
  }

  const handleDeleteRecurringExpense = (id: string) => {
    if(window.confirm("Are you sure you want to delete this recurring expense?")) {
        setRecurringExpenses(prev => prev.filter(re => re.id !== id));
    }
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
  
  const handleContributeToGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    if (goal.savedAmount >= goal.targetAmount) {
        alert("This goal is already completed!");
        return;
    }

    const amountToAdd = Math.min(
      goal.monthlyContribution,
      goal.targetAmount - goal.savedAmount
    );

    if (amountToAdd <= 0) return;
    
    if (amountToAdd > availablePersonalSavings) {
        if (!window.confirm("You don't have enough in your Personal Savings Pot for this contribution. Proceed anyway?")) {
            return;
        }
    }

    setGoals(prevGoals =>
      prevGoals.map(g =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + amountToAdd } : g
      )
    );

    const newTransaction: Transaction = {
      id: `${goal.id}-${new Date().toISOString()}`,
      goalId: goal.id,
      goalName: goal.name,
      goalEmoji: goal.emoji,
      amount: amountToAdd,
      date: new Date().toISOString(),
      type: 'deposit',
    };
    setTransactions(prev => [...prev, newTransaction]);
    alert(`₹${amountToAdd.toFixed(2)} has been added to your "${goal.name}" goal!`);
  };

  const Onboarding = () => (
    <form onSubmit={(e) => { 
        e.preventDefault(); 
        const form = e.target as HTMLFormElement;
        const allowance = parseFloat(form.allowance.value);
        const spendingTarget = parseFloat(form.spendingTarget.value);
        if (spendingTarget > allowance) {
            alert("Your spending target cannot be greater than your total allowance.");
            return;
        }
        setMonthlyAllowance(allowance);
        setMonthlySpendingTarget(spendingTarget);
    }} className="flex flex-col items-center max-w-sm mx-auto space-y-4">
        <div>
            <label className="text-lg text-slate-300 mb-2 block text-center">Enter your total monthly allowance (in ₹):</label>
            <input type="number" name="allowance" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl" placeholder="20000" required />
        </div>
        <div>
            <label className="text-lg text-slate-300 mb-2 block text-center">How much of that do you want to spend? (Your Spending Target)</label>
            <input type="number" name="spendingTarget" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl" placeholder="12000" required />
            <p className="text-xs text-slate-500 mt-1 text-center">The rest will go into your Personal Savings Pot.</p>
        </div>
        <button type="submit" className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Get Started
        </button>
    </form>
  );

  if (monthlyAllowance === null || monthlySpendingTarget === null) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2 text-white">Welcome to SmartSave</h1>
                <p className="text-slate-400 mb-6">Let's set up your monthly budget.</p>
                <Onboarding />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {/* Dashboard Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Remaining Spending Money</h4>
            <p className={`text-3xl font-bold ${remainingSpendingMoney >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{remainingSpendingMoney.toFixed(2)}</p>
            <p className="text-xs text-slate-500">from ₹{monthlySpendingTarget.toFixed(2)} target</p>
          </div>
           <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Personal Savings Pot</h4>
            <p className="text-3xl font-bold text-sky-400">₹{availablePersonalSavings.toFixed(2)}</p>
            <p className="text-xs text-slate-500">available for goals</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-lg">
            <h4 className="text-slate-400 text-sm">Total Saved in Goals</h4>
            <p className="text-3xl font-bold text-indigo-400">₹{totalSavedInGoals.toFixed(2)}</p>
             <p className="text-xs text-slate-500">across all goals</p>
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
        
        <div className="mb-8">
            <ExpenseTracker expenses={expenses} spendingTarget={monthlySpendingTarget} />
        </div>

        {recurringExpenses.length > 0 && (
             <div className="mb-12">
                <RecurringExpensesManager recurringExpenses={recurringExpenses} onDelete={handleDeleteRecurringExpense} />
             </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Savings Goals</h2>
        </div>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onWithdrawClick={handleWithdrawClick} onContributeClick={handleContributeToGoal} />
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