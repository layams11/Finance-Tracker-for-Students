import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import AddGoalModal from './components/AddGoalModal';
import WithdrawModal from './components/WithdrawModal';
import AddExpenseModal from './components/AddExpenseModal';
import useLocalStorage from './hooks/useLocalStorage';
import type { Goal, Transaction, Expense, RecurringExpense, Page } from './types';
import { getFinancialInsights } from './services/geminiService';

const App: React.FC = () => {
  const [monthlyAllowance, setMonthlyAllowance] = useLocalStorage<number | null>( 'monthlyAllowance', null);
  const [monthlySpendingTarget, setMonthlySpendingTarget] = useLocalStorage<number | null>('monthlySpendingTarget', null);
  
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [recurringExpenses, setRecurringExpenses] = useLocalStorage<RecurringExpense[]>('recurringExpenses', []);
  const [lastRecurringCheck, setLastRecurringCheck] = useLocalStorage<string>('lastRecurringCheck', '');
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

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

  const contributionsThisMonth = useMemo(() => {
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
  
  const personalSavingsPot = (monthlyAllowance || 0) - (monthlySpendingTarget || 0);
  const savingsLeftToAllocate = personalSavingsPot - contributionsThisMonth;
  const remainingSpendingMoney = (monthlySpendingTarget || 0) - totalExpenses;
  
  const fetchInsights = useCallback(async () => {
    if (monthlyAllowance === null || monthlySpendingTarget === null) return;
    setIsInsightLoading(true);
    const newInsight = await getFinancialInsights(goals, transactions, expenses, monthlyAllowance, monthlySpendingTarget, contributionsThisMonth);
    setInsight(newInsight);
    setIsInsightLoading(false);
  }, [goals, transactions, expenses, monthlyAllowance, monthlySpendingTarget, contributionsThisMonth]);

  useEffect(() => {
    if(monthlyAllowance !== null) {
        fetchInsights();
    }
  }, [monthlyAllowance, goals, transactions, expenses, fetchInsights]); 

  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'savedAmount'>) => {
    if (newGoalData.monthlyContribution > savingsLeftToAllocate) {
      if (!window.confirm("This contribution is higher than your available savings for the month. Add anyway?")) {
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
  
  const handleDeleteGoal = (goalId: string) => {
      if(window.confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
          setGoals(prev => prev.filter(g => g.id !== goalId));
          // Optional: also delete related transactions
          // setTransactions(prev => prev.filter(t => t.goalId !== goalId));
      }
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
    
    if (amountToAdd > savingsLeftToAllocate) {
        if (!window.confirm("You don't have enough in your savings pot for this contribution. Proceed anyway?")) {
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
  
  const handleUpdateBudget = (newAllowance: number, newSpendingTarget: number) => {
      if (newSpendingTarget > newAllowance) {
          alert("Your spending target cannot be greater than your total allowance.");
          return;
      }
      setMonthlyAllowance(newAllowance);
      setMonthlySpendingTarget(newSpendingTarget);
      alert("Budget updated successfully!");
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage 
                    remainingSpendingMoney={remainingSpendingMoney}
                    monthlySpendingTarget={monthlySpendingTarget || 0}
                    savingsLeftToAllocate={savingsLeftToAllocate}
                    personalSavingsPot={personalSavingsPot}
                    totalSavedInGoals={totalSavedInGoals}
                    goals={goals}
                    insight={insight}
                    fetchInsights={fetchInsights}
                    isInsightLoading={isInsightLoading}
                    setIsAddExpenseModalOpen={setIsAddExpenseModalOpen}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                    expenses={expenses}
                />;
      case 'goals':
        return <GoalsPage 
                    goals={goals} 
                    onWithdrawClick={handleWithdrawClick} 
                    onContributeClick={handleContributeToGoal} 
                    onDeleteGoal={handleDeleteGoal}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} goals={goals} />;
      case 'insights':
        return <InsightsPage expenses={expenses} goals={goals} insight={insight} isInsightLoading={isInsightLoading} onRefresh={fetchInsights} />;
      case 'settings':
        return <SettingsPage 
                    monthlyAllowance={monthlyAllowance || 0}
                    monthlySpendingTarget={monthlySpendingTarget || 0}
                    onUpdateBudget={handleUpdateBudget}
                    recurringExpenses={recurringExpenses}
                    onDeleteRecurringExpense={handleDeleteRecurringExpense}
                />;
      default:
        return <HomePage 
                    remainingSpendingMoney={remainingSpendingMoney}
                    monthlySpendingTarget={monthlySpendingTarget || 0}
                    savingsLeftToAllocate={savingsLeftToAllocate}
                    personalSavingsPot={personalSavingsPot}
                    totalSavedInGoals={totalSavedInGoals}
                    goals={goals}
                    insight={insight}
                    fetchInsights={fetchInsights}
                    isInsightLoading={isInsightLoading}
                    setIsAddExpenseModalOpen={setIsAddExpenseModalOpen}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                    expenses={expenses}
                />;
    }
  };

  const Onboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-950 p-4">
        <div className="w-full max-w-sm mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
                 <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-3xl">S</div>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-white">Welcome to SmartSave</h1>
            <p className="text-slate-400 mb-8">Let's set up your monthly budget to get started.</p>
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
            }} className="space-y-6">
                <div>
                    <label className="text-lg text-slate-300 mb-2 block">Your total monthly allowance (in ₹)</label>
                    <input type="number" name="allowance" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="20000" required />
                </div>
                <div>
                    <label className="text-lg text-slate-300 mb-2 block">How much do you want to spend? (Spending Target)</label>
                    <input type="number" name="spendingTarget" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="12000" required />
                    <p className="text-xs text-slate-500 mt-2">The rest automatically goes into your Personal Savings Pot for goals.</p>
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                    Get Started
                </button>
            </form>
        </div>
    </div>
  );

  if (monthlyAllowance === null || monthlySpendingTarget === null) {
    return <Onboarding />;
  }

  return (
    <div className="md:flex h-screen w-full bg-blue-950">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 mb-16 md:mb-0">
          {renderPage()}
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